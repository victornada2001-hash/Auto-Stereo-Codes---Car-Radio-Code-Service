-- Phase 55: safe public profile detail for discovery candidates and active matches.
create or replace function public.get_public_profile_detail(target_user uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path=public
as $$
declare
  me uuid:=auth.uid();
  allowed boolean:=false;
  result jsonb;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if target_user is null or target_user=me then raise exception 'invalid target'; end if;

  if exists(
    select 1 from public.blocks b
    where (b.blocker_id=me and b.blocked_id=target_user)
       or (b.blocker_id=target_user and b.blocked_id=me)
  ) then
    raise exception 'forbidden';
  end if;

  allowed := exists(
    select 1 from public.matches m
    where m.status='active'
      and ((m.user_low=me and m.user_high=target_user) or (m.user_low=target_user and m.user_high=me))
  );

  if not allowed then
    allowed := exists(
      select 1
      from public.profiles p
      left join public.profile_visibility v on v.user_id=p.id
      where p.id=target_user
        and coalesce(p.account_state,'active')='active'
        and coalesce(v.discoverable,true)=true
        and coalesce(v.invisible_mode,false)=false
        and p.onboarding_complete=true
    );
  end if;

  if not allowed then raise exception 'forbidden'; end if;

  select jsonb_build_object(
    'id',p.id,
    'display_name',p.display_name,
    'city',p.city,
    'gender',case when coalesce(v.show_gender,true) then p.gender else null end,
    'pronouns',p.pronouns,
    'relationship_goal',p.relationship_goal,
    'bio',p.bio,
    'occupation',case when coalesce(v.show_work,true) then p.occupation else null end,
    'company',case when coalesce(v.show_work,true) then p.company else null end,
    'school',case when coalesce(v.show_school,true) then p.school else null end,
    'height_cm',p.height_cm,
    'languages',p.languages,
    'zodiac_sign',p.zodiac_sign,
    'exercise',p.exercise,
    'smoking',p.smoking,
    'alcohol',p.alcohol,
    'diet',p.diet,
    'pets',p.pets,
    'children',p.children,
    'wants_children',p.wants_children,
    'sleep_habits',p.sleep_habits,
    'is_verified',p.is_verified,
    'created_at',p.created_at,
    'last_active_at',case when coalesce(v.show_recent_activity,true) then p.last_active_at else null end,
    'photo_paths',coalesce((
      select jsonb_agg(pp.storage_path order by pp.is_primary desc,pp.position asc)
      from public.profile_photos pp
      where pp.user_id=p.id and pp.moderation_status='approved'
    ),'[]'::jsonb),
    'interest_ids',coalesce((
      select jsonb_agg(ui.interest_id order by ui.interest_id)
      from public.user_interests ui
      where ui.user_id=p.id
    ),'[]'::jsonb)
  ) into result
  from public.profiles p
  left join public.profile_visibility v on v.user_id=p.id
  where p.id=target_user;

  if result is null then raise exception 'profile not found'; end if;
  return result;
end;
$$;

revoke all on function public.get_public_profile_detail(uuid) from public,anon;
grant execute on function public.get_public_profile_detail(uuid) to authenticated;
