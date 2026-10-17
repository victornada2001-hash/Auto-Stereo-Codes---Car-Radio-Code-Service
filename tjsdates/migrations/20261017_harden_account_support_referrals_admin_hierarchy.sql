-- Harden support for restricted accounts, referrals, and admin moderation hierarchy.

-- Restricted accounts may still contact support for account/safety/technical/billing issues.
create or replace function public.create_support_ticket(p_category text, p_subject text, p_message text)
returns uuid language plpgsql security definer set search_path='public' as $$
declare uid uuid:=auth.uid(); ticket_id uuid; state text;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  select account_state into state from public.profiles where id=uid;
  if state is null then raise exception 'profile_unavailable'; end if;
  p_category:=lower(trim(coalesce(p_category,''))); p_subject:=trim(coalesce(p_subject,'')); p_message:=trim(coalesce(p_message,''));
  if p_category not in ('account','safety','verification','technical','billing','other') then raise exception 'invalid_category'; end if;
  if coalesce(state,'active')<>'active' and p_category not in ('account','safety','technical','billing') then raise exception 'category_unavailable_for_restricted_account'; end if;
  if length(p_subject)<4 or length(p_subject)>120 then raise exception 'invalid_subject'; end if;
  if length(p_message)<10 or length(p_message)>2000 then raise exception 'invalid_message'; end if;
  perform public.check_rate_limit('support_ticket_create',8,3600);
  insert into public.support_tickets(user_id,category,subject,message,status) values(uid,p_category,p_subject,p_message,'open') returning id into ticket_id;
  return ticket_id;
end; $$;

create or replace function public.get_or_create_my_referral_code()
returns text language plpgsql security definer set search_path='public' as $$
declare uid uuid:=auth.uid(); existing_code text; new_code text;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if not exists(select 1 from public.profiles p where p.id=uid and p.is_active and coalesce(p.account_state,'active')='active' and not p.is_paused and p.onboarding_complete) then raise exception 'account_restricted'; end if;
  perform public.check_rate_limit('referral_code_get',20,3600);
  select code into existing_code from public.referrals where referrer_id=uid and referred_id is null and status='pending' order by created_at desc limit 1;
  if existing_code is not null then return existing_code; end if;
  loop
    new_code:=upper(substr(encode(gen_random_bytes(10),'hex'),1,16));
    begin
      insert into public.referrals(referrer_id,code,status,reward_data) values(uid,new_code,'pending','{}'::jsonb);
      return new_code;
    exception when unique_violation then null;
    end;
  end loop;
end; $$;

create or replace function public.apply_referral_code(p_code text)
returns boolean language plpgsql security definer set search_path='public' as $$
declare uid uuid:=auth.uid(); target_id uuid; normalized text:=upper(trim(coalesce(p_code,'')));
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if not exists(select 1 from public.profiles p where p.id=uid and p.is_active and coalesce(p.account_state,'active')='active' and not p.is_paused and p.onboarding_complete) then raise exception 'account_restricted'; end if;
  perform public.check_rate_limit('referral_apply',20,3600);
  if length(normalized)<6 or length(normalized)>32 then raise exception 'invalid_referral_code'; end if;
  if exists(select 1 from public.referrals where referred_id=uid) then raise exception 'referral_already_used'; end if;
  select r.referrer_id into target_id from public.referrals r join public.profiles p on p.id=r.referrer_id
   where r.code=normalized and r.referred_id is null and r.status='pending' and p.is_active and coalesce(p.account_state,'active')='active' and not p.is_paused
   order by r.created_at desc limit 1 for update of r;
  if target_id is null then raise exception 'invalid_referral_code'; end if;
  if target_id=uid then raise exception 'self_referral_not_allowed'; end if;
  update public.referrals set referred_id=uid,status='completed' where referrer_id=target_id and code=normalized and referred_id is null and status='pending';
  if not found then raise exception 'referral_unavailable'; end if;
  return true;
end; $$;

-- Moderation hierarchy: nobody can moderate self; equal/higher active admin roles are protected.
create or replace function public.admin_set_account_state(target_user uuid,new_state text,reason text default null,until_at timestamptz default null)
returns void language plpgsql security definer set search_path='public' as $$
declare actor_role text; target_role text; actor_rank int; target_rank int;
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
  insert into public.moderation_actions(admin_user_id,target_user_id,action,reason,expires_at) values(auth.uid(),target_user,'account_'||new_state,left(reason,500),until_at);
end; $$;

create or replace function public.admin_resolve_report(report_uuid uuid,resolution text,note text default null)
returns void language plpgsql security definer set search_path='public' as $$
declare target uuid; actor_role text; target_role text; actor_rank int; target_rank int;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  select role into actor_role from public.admin_users where user_id=auth.uid() and active limit 1;
  if actor_role not in ('superadmin','admin','moderator') then raise exception 'forbidden'; end if;
  if resolution not in ('dismissed','resolved','warned','suspended','banned') then raise exception 'invalid resolution'; end if;
  select reported_user_id into target from public.reports where id=report_uuid for update;
  if target is null then raise exception 'report not found'; end if;
  if target=auth.uid() then raise exception 'invalid_target'; end if;
  select role into target_role from public.admin_users where user_id=target and active limit 1;
  actor_rank:=case actor_role when 'superadmin' then 3 when 'admin' then 2 when 'moderator' then 1 else 0 end;
  target_rank:=case target_role when 'superadmin' then 3 when 'admin' then 2 when 'moderator' then 1 when 'support' then 1 else 0 end;
  if target_role is not null and actor_rank<=target_rank then raise exception 'cannot_moderate_equal_or_higher_admin'; end if;
  update public.reports set status=case when resolution='dismissed' then 'dismissed' else 'resolved' end,resolved_at=now() where id=report_uuid;
  if resolution='suspended' then update public.profiles set account_state='suspended',suspension_reason=left(note,500),is_paused=true,suspended_until=null,updated_at=now() where id=target;
  elsif resolution='banned' then update public.profiles set account_state='banned',suspension_reason=left(note,500),is_active=false,is_paused=true,suspended_until=null,updated_at=now() where id=target; end if;
  insert into public.moderation_actions(report_id,admin_user_id,target_user_id,action,reason) values(report_uuid,auth.uid(),target,resolution,left(note,500));
end; $$;

revoke all on function public.create_support_ticket(text,text,text) from public,anon;
revoke all on function public.get_or_create_my_referral_code() from public,anon;
revoke all on function public.apply_referral_code(text) from public,anon;
revoke all on function public.admin_set_account_state(uuid,text,text,timestamptz) from public,anon;
revoke all on function public.admin_resolve_report(uuid,text,text) from public,anon;
grant execute on function public.create_support_ticket(text,text,text),public.get_or_create_my_referral_code(),public.apply_referral_code(text),public.admin_set_account_state(uuid,text,text,timestamptz),public.admin_resolve_report(uuid,text,text) to authenticated;
