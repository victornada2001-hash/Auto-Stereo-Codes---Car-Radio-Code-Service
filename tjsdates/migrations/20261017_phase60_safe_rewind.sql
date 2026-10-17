-- Phase 60: server-validated Rewind for the most recent profile decision.
create or replace function public.undo_last_profile_decision(target_user uuid, decision_type text)
returns boolean
language plpgsql
security definer
set search_path='public'
as $$
declare
  me uuid:=auth.uid();
  rank_now int:=0;
  latest_target uuid;
  latest_type text;
  latest_at timestamptz;
begin
  if me is null then raise exception 'unauthenticated'; end if;
  if target_user is null or target_user=me then raise exception 'invalid_target'; end if;
  if decision_type not in ('like','pass') then raise exception 'invalid_decision'; end if;

  select coalesce(public.current_plan_rank(),0) into rank_now;
  if rank_now<1 then raise exception 'rewind_requires_plus'; end if;

  select x.target_user,x.decision_type,x.created_at
    into latest_target,latest_type,latest_at
  from (
    select l.to_user_id as target_user,'like'::text as decision_type,l.created_at
      from public.likes l where l.from_user_id=me
    union all
    select p.to_user_id as target_user,'pass'::text as decision_type,p.created_at
      from public.passes p where p.from_user_id=me
  ) x
  order by x.created_at desc
  limit 1;

  if latest_target is null then raise exception 'nothing_to_rewind'; end if;
  if latest_target<>target_user or latest_type<>decision_type then raise exception 'not_latest_decision'; end if;
  if latest_at<now()-interval '30 minutes' then raise exception 'rewind_expired'; end if;

  if decision_type='like' then
    if exists(
      select 1 from public.matches m
      where m.user_low=least(me,target_user)
        and m.user_high=greatest(me,target_user)
        and m.status='active'
    ) then raise exception 'match_already_created'; end if;
    delete from public.likes
      where from_user_id=me and to_user_id=target_user and created_at=latest_at;
  else
    delete from public.passes
      where from_user_id=me and to_user_id=target_user and created_at=latest_at;
  end if;

  return found;
end;
$$;
revoke all on function public.undo_last_profile_decision(uuid,text) from public,anon;
grant execute on function public.undo_last_profile_decision(uuid,text) to authenticated;
