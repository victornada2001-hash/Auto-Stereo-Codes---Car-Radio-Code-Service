create or replace function public.create_like(target_user uuid, p_like_type text default 'like')
returns table(match_created boolean, match_id uuid, conversation_id uuid, remaining_likes integer)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  me uuid := auth.uid();
  rank_now int := 0;
  today_count int := 0;
  existing_match uuid;
  conv uuid;
  inserted_count int := 0;
begin
  if me is null then raise exception 'not authenticated'; end if;
  perform public.check_rate_limit('like',120,3600);
  if target_user is null or target_user=me then raise exception 'invalid target'; end if;
  if p_like_type not in ('like','highlighted') then raise exception 'invalid like type'; end if;

  if not exists(
    select 1 from public.profiles p
    where p.id=me
      and coalesce(p.account_state,'active')='active'
      and p.is_active
      and not p.is_paused
      and p.onboarding_complete
  ) then raise exception 'account unavailable'; end if;

  if exists(select 1 from public.blocks b where (b.blocker_id=me and b.blocked_id=target_user) or (b.blocker_id=target_user and b.blocked_id=me)) then raise exception 'interaction not allowed'; end if;

  if not exists(
    select 1
    from public.profiles p
    left join public.profile_visibility v on v.user_id=p.id
    where p.id=target_user
      and coalesce(p.account_state,'active')='active'
      and p.is_active
      and not p.is_paused
      and p.onboarding_complete
      and (
        (coalesce(v.discoverable,true) and not coalesce(v.invisible_mode,false))
        or exists(select 1 from public.likes l where l.from_user_id=target_user and l.to_user_id=me)
      )
  ) then raise exception 'profile unavailable'; end if;

  select coalesce(public.current_plan_rank(),0) into rank_now;
  if p_like_type='highlighted' and rank_now < 2 then raise exception 'highlighted like requires Gold or Platinum'; end if;
  if rank_now=0 then
    select count(*) into today_count from public.likes where from_user_id=me and created_at >= date_trunc('day',now()) and created_at < date_trunc('day',now())+interval '1 day';
    if today_count >= 25 then raise exception 'daily like limit reached'; end if;
  end if;

  insert into public.likes(from_user_id,to_user_id,like_type)
  values(me,target_user,p_like_type)
  on conflict(from_user_id,to_user_id) do nothing;
  get diagnostics inserted_count = row_count;

  select m.id into existing_match from public.matches m where m.user_low=least(me,target_user) and m.user_high=greatest(me,target_user) and m.status='active';
  if existing_match is not null then select c.id into conv from public.conversations c where c.match_id=existing_match limit 1; end if;

  if inserted_count>0 and existing_match is null then
    insert into public.notifications(user_id,type,title,body,data)
    values(target_user,'like',case when p_like_type='highlighted' then 'Nuevo Like destacado' else 'A alguien le gustó tu perfil' end,
           case when p_like_type='highlighted' then 'Recibiste un Like destacado.' else 'Tienes un nuevo Like.' end,
           jsonb_build_object('like_type',p_like_type));
  end if;

  return query select existing_match is not null, existing_match, conv,
    case when rank_now=0 then greatest(0,25-(select count(*)::int from public.likes where from_user_id=me and created_at >= date_trunc('day',now()) and created_at < date_trunc('day',now())+interval '1 day')) else null end;
end;
$$;
revoke all on function public.create_like(uuid,text) from public;
revoke all on function public.create_like(uuid,text) from anon;
grant execute on function public.create_like(uuid,text) to authenticated, service_role;

create or replace function public.create_pass(target_user uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not authenticated'; end if;
  perform public.check_rate_limit('pass',180,3600);
  if target_user is null or target_user=me then raise exception 'invalid target'; end if;

  if not exists(
    select 1 from public.profiles p
    where p.id=me
      and coalesce(p.account_state,'active')='active'
      and p.is_active
      and not p.is_paused
      and p.onboarding_complete
  ) then raise exception 'account unavailable'; end if;

  if exists(select 1 from public.blocks b where (b.blocker_id=me and b.blocked_id=target_user) or (b.blocker_id=target_user and b.blocked_id=me)) then raise exception 'interaction not allowed'; end if;

  if not exists(
    select 1
    from public.profiles p
    left join public.profile_visibility v on v.user_id=p.id
    where p.id=target_user
      and coalesce(p.account_state,'active')='active'
      and p.is_active
      and not p.is_paused
      and p.onboarding_complete
      and (
        (coalesce(v.discoverable,true) and not coalesce(v.invisible_mode,false))
        or exists(select 1 from public.likes l where l.from_user_id=target_user and l.to_user_id=me)
      )
  ) then raise exception 'profile unavailable'; end if;

  if exists(select 1 from public.likes l where l.from_user_id=me and l.to_user_id=target_user) then raise exception 'already liked'; end if;
  insert into public.passes(from_user_id,to_user_id) values(me,target_user) on conflict(from_user_id,to_user_id) do nothing;
end;
$$;
revoke all on function public.create_pass(uuid) from public;
revoke all on function public.create_pass(uuid) from anon;
grant execute on function public.create_pass(uuid) to authenticated, service_role;
