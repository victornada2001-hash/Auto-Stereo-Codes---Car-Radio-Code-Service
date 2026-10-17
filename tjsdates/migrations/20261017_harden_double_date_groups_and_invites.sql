alter table public.couple_invites alter column token set default upper(substr(replace(gen_random_uuid()::text,'-',''),1,16));

create or replace function public.create_double_date_invite()
returns text language plpgsql security definer set search_path='public' as $$
declare cid uuid; tok text;
begin
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 perform public.check_rate_limit('double_date_invite_create',10,3600);
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and not p.is_paused and coalesce(p.account_state,'active')='active' and p.onboarding_complete) then raise exception 'account unavailable'; end if;
 if exists(select 1 from public.couples where status='active' and partner_id is not null and (created_by=auth.uid() or partner_id=auth.uid())) then raise exception 'you already belong to an active pair'; end if;
 select id into cid from public.couples where created_by=auth.uid() and status='pending' and partner_id is null order by created_at desc limit 1;
 if cid is null then insert into public.couples(created_by,status) values(auth.uid(),'pending') returning id into cid; end if;
 delete from public.couple_invites where couple_id=cid and accepted_at is null;
 tok:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,16));
 insert into public.couple_invites(couple_id,inviter_id,token) values(cid,auth.uid(),tok);
 return tok;
end;$$;
revoke all on function public.create_double_date_invite() from public, anon;
grant execute on function public.create_double_date_invite() to authenticated, service_role;

create or replace function public.accept_double_date_invite(invite_token text)
returns uuid language plpgsql security definer set search_path='public' as $$
declare inv public.couple_invites%rowtype; c public.couples%rowtype;
begin
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 perform public.check_rate_limit('double_date_invite_accept',20,3600);
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and not p.is_paused and coalesce(p.account_state,'active')='active' and p.onboarding_complete) then raise exception 'account unavailable'; end if;
 select * into inv from public.couple_invites where token=upper(trim(invite_token)) and accepted_at is null and expires_at>now() for update;
 if not found then raise exception 'invalid or expired invite'; end if;
 if inv.inviter_id=auth.uid() then raise exception 'cannot accept your own invite'; end if;
 if not exists(select 1 from public.profiles p where p.id=inv.inviter_id and p.is_active and not p.is_paused and coalesce(p.account_state,'active')='active' and p.onboarding_complete) then raise exception 'inviter unavailable'; end if;
 if exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=inv.inviter_id) or (b.blocker_id=inv.inviter_id and b.blocked_id=auth.uid())) then raise exception 'interaction not allowed'; end if;
 select * into c from public.couples where id=inv.couple_id for update;
 if not found or c.status<>'pending' or c.partner_id is not null or c.created_by<>inv.inviter_id then raise exception 'invite unavailable'; end if;
 if exists(select 1 from public.couples where (created_by=auth.uid() or partner_id=auth.uid()) and status='active') then raise exception 'you already belong to an active pair'; end if;
 update public.couples set partner_id=auth.uid(),status='active' where id=inv.couple_id;
 update public.couple_invites set accepted_at=now() where id=inv.id;
 return inv.couple_id;
end;$$;
revoke all on function public.accept_double_date_invite(text) from public, anon;
grant execute on function public.accept_double_date_invite(text) to authenticated, service_role;

create or replace function public.create_group_plan(p_title text,p_description text,p_city text,p_starts_at timestamptz,p_max_members smallint default 8)
returns uuid language plpgsql security definer set search_path='public' as $$
declare gid uuid; cid uuid;
begin
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 perform public.check_rate_limit('group_create',12,3600);
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and not p.is_paused and coalesce(p.account_state,'active')='active' and p.onboarding_complete) then raise exception 'account unavailable'; end if;
 if length(trim(p_title))<3 then raise exception 'title too short'; end if;
 if p_city not in ('Tijuana','San Diego') then raise exception 'invalid city'; end if;
 if p_starts_at<=now() then raise exception 'start time must be future'; end if;
 insert into public.groups(owner_id,title,description,city,starts_at,max_members,status) values(auth.uid(),left(trim(p_title),100),left(coalesce(trim(p_description),''),500),p_city,p_starts_at,least(greatest(p_max_members,2),30),'active') returning id into gid;
 insert into public.group_members(group_id,user_id) values(gid,auth.uid()) on conflict do nothing;
 insert into public.conversations(kind) values('group') returning id into cid;
 insert into public.group_conversations(group_id,conversation_id) values(gid,cid);
 insert into public.conversation_members(conversation_id,user_id) values(cid,auth.uid()) on conflict do nothing;
 return gid;
