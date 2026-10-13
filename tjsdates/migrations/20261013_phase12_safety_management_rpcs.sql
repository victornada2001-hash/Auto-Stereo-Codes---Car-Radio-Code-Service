create or replace function public.get_my_blocks()
returns table(blocked_user_id uuid, display_name text, blocked_at timestamptz)
language sql
stable
security definer
set search_path='public'
as $$
  select b.blocked_id, coalesce(p.display_name,'Usuario'), b.created_at
  from public.blocks b
  left join public.profiles p on p.id=b.blocked_id
  where b.blocker_id=auth.uid()
  order by b.created_at desc;
$$;

create or replace function public.unblock_user(target_user uuid)
returns boolean
language plpgsql
security definer
set search_path='public'
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from public.blocks where blocker_id=auth.uid() and blocked_id=target_user;
  return found;
end;
$$;

create or replace function public.get_my_reports()
returns table(report_id uuid, reported_user_id uuid, display_name text, reason text, status text, risk_level text, created_at timestamptz, resolved_at timestamptz)
language sql
stable
security definer
set search_path='public'
as $$
  select r.id,r.reported_user_id,coalesce(p.display_name,'Usuario'),r.reason,r.status,r.risk_level,r.created_at,r.resolved_at
  from public.reports r
  left join public.profiles p on p.id=r.reported_user_id
  where r.reporter_id=auth.uid()
  order by r.created_at desc
  limit 100;
$$;

revoke all on function public.get_my_blocks() from public, anon;
revoke all on function public.unblock_user(uuid) from public, anon;
revoke all on function public.get_my_reports() from public, anon;
grant execute on function public.get_my_blocks() to authenticated;
grant execute on function public.unblock_user(uuid) to authenticated;
grant execute on function public.get_my_reports() to authenticated;
