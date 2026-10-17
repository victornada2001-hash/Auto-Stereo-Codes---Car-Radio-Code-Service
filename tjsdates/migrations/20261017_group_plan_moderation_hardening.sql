create or replace function public.get_group_members(group_uuid uuid)
returns table(user_id uuid, display_name text, is_owner boolean)
language sql stable security definer set search_path='public'
as $$
  select gm.user_id,p.display_name,(g.owner_id=gm.user_id) as is_owner
  from public.groups g
  join public.group_members gm on gm.group_id=g.id
  join public.profiles p on p.id=gm.user_id
  where g.id=group_uuid
    and auth.uid() is not null
    and exists(select 1 from public.profiles me where me.id=auth.uid() and me.is_active and coalesce(me.account_state,'active')='active')
    and (g.owner_id=auth.uid() or exists(select 1 from public.group_members mine where mine.group_id=g.id and mine.user_id=auth.uid()))
    and p.is_active and coalesce(p.account_state,'active')='active'
  order by (g.owner_id=gm.user_id) desc, lower(coalesce(p.display_name,''));
$$;
revoke execute on function public.get_group_members(uuid) from public,anon;
grant execute on function public.get_group_members(uuid) to authenticated,service_role;

create or replace function public.remove_group_member(group_uuid uuid,target_user uuid)
returns void language plpgsql security definer set search_path='public'
as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if target_user is null or target_user=auth.uid() then raise exception 'invalid target'; end if;
  if not exists(select 1 from public.groups g where g.id=group_uuid and g.owner_id=auth.uid() and g.status='active') then raise exception 'not owner or plan unavailable'; end if;
  if exists(select 1 from public.groups g where g.id=group_uuid and g.owner_id=target_user) then raise exception 'cannot remove owner'; end if;
  delete from public.group_members where group_id=group_uuid and user_id=target_user;
  select conversation_id into cid from public.group_conversations where group_id=group_uuid;
  if cid is not null then update public.conversation_members set left_at=coalesce(left_at,now()) where conversation_id=cid and user_id=target_user; end if;
end;
$$;
revoke execute on function public.remove_group_member(uuid,uuid) from public,anon;
grant execute on function public.remove_group_member(uuid,uuid) to authenticated,service_role;

create or replace function public.report_group_plan(group_uuid uuid, report_reason text, report_comment text default null)
returns uuid language plpgsql security definer set search_path='public'
as $$
declare rid uuid; owner_uid uuid; plan_title text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select g.owner_id,g.title into owner_uid,plan_title from public.groups g where g.id=group_uuid;
  if owner_uid is null then raise exception 'group unavailable'; end if;
  if owner_uid=auth.uid() then raise exception 'cannot report own plan'; end if;
  rid:=public.create_report(owner_uid,report_reason,left('Plan '||group_uuid::text||' — '||coalesce(plan_title,'')||case when nullif(trim(coalesce(report_comment,'')),'') is not null then E'\n'||trim(report_comment) else '' end,2000));
  return rid;
end;
$$;
revoke execute on function public.report_group_plan(uuid,text,text) from public,anon;
grant execute on function public.report_group_plan(uuid,text,text) to authenticated,service_role;

create or replace function public.get_conversation_messages(cid uuid, lim integer default 100)
returns table(id uuid, sender_id uuid, sender_name text, body text, attachment_path text, reply_to_id uuid, created_at timestamptz)
language sql stable security definer set search_path='public'
as $$
  select m.id,m.sender_id,p.display_name,m.body,m.attachment_path,m.reply_to_id,m.created_at
  from public.messages m
  left join public.profiles p on p.id=m.sender_id
  where m.conversation_id=cid
    and public.is_conversation_member(cid)
    and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=m.sender_id) or (b.blocker_id=m.sender_id and b.blocked_id=auth.uid()))
  order by m.created_at asc
  limit least(greatest(lim,1),200)
$$;
revoke execute on function public.get_conversation_messages(uuid,integer) from public,anon;
grant execute on function public.get_conversation_messages(uuid,integer) to authenticated,service_role;

drop policy if exists messages_members_read on public.messages;
create policy messages_members_read on public.messages for select to authenticated
using (is_admin(array['superadmin','moderator']) or (public.is_conversation_member(conversation_id) and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=messages.sender_id) or (b.blocker_id=messages.sender_id and b.blocked_id=auth.uid()))));

drop policy if exists group_conversations_members_read on public.group_conversations;
create policy group_conversations_members_read on public.group_conversations for select to authenticated
using (exists(select 1 from public.groups g join public.profiles owner_p on owner_p.id=g.owner_id where g.id=group_conversations.group_id and g.status='active' and owner_p.is_active and coalesce(owner_p.account_state,'active')='active' and (g.owner_id=auth.uid() or exists(select 1 from public.group_members gm where gm.group_id=g.id and gm.user_id=auth.uid()))));

create or replace function public.admin_set_account_state(target_user uuid, new_state text, reason text default null, until_at timestamptz default null)
returns void language plpgsql security definer set search_path='public'
as $$
declare actor_role text; target_role text; actor_rank int; target_rank int; cid uuid;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  select role into actor_role from public.admin_users where user_id=auth.uid() and active limit 1;
  if actor_role not in ('superadmin','admin','moderator') then raise exception 'forbidden'; end if;
  if target_user is null or target_user=auth.uid() then raise exception 'invalid_target'; end if;
  if new_state not in ('active','suspended','banned') then raise exception 'invalid state'; end if;
  select role into target_role from public.admin_users where user_id=target_user and active limit 1;
  actor_rank:=case actor_role when 'superadmin' then 3 when 'admin' then 2 when 'moderator' then 1 else 0 end;
  target_rank:=case target_role when 'superadmin' then 3 when 'admin' then 2 when 'moderator' then 1 when 'support' then 1 else 0 end;
  if target_role is not null and actor_rank<=target_rank then raise exception 'cannot_moderate_equal_or_higher_admin'; end if;
  update public.profiles set account_state=new_state,suspension_reason=case when new_state='active' then null else left(reason,500) end,suspended_until=case when new_state='suspended' then until_at else null end,is_active=case when new_state='banned' then false else true end,is_paused=case when new_state='active' then false else true end,updated_at=now() where id=target_user;
  if not found then raise exception 'user not found'; end if;
  if new_state in ('suspended','banned') then
    update public.groups set status='closed' where owner_id=target_user and status='active';
    for cid in select gc.conversation_id from public.group_conversations gc join public.groups g on g.id=gc.group_id where g.owner_id=target_user loop
      update public.conversation_members set left_at=coalesce(left_at,now()) where conversation_id=cid;
    end loop;
  end if;
  insert into public.moderation_actions(admin_user_id,target_user_id,action,reason,expires_at) values(auth.uid(),target_user,'account_'||new_state,left(reason,500),until_at);
end;
$$;
revoke execute on function public.admin_set_account_state(uuid,text,text,timestamptz) from public,anon;
grant execute on function public.admin_set_account_state(uuid,text,text,timestamptz) to authenticated,service_role;