end;$$;
revoke all on function public.create_group_plan(text,text,text,timestamptz,smallint) from public, anon;
grant execute on function public.create_group_plan(text,text,text,timestamptz,smallint) to authenticated, service_role;

create or replace function public.join_group(group_uuid uuid)
returns void language plpgsql security definer set search_path='public' as $$
declare g public.groups%rowtype; n int; cid uuid;
begin
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 perform public.check_rate_limit('group_join',60,3600);
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and not p.is_paused and coalesce(p.account_state,'active')='active' and p.onboarding_complete) then raise exception 'account unavailable'; end if;
 select * into g from public.groups where id=group_uuid for update;
 if not found or g.status<>'active' or g.starts_at<=now() then raise exception 'group unavailable'; end if;
 if exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=g.owner_id) or (b.blocker_id=g.owner_id and b.blocked_id=auth.uid())) then raise exception 'interaction not allowed'; end if;
 if not exists(select 1 from public.profiles p where p.id=g.owner_id and p.is_active and coalesce(p.account_state,'active')='active') then raise exception 'group unavailable'; end if;
 select count(*) into n from public.group_members where group_id=group_uuid;
 if n>=g.max_members and not exists(select 1 from public.group_members where group_id=group_uuid and user_id=auth.uid()) then raise exception 'group full'; end if;
 insert into public.group_members(group_id,user_id) values(group_uuid,auth.uid()) on conflict do nothing;
 select conversation_id into cid from public.group_conversations where group_id=group_uuid;
 if cid is not null then insert into public.conversation_members(conversation_id,user_id,left_at) values(cid,auth.uid(),null) on conflict(conversation_id,user_id) do update set left_at=null; end if;
end;$$;
revoke all on function public.join_group(uuid) from public, anon;
grant execute on function public.join_group(uuid) to authenticated, service_role;

create or replace function public.get_group_plans(plan_limit integer default 50)
returns table(id uuid,owner_id uuid,title text,description text,city text,starts_at timestamptz,max_members smallint,member_count integer,joined boolean,is_owner boolean,conversation_id uuid)
language sql stable security definer set search_path='public' as $$
 select g.id,g.owner_id,g.title,g.description,g.city,g.starts_at,g.max_members,
 (select count(*)::int from public.group_members gm where gm.group_id=g.id),
 exists(select 1 from public.group_members gm where gm.group_id=g.id and gm.user_id=auth.uid()),
 g.owner_id=auth.uid(),gc.conversation_id
 from public.groups g join public.profiles owner on owner.id=g.owner_id left join public.group_conversations gc on gc.group_id=g.id
 where exists(select 1 from public.profiles me where me.id=auth.uid() and me.is_active and not me.is_paused and coalesce(me.account_state,'active')='active' and me.onboarding_complete)
 and g.status='active' and g.starts_at>=now() and owner.is_active and coalesce(owner.account_state,'active')='active'
 and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=g.owner_id) or (b.blocker_id=g.owner_id and b.blocked_id=auth.uid()))
 order by g.starts_at asc limit least(greatest(plan_limit,1),100)
$$;
revoke all on function public.get_group_plans(integer) from public, anon;
grant execute on function public.get_group_plans(integer) to authenticated, service_role;

create or replace function public.get_group_conversation(group_uuid uuid)
returns uuid language sql stable security definer set search_path='public' as $$
 select gc.conversation_id from public.group_conversations gc join public.groups g on g.id=gc.group_id
 where gc.group_id=group_uuid and g.status='active'
 and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and not p.is_paused and coalesce(p.account_state,'active')='active')
 and exists(select 1 from public.group_members gm where gm.group_id=group_uuid and gm.user_id=auth.uid()) limit 1
