alter table public.profiles add column if not exists account_state text not null default 'active';
alter table public.profiles add column if not exists suspension_reason text;
alter table public.profiles add column if not exists suspended_until timestamptz;
do $$ begin
  alter table public.profiles add constraint profiles_account_state_check check (account_state in ('active','suspended','banned'));
exception when duplicate_object then null; end $$;

revoke update(account_state,suspension_reason,suspended_until) on public.profiles from authenticated, anon;

create or replace function public.get_my_account_state()
returns table(account_state text, suspension_reason text, suspended_until timestamptz, is_paused boolean, is_active boolean)
language sql security definer set search_path=public as $$
  select p.account_state,p.suspension_reason,p.suspended_until,p.is_paused,p.is_active
  from public.profiles p where p.id=auth.uid();
$$;
revoke all on function public.get_my_account_state() from public, anon;
grant execute on function public.get_my_account_state() to authenticated;

create or replace function public.admin_set_account_state(target_user uuid, new_state text, reason text default null, until_at timestamptz default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin(array['superadmin','admin','moderator']) then raise exception 'forbidden'; end if;
  if new_state not in ('active','suspended','banned') then raise exception 'invalid state'; end if;
  update public.profiles
  set account_state=new_state,
      suspension_reason=case when new_state='active' then null else left(reason,500) end,
      suspended_until=case when new_state='suspended' then until_at else null end,
      is_active=case when new_state='banned' then false else true end,
      is_paused=case when new_state='active' then false else true end,
      updated_at=now()
  where id=target_user;
  if not found then raise exception 'user not found'; end if;
  insert into public.moderation_actions(admin_user_id,target_user_id,action,reason,expires_at)
  values(auth.uid(),target_user,'account_'||new_state,left(reason,500),until_at);
end $$;
revoke all on function public.admin_set_account_state(uuid,text,text,timestamptz) from public, anon;
grant execute on function public.admin_set_account_state(uuid,text,text,timestamptz) to authenticated;

create or replace function public.admin_recent_actions(lim integer default 50)
returns table(id uuid,target_user_id uuid,display_name text,action text,reason text,expires_at timestamptz,created_at timestamptz,account_state text)
language sql security definer set search_path=public as $$
  select ma.id,ma.target_user_id,p.display_name,ma.action,ma.reason,ma.expires_at,ma.created_at,p.account_state
  from public.moderation_actions ma
  left join public.profiles p on p.id=ma.target_user_id
  where public.is_admin(array['superadmin','admin','moderator'])
  order by ma.created_at desc
  limit least(greatest(coalesce(lim,50),1),100);
$$;
revoke all on function public.admin_recent_actions(integer) from public, anon;
grant execute on function public.admin_recent_actions(integer) to authenticated;

create or replace function public.admin_resolve_report(report_uuid uuid, resolution text, note text default null)
returns void language plpgsql security definer set search_path=public as $$
declare target uuid;
begin
 if not public.is_admin(array['superadmin','admin','moderator']) then raise exception 'forbidden'; end if;
 if resolution not in ('dismissed','resolved','warned','suspended','banned') then raise exception 'invalid resolution'; end if;
 select reported_user_id into target from public.reports where id=report_uuid for update;
 if target is null then raise exception 'report not found'; end if;
 update public.reports set status=case when resolution='dismissed' then 'dismissed' else 'resolved' end,resolved_at=now() where id=report_uuid;
 if resolution='suspended' then
   update public.profiles set account_state='suspended',suspension_reason=left(note,500),is_paused=true,suspended_until=null where id=target;
 elsif resolution='banned' then
   update public.profiles set account_state='banned',suspension_reason=left(note,500),is_active=false,is_paused=true,suspended_until=null where id=target;
 end if;
 insert into public.moderation_actions(report_id,admin_user_id,target_user_id,action,reason)
 values(report_uuid,auth.uid(),target,resolution,left(note,500));
end $$;
revoke all on function public.admin_resolve_report(uuid,text,text) from public, anon;
grant execute on function public.admin_resolve_report(uuid,text,text) to authenticated;

create index if not exists moderation_actions_target_created_idx on public.moderation_actions(target_user_id,created_at desc);
create index if not exists profiles_account_state_idx on public.profiles(account_state) where account_state <> 'active';
