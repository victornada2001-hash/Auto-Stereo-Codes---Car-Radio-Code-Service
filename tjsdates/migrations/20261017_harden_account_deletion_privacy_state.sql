alter table public.account_deletion_requests add column if not exists was_paused boolean;
alter table public.account_deletion_requests add column if not exists was_discoverable boolean;

create or replace function public.request_account_deletion(p_reason text default null)
returns table(status text, requested_at timestamptz, scheduled_for timestamptz)
language plpgsql security definer set search_path='public'
as $$
declare uid uuid := auth.uid(); prev_paused boolean; prev_discoverable boolean; clean_reason text := nullif(trim(p_reason),'');
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if clean_reason is not null and length(clean_reason)>500 then raise exception 'reason_too_long'; end if;
  select p.is_paused,coalesce(v.discoverable,true) into prev_paused,prev_discoverable
  from public.profiles p left join public.profile_visibility v on v.user_id=p.id where p.id=uid;
  if prev_paused is null then raise exception 'profile_unavailable'; end if;
  insert into public.account_deletion_requests(user_id,reason,status,requested_at,scheduled_for,cancelled_at,processed_at,attempt_count,last_attempt_at,last_error,was_paused,was_discoverable)
  values(uid,clean_reason,'pending',now(),now()+interval '7 days',null,null,0,null,null,prev_paused,prev_discoverable)
  on conflict(user_id) do update set reason=excluded.reason,status='pending',requested_at=now(),scheduled_for=now()+interval '7 days',cancelled_at=null,processed_at=null,attempt_count=0,last_attempt_at=null,last_error=null,
    was_paused=case when public.account_deletion_requests.status='pending' then public.account_deletion_requests.was_paused else excluded.was_paused end,
    was_discoverable=case when public.account_deletion_requests.status='pending' then public.account_deletion_requests.was_discoverable else excluded.was_discoverable end;
  update public.profiles set is_paused=true,updated_at=now() where id=uid;
  insert into public.profile_visibility(user_id,discoverable,updated_at) values(uid,false,now())
  on conflict(user_id) do update set discoverable=false,updated_at=now();
  return query select r.status,r.requested_at,r.scheduled_for from public.account_deletion_requests r where r.user_id=uid;
end;$$;

create or replace function public.cancel_account_deletion()
returns void language plpgsql security definer set search_path='public'
as $$
declare uid uuid := auth.uid(); req public.account_deletion_requests%rowtype; state text;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  select * into req from public.account_deletion_requests where user_id=uid for update;
  if req.user_id is null or req.status<>'pending' then raise exception 'no_pending_deletion'; end if;
  if now()>=req.scheduled_for then raise exception 'grace_period_expired'; end if;
  select account_state into state from public.profiles where id=uid;
  update public.account_deletion_requests set status='cancelled',cancelled_at=now(),last_error=null where user_id=uid and status='pending';
  update public.profiles set is_paused=case when state='active' then coalesce(req.was_paused,false) else true end,updated_at=now() where id=uid;
  update public.profile_visibility set discoverable=case when state='active' then coalesce(req.was_discoverable,true) else false end,updated_at=now() where user_id=uid;
end;$$;

create or replace function public.update_my_privacy_settings(p_is_paused boolean,p_show_age boolean,p_show_distance boolean,p_show_orientation boolean,p_show_gender boolean,p_show_work boolean,p_show_school boolean,p_show_recent_activity boolean,p_discoverable boolean,p_invisible_mode boolean)
returns void language plpgsql security definer set search_path='public'
as $$
declare uid uuid := auth.uid(); deletion_pending boolean; state text;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  select account_state into state from public.profiles where id=uid;
  if state is null then raise exception 'profile_unavailable'; end if;
  select exists(select 1 from public.account_deletion_requests r where r.user_id=uid and r.status='pending') into deletion_pending;
  update public.profiles set is_paused=case when deletion_pending or state<>'active' then true else coalesce(p_is_paused,false) end,updated_at=now() where id=uid;
  insert into public.profile_visibility(user_id,show_age,show_distance,show_orientation,show_gender,show_work,show_school,show_recent_activity,discoverable,invisible_mode,updated_at)
  values(uid,coalesce(p_show_age,true),coalesce(p_show_distance,true),coalesce(p_show_orientation,false),coalesce(p_show_gender,true),coalesce(p_show_work,true),coalesce(p_show_school,true),coalesce(p_show_recent_activity,true),case when deletion_pending or state<>'active' then false else coalesce(p_discoverable,true) end,coalesce(p_invisible_mode,false),now())
  on conflict(user_id) do update set show_age=excluded.show_age,show_distance=excluded.show_distance,show_orientation=excluded.show_orientation,show_gender=excluded.show_gender,show_work=excluded.show_work,show_school=excluded.show_school,show_recent_activity=excluded.show_recent_activity,discoverable=excluded.discoverable,invisible_mode=excluded.invisible_mode,updated_at=now();
end;$$;

create or replace function public.get_my_consents()
returns table(consent_type text,document_version text,granted boolean,created_at timestamptz)
language sql stable security definer set search_path='public'
as $$select c.consent_type,c.document_version,c.granted,c.created_at from public.consents c where c.user_id=auth.uid() order by c.created_at desc;$$;

revoke all on function public.get_my_consents() from public,anon;
grant execute on function public.get_my_consents() to authenticated;
revoke all on function public.request_account_deletion(text) from public,anon;
grant execute on function public.request_account_deletion(text) to authenticated;
revoke all on function public.cancel_account_deletion() from public,anon;
grant execute on function public.cancel_account_deletion() to authenticated;
revoke all on function public.update_my_privacy_settings(boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean) from public,anon;
grant execute on function public.update_my_privacy_settings(boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean) to authenticated;