$$;
revoke all on function public.get_group_conversation(uuid) from public, anon;
grant execute on function public.get_group_conversation(uuid) to authenticated, service_role;

create or replace function public.like_double_date(target_couple uuid)
returns table(is_match boolean,couple_match_id uuid,conversation_id uuid)
language plpgsql security definer set search_path='public' as $$
declare mine uuid; a uuid; b uuid; cmid uuid; cid uuid; u uuid;
begin
 if auth.uid() is null then raise exception 'unauthenticated'; end if;
 perform public.check_rate_limit('double_date_like',120,3600);
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_active and not p.is_paused and coalesce(p.account_state,'active')='active' and p.onboarding_complete) then raise exception 'account unavailable'; end if;
 select c.id into mine from public.couples c join public.profiles p1 on p1.id=c.created_by join public.profiles p2 on p2.id=c.partner_id
 where c.status='active' and (c.created_by=auth.uid() or c.partner_id=auth.uid())
 and p1.is_active and not p1.is_paused and coalesce(p1.account_state,'active')='active' and p1.onboarding_complete
 and p2.is_active and not p2.is_paused and coalesce(p2.account_state,'active')='active' and p2.onboarding_complete
 order by c.created_at desc limit 1;
 if mine is null then raise exception 'active double date pair required'; end if;
 if target_couple=mine then raise exception 'invalid target'; end if;
 if not exists(select 1 from public.couples c join public.profiles p1 on p1.id=c.created_by join public.profile_visibility v1 on v1.user_id=p1.id join public.profiles p2 on p2.id=c.partner_id join public.profile_visibility v2 on v2.user_id=p2.id where c.id=target_couple and c.status='active' and c.partner_id is not null and p1.is_active and not p1.is_paused and coalesce(p1.account_state,'active')='active' and p1.onboarding_complete and v1.discoverable and not coalesce(v1.invisible_mode,false) and p2.is_active and not p2.is_paused and coalesce(p2.account_state,'active')='active' and p2.onboarding_complete and v2.discoverable and not coalesce(v2.invisible_mode,false)) then raise exception 'target pair unavailable'; end if;
 if exists(select 1 from public.blocks bl where bl.blocker_id in (select created_by from public.couples where id=mine union select partner_id from public.couples where id=mine) and bl.blocked_id in (select created_by from public.couples where id=target_couple union select partner_id from public.couples where id=target_couple)
 union all select 1 from public.blocks bl where bl.blocker_id in (select created_by from public.couples where id=target_couple union select partner_id from public.couples where id=target_couple) and bl.blocked_id in (select created_by from public.couples where id=mine union select partner_id from public.couples where id=mine)) then raise exception 'interaction not allowed'; end if;
 insert into public.couple_likes(from_couple_id,to_couple_id,created_by) values(mine,target_couple,auth.uid()) on conflict(from_couple_id,to_couple_id) do nothing;
 if not exists(select 1 from public.couple_likes where from_couple_id=target_couple and to_couple_id=mine) then return query select false,null::uuid,null::uuid; return; end if;
 a:=least(mine,target_couple); b:=greatest(mine,target_couple);
 insert into public.couple_matches(couple_low,couple_high) values(a,b) on conflict(couple_low,couple_high) do update set couple_low=excluded.couple_low returning id into cmid;
 select cmc.conversation_id into cid from public.couple_match_conversations cmc where cmc.couple_match_id=cmid;
 if cid is null then insert into public.conversations(kind) values('double_date') returning id into cid; insert into public.couple_match_conversations(couple_match_id,conversation_id) values(cmid,cid); end if;
 for u in select created_by from public.couples where id in (mine,target_couple) union select partner_id from public.couples where id in (mine,target_couple) and partner_id is not null loop
  insert into public.conversation_members(conversation_id,user_id,left_at) values(cid,u,null) on conflict(conversation_id,user_id) do update set left_at=null;
 end loop;
 return query select true,cmid,cid;
end;$$;
revoke all on function public.like_double_date(uuid) from public, anon;
grant execute on function public.like_double_date(uuid) to authenticated, service_role;
