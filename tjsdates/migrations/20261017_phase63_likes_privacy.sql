create or replace function public.get_like_center(lim integer default 60)
returns table(total bigint, unlocked boolean, user_id uuid, display_name text, age integer, city text, is_verified boolean, like_type text, liked_at timestamp with time zone, photo_path text)
language plpgsql
stable security definer
set search_path to 'public'
as $$
declare r smallint;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select coalesce(max(p.rank),0)::smallint into r
  from public.subscriptions s join public.plans p on p.id=s.plan_id
  where s.user_id=auth.uid() and s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end>now());

  if r < 2 then
    return query
    select count(*)::bigint,false,null::uuid,null::text,null::int,null::text,false::boolean,null::text,null::timestamptz,null::text
    from public.likes l
    join public.profiles p on p.id=l.from_user_id
    where l.to_user_id=auth.uid()
      and coalesce(p.account_state,'active')='active'
      and p.is_active
      and p.onboarding_complete
      and not exists(select 1 from public.matches m where m.status='active' and ((m.user_low=auth.uid() and m.user_high=l.from_user_id) or (m.user_high=auth.uid() and m.user_low=l.from_user_id)))
      and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=l.from_user_id) or (b.blocker_id=l.from_user_id and b.blocked_id=auth.uid()));
    return;
  end if;

  return query
  with base as (
    select l.from_user_id,l.like_type,l.created_at,p.display_name,p.birth_date,p.city,p.is_verified,coalesce(v.show_age,true) show_age
    from public.likes l
    join public.profiles p on p.id=l.from_user_id
    left join public.profile_visibility v on v.user_id=p.id
    where l.to_user_id=auth.uid()
      and coalesce(p.account_state,'active')='active'
      and p.is_active
      and p.onboarding_complete
      and not exists(select 1 from public.matches m where m.status='active' and ((m.user_low=auth.uid() and m.user_high=l.from_user_id) or (m.user_high=auth.uid() and m.user_low=l.from_user_id)))
      and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=l.from_user_id) or (b.blocker_id=l.from_user_id and b.blocked_id=auth.uid()))
    order by l.created_at desc limit least(greatest(lim,1),100)
  ), totals as (
    select count(*)::bigint total
    from public.likes l
    join public.profiles p on p.id=l.from_user_id
    where l.to_user_id=auth.uid()
      and coalesce(p.account_state,'active')='active'
      and p.is_active
      and p.onboarding_complete
      and not exists(select 1 from public.matches m where m.status='active' and ((m.user_low=auth.uid() and m.user_high=l.from_user_id) or (m.user_high=auth.uid() and m.user_low=l.from_user_id)))
      and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=l.from_user_id) or (b.blocker_id=l.from_user_id and b.blocked_id=auth.uid()))
  )
  select t.total,true,b.from_user_id,b.display_name,
         case when b.show_age and b.birth_date is not null then extract(year from age(current_date,b.birth_date))::int else null end,
         b.city,b.is_verified,b.like_type,b.created_at,
         (select pp.storage_path from public.profile_photos pp where pp.user_id=b.from_user_id and pp.moderation_status='approved' order by pp.is_primary desc,pp.position asc limit 1)
  from base b cross join totals t;
end;
$$;
revoke all on function public.get_like_center(integer) from public;
revoke all on function public.get_like_center(integer) from anon;
grant execute on function public.get_like_center(integer) to authenticated, service_role;

create or replace function public.get_received_likes(lim integer default 50)
returns table(from_user_id uuid, like_type text, created_at timestamp with time zone)
language plpgsql
stable security definer
set search_path to 'public'
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if public.current_plan_rank() < 2 then raise exception 'premium_required'; end if;
  return query
  select l.from_user_id,l.like_type,l.created_at
  from public.likes l
  join public.profiles p on p.id=l.from_user_id
  where l.to_user_id=auth.uid()
    and coalesce(p.account_state,'active')='active'
    and p.is_active
    and p.onboarding_complete
    and not exists(select 1 from public.matches m where m.status='active' and ((m.user_low=auth.uid() and m.user_high=l.from_user_id) or (m.user_high=auth.uid() and m.user_low=l.from_user_id)))
    and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=l.from_user_id) or (b.blocker_id=l.from_user_id and b.blocked_id=auth.uid()))
  order by l.created_at desc
  limit least(greatest(lim,1),100);
end;
$$;
revoke all on function public.get_received_likes(integer) from public;
revoke all on function public.get_received_likes(integer) from anon;
grant execute on function public.get_received_likes(integer) to authenticated, service_role;
