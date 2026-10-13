-- Applied to Supabase project svaybfqheetndkahtbbc.
-- Phase 17: relationship-goal and verified-only filters for discovery.

create or replace function public.get_discovery_candidates(candidate_limit integer default 20)
returns table(id uuid, display_name text, age integer, gender text, pronouns text, relationship_goal text, bio text, city text, zone text, occupation text, school text, height_cm integer, languages text[], zodiac_sign text, exercise text, smoking text, alcohol text, diet text, pets text, children text, wants_children text, is_verified boolean, approximate_distance_km integer, common_interests integer)
language sql stable security definer set search_path=public as $$
with me as (
 select p.id,pref.min_age,pref.max_age,pref.max_distance_km,pref.genders,pref.goals,pref.verified_only,l.point
 from public.profiles p left join public.preferences pref on pref.user_id=p.id left join public.locations l on l.user_id=p.id where p.id=auth.uid()
), candidates as (
 select p.*,v.*,l.point candidate_point,
 case when m.point is not null and l.point is not null then round(ST_Distance(m.point,l.point)/1000.0)::int else null end distance_km,
 case when p.birth_date is not null then extract(year from age(current_date,p.birth_date))::int else null end computed_age,
 m.min_age,m.max_age,m.max_distance_km,m.genders,m.goals,m.verified_only
 from public.profiles p join public.profile_visibility v on v.user_id=p.id left join public.locations l on l.user_id=p.id cross join me m
 where p.id<>auth.uid() and p.is_active and not p.is_paused and v.discoverable
 and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=p.id) or (b.blocker_id=p.id and b.blocked_id=auth.uid()))
 and not exists(select 1 from public.likes x where x.from_user_id=auth.uid() and x.to_user_id=p.id)
 and not exists(select 1 from public.passes x where x.from_user_id=auth.uid() and x.to_user_id=p.id)
 and (m.min_age is null or p.birth_date is null or extract(year from age(current_date,p.birth_date))::int>=m.min_age)
 and (m.max_age is null or p.birth_date is null or extract(year from age(current_date,p.birth_date))::int<=m.max_age)
 and (coalesce(array_length(m.genders,1),0)=0 or p.gender=any(m.genders))
 and (coalesce(array_length(m.goals,1),0)=0 or p.relationship_goal=any(m.goals))
 and (not coalesce(m.verified_only,false) or p.is_verified)
 and (m.point is null or l.point is null or ST_DWithin(m.point,l.point,coalesce(m.max_distance_km,30)*1000))
)
select c.id,c.display_name,case when c.show_age then c.computed_age else null end,
case when c.show_gender then c.gender else null end,c.pronouns,c.relationship_goal,c.bio,c.city,c.zone,
case when c.show_work then c.occupation else null end,case when c.show_school then c.school else null end,c.height_cm,c.languages,c.zodiac_sign,c.exercise,c.smoking,c.alcohol,c.diet,c.pets,c.children,c.wants_children,c.is_verified,
case when c.show_distance and c.distance_km is not null then greatest(1,round(c.distance_km/2.0)*2)::int else null end,
(select count(*)::int from public.user_interests mine join public.user_interests theirs on theirs.interest_id=mine.interest_id where mine.user_id=auth.uid() and theirs.user_id=c.id)
from candidates c order by (select count(*) from public.user_interests mine join public.user_interests theirs on theirs.interest_id=mine.interest_id where mine.user_id=auth.uid() and theirs.user_id=c.id) desc,c.last_active_at desc nulls last
limit least(greatest(candidate_limit,1),50)
$$;
revoke all on function public.get_discovery_candidates(integer) from public,anon;
grant execute on function public.get_discovery_candidates(integer) to authenticated;
