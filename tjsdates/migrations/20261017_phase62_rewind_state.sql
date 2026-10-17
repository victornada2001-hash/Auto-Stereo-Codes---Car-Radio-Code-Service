-- Phase 62: restore Rewind state safely after reloads.
create or replace function public.get_my_rewind_state()
returns jsonb
language plpgsql
stable
security definer
set search_path='public'
as $$
declare
  me uuid:=auth.uid();
  rank_now int:=0;
  latest_target uuid;
  latest_type text;
  latest_at timestamptz;
  has_match boolean:=false;
  reason text:='ready';
begin
  if me is null then raise exception 'unauthenticated'; end if;
  select coalesce(public.current_plan_rank(),0) into rank_now;

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

  if latest_target is null then
    return jsonb_build_object('target_user',null,'decision_type',null,'decided_at',null,'can_rewind',false,'reason','empty','plan_rank',rank_now);
  end if;

  if latest_type='like' then
    select exists(
      select 1 from public.matches m
      where m.user_low=least(me,latest_target)
        and m.user_high=greatest(me,latest_target)
        and m.status='active'
    ) into has_match;
  end if;

  if rank_now<1 then reason:='plan_required';
  elsif has_match then reason:='match_created';
  elsif latest_at<now()-interval '30 minutes' then reason:='expired';
  else reason:='ready';
  end if;

  return jsonb_build_object(
    'target_user',latest_target,
    'decision_type',latest_type,
    'decided_at',latest_at,
    'can_rewind',reason='ready',
    'reason',reason,
    'plan_rank',rank_now
  );
end;
$$;

revoke all on function public.get_my_rewind_state() from public,anon;
grant execute on function public.get_my_rewind_state() to authenticated;
