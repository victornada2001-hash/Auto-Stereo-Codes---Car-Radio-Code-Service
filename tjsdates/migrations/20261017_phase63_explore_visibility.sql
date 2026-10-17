create or replace function public.get_explore_candidates(category_slug text, candidate_limit integer default 30)
returns table(id uuid, display_name text, age integer, gender text, pronouns text, relationship_goal text, bio text, city text, zone text, occupation text, school text, height_cm integer, languages text[], zodiac_sign text, exercise text, smoking text, alcohol text, diet text, pets text, children text, wants_children text, is_verified boolean, approximate_distance_km integer, common_interests integer)
language sql
stable security definer
set search_path to 'public'
as $$
  with base as (
    select
      d.*,
      p.created_at,
      case when coalesce(v.show_recent_activity,true) then p.last_active_at end as visible_last_active_at,
      case when coalesce(v.show_school,true) then p.school end as visible_school,
      p.relationship_goal as raw_goal
    from public.get_discovery_candidates(50) d
    join public.profiles p on p.id=d.id
    left join public.profile_visibility v on v.user_id=p.id
  )
  select b.id,b.display_name,b.age,b.gender,b.pronouns,b.relationship_goal,b.bio,b.city,b.zone,b.occupation,b.school,b.height_cm,b.languages,b.zodiac_sign,b.exercise,b.smoking,b.alcohol,b.diet,b.pets,b.children,b.wants_children,b.is_verified,b.approximate_distance_km,b.common_interests
  from base b
  where case category_slug
    when 'serio' then lower(coalesce(b.raw_goal,'')) in ('relación seria','relacion seria','relación a largo plazo','relacion a largo plazo')
    when 'amistades' then lower(coalesce(b.raw_goal,'')) in ('amistad','conocer personas')
    when 'esta-noche' then exists(select 1 from public.user_interests ui join public.interests i on i.id=ui.interest_id where ui.user_id=b.id and i.slug in ('fiestas','conciertos','baile'))
    when 'foodies' then exists(select 1 from public.user_interests ui join public.interests i on i.id=ui.interest_id where ui.user_id=b.id and i.slug in ('restaurantes','cafe','cocina'))
    when 'viajeros' then exists(select 1 from public.user_interests ui join public.interests i on i.id=ui.interest_id where ui.user_id=b.id and i.slug in ('viajes','playa','senderismo'))
    when 'gym' then exists(select 1 from public.user_interests ui join public.interests i on i.id=ui.interest_id where ui.user_id=b.id and i.slug='gym')
    when 'musica' then exists(select 1 from public.user_interests ui join public.interests i on i.id=ui.interest_id where ui.user_id=b.id and i.slug in ('musica','conciertos','baile'))
    when 'gamer' then exists(select 1 from public.user_interests ui join public.interests i on i.id=ui.interest_id where ui.user_id=b.id and i.slug in ('videojuegos','tecnologia'))
    when 'mascotas' then exists(select 1 from public.user_interests ui join public.interests i on i.id=ui.interest_id where ui.user_id=b.id and i.slug='mascotas') or coalesce(b.pets,'')<>''
    when 'universitarios' then coalesce(b.visible_school,'')<>''
    when 'verificados' then b.is_verified
    when 'recien-llegados' then b.created_at >= now()-interval '14 days'
    when 'activos' then b.visible_last_active_at >= now()-interval '24 hours'
    else true end
  order by b.common_interests desc, b.visible_last_active_at desc nulls last
  limit least(greatest(candidate_limit,1),50)
$$;

revoke all on function public.get_explore_candidates(text,integer) from public;
revoke all on function public.get_explore_candidates(text,integer) from anon;
grant execute on function public.get_explore_candidates(text,integer) to authenticated, service_role;
