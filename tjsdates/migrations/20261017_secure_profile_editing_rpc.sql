-- Secure profile editing and onboarding RPCs.
-- Applied to Supabase project svaybfqheetndkahtbbc.

create or replace function public.update_my_profile_basic(
  p_display_name text,
  p_city text,
  p_pronouns text,
  p_occupation text,
  p_school text,
  p_height_cm integer,
  p_bio text
) returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if length(trim(coalesce(p_display_name,''))) < 2 or length(trim(p_display_name)) > 40 then raise exception 'invalid_display_name'; end if;
  if p_city not in ('Tijuana','San Diego') then raise exception 'invalid_city'; end if;
  if p_height_cm is not null and (p_height_cm < 100 or p_height_cm > 250) then raise exception 'invalid_height'; end if;
  if length(coalesce(p_pronouns,'')) > 80 or length(coalesce(p_occupation,'')) > 120 or length(coalesce(p_school,'')) > 120 or length(coalesce(p_bio,'')) > 500 then raise exception 'field_too_long'; end if;
  update public.profiles
  set display_name=trim(p_display_name),city=p_city,
      pronouns=nullif(trim(coalesce(p_pronouns,'')),''),
      occupation=nullif(trim(coalesce(p_occupation,'')),''),
      school=nullif(trim(coalesce(p_school,'')),''),height_cm=p_height_cm,
      bio=nullif(trim(coalesce(p_bio,'')),''),last_active_at=now(),updated_at=now()
  where id=uid and account_state='active';
  if not found then raise exception 'profile_unavailable'; end if;
  perform public.refresh_my_profile_quality();
  return true;
end $$;

create or replace function public.update_my_profile_details(
  p_gender_identity text,p_sexual_orientation text,p_company text,p_zodiac_sign text,
  p_exercise text,p_smoking text,p_alcohol text,p_pets text,p_children text,
  p_wants_children text,p_languages text[],p_sleep_habits text,p_interest_ids bigint[]
) returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare uid uuid:=auth.uid(); clean_languages text[];
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if coalesce(array_length(p_interest_ids,1),0) < 3 or coalesce(array_length(p_interest_ids,1),0) > 10 then raise exception 'invalid_interest_count'; end if;
  if length(coalesce(p_gender_identity,'')) > 80 or length(coalesce(p_sexual_orientation,'')) > 80 or length(coalesce(p_company,'')) > 120 then raise exception 'field_too_long'; end if;
  if p_zodiac_sign is not null and p_zodiac_sign not in ('Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis') then raise exception 'invalid_zodiac'; end if;
  if p_exercise is not null and p_exercise not in ('frequent','sometimes','rarely') then raise exception 'invalid_exercise'; end if;
  if p_smoking is not null and p_smoking not in ('no','sometimes','yes') then raise exception 'invalid_smoking'; end if;
  if p_alcohol is not null and p_alcohol not in ('no','social','sometimes') then raise exception 'invalid_alcohol'; end if;
  if p_pets is not null and p_pets not in ('dog','cat','both','other','none') then raise exception 'invalid_pets'; end if;
  if p_children is not null and p_children not in ('yes','no') then raise exception 'invalid_children'; end if;
  if p_wants_children is not null and p_wants_children not in ('yes','no','maybe') then raise exception 'invalid_wants_children'; end if;
  if p_sleep_habits is not null and p_sleep_habits not in ('early','night','flexible') then raise exception 'invalid_sleep_habits'; end if;
  clean_languages:=coalesce(p_languages,array['es']::text[]);
  if coalesce(array_length(clean_languages,1),0)=0 or array_length(clean_languages,1)>5 then raise exception 'invalid_languages'; end if;
  if exists(select 1 from unnest(clean_languages) x where length(x)<2 or length(x)>12) then raise exception 'invalid_languages'; end if;
  update public.profiles set
      gender_identity=nullif(trim(coalesce(p_gender_identity,'')),''),
      sexual_orientation=nullif(trim(coalesce(p_sexual_orientation,'')),''),
      company=nullif(trim(coalesce(p_company,'')),''),zodiac_sign=p_zodiac_sign,
      exercise=p_exercise,smoking=p_smoking,alcohol=p_alcohol,pets=p_pets,
      children=p_children,wants_children=p_wants_children,languages=clean_languages,
      sleep_habits=p_sleep_habits,last_active_at=now(),updated_at=now()
  where id=uid and account_state='active';
  if not found then raise exception 'profile_unavailable'; end if;
  perform public.set_my_interests(p_interest_ids);
  perform public.refresh_my_profile_quality();
  return true;
end $$;

create or replace function public.complete_my_onboarding(
  p_display_name text,p_city text,p_gender text,p_relationship_goal text,p_bio text,
  p_genders text[],p_interest_ids bigint[]
) returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if length(trim(coalesce(p_display_name,'')))<2 or length(trim(p_display_name))>40 then raise exception 'invalid_display_name'; end if;
  if p_city not in ('Tijuana','San Diego') then raise exception 'invalid_city'; end if;
  if p_gender not in ('woman','man','nonbinary','other') then raise exception 'invalid_gender'; end if;
  if p_relationship_goal not in ('relación seria','relación a largo plazo','citas','algo casual','amistad','conocer personas','todavía no lo sé') then raise exception 'invalid_goal'; end if;
  if length(coalesce(p_bio,''))>500 then raise exception 'bio_too_long'; end if;
  if coalesce(array_length(p_genders,1),0)<1 or exists(select 1 from unnest(p_genders) g where g not in ('woman','man','nonbinary')) then raise exception 'invalid_preferences'; end if;
  if coalesce(array_length(p_interest_ids,1),0)<3 or coalesce(array_length(p_interest_ids,1),0)>10 then raise exception 'invalid_interest_count'; end if;
  update public.profiles set display_name=trim(p_display_name),city=p_city,gender=p_gender,
      relationship_goal=p_relationship_goal,bio=nullif(trim(coalesce(p_bio,'')),''),
      onboarding_complete=true,last_active_at=now(),updated_at=now()
  where id=uid and account_state='active';
  if not found then raise exception 'profile_unavailable'; end if;
  insert into public.preferences(user_id,genders,min_age,max_age,max_distance_km,updated_at)
  values(uid,p_genders,18,45,30,now())
  on conflict(user_id) do update set genders=excluded.genders,min_age=18,max_age=45,max_distance_km=30,updated_at=now();
  insert into public.profile_visibility(user_id) values(uid) on conflict(user_id) do nothing;
  perform public.set_my_interests(p_interest_ids);
  perform public.refresh_my_profile_quality();
  return true;
end $$;

revoke all on function public.update_my_profile_basic(text,text,text,text,text,integer,text) from public, anon;
revoke all on function public.update_my_profile_details(text,text,text,text,text,text,text,text,text,text,text[],text,bigint[]) from public, anon;
revoke all on function public.complete_my_onboarding(text,text,text,text,text,text[],bigint[]) from public, anon;
grant execute on function public.update_my_profile_basic(text,text,text,text,text,integer,text) to authenticated;
grant execute on function public.update_my_profile_details(text,text,text,text,text,text,text,text,text,text,text[],text,bigint[]) to authenticated;
grant execute on function public.complete_my_onboarding(text,text,text,text,text,text[],bigint[]) to authenticated;
