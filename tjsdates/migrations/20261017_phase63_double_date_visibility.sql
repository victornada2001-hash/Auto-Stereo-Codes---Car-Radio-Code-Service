create or replace function public.get_double_date_candidates(candidate_limit integer default 20)
returns table(couple_id uuid, member_one_id uuid, member_one_name text, member_two_id uuid, member_two_name text, city text, verified_count integer)
language sql
stable security definer
set search_path to 'public'
as $$
  with mine as (
    select id from public.couples
    where status='active' and (created_by=auth.uid() or partner_id=auth.uid())
    order by created_at desc limit 1
  )
  select c.id,
         c.created_by,p1.display_name,
         c.partner_id,p2.display_name,
         coalesce(nullif(p1.city,''),p2.city),
         ((case when p1.is_verified then 1 else 0 end)+(case when p2.is_verified then 1 else 0 end))::int
  from public.couples c
  join public.profiles p1 on p1.id=c.created_by
  join public.profiles p2 on p2.id=c.partner_id
  join public.profile_visibility v1 on v1.user_id=p1.id
  join public.profile_visibility v2 on v2.user_id=p2.id
  cross join mine m
  where c.status='active' and c.id<>m.id
    and coalesce(p1.account_state,'active')='active'
    and coalesce(p2.account_state,'active')='active'
    and p1.is_active and not p1.is_paused and p1.onboarding_complete
    and p2.is_active and not p2.is_paused and p2.onboarding_complete
    and v1.discoverable and not coalesce(v1.invisible_mode,false)
    and v2.discoverable and not coalesce(v2.invisible_mode,false)
    and not exists(select 1 from public.couple_likes cl where cl.from_couple_id=m.id and cl.to_couple_id=c.id)
    and not exists(
      select 1 from public.blocks b
      where b.blocker_id in (select created_by from public.couples where id=m.id union select partner_id from public.couples where id=m.id)
        and b.blocked_id in (c.created_by,c.partner_id)
    )
    and not exists(
      select 1 from public.blocks b
      where b.blocker_id in (c.created_by,c.partner_id)
        and b.blocked_id in (select created_by from public.couples where id=m.id union select partner_id from public.couples where id=m.id)
    )
  order by c.created_at desc
  limit least(greatest(candidate_limit,1),50)
$$;
revoke all on function public.get_double_date_candidates(integer) from public;
revoke all on function public.get_double_date_candidates(integer) from anon;
grant execute on function public.get_double_date_candidates(integer) to authenticated, service_role;
