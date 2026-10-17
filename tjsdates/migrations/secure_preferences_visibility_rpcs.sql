create or replace function public.update_my_preferences(
  p_min_age smallint,
  p_max_age smallint,
  p_max_distance_km integer,
  p_genders text[],
  p_goals text[],
  p_verified_only boolean
) returns void
language plpgsql security definer set search_path=public
as $$
declare uid uuid:=auth.uid(); allowed_genders constant text[]:=array['woman','man','nonbinary']; allowed_goals constant text[]:=array['relación seria','relación a largo plazo','citas','algo casual','amistad','conocer personas','todavía no lo sé'];
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if p_min_age<18 or p_max_age<p_min_age or p_max_age>100 then raise exception 'invalid_age_range'; end if;
  if p_max_distance_km<>all(array[1,5,10,20,30,50,100]) then raise exception 'invalid_distance'; end if;
  if coalesce(array_length(p_genders,1),0)=0 or exists(select 1 from unnest(coalesce(p_genders,array[]::text[])) g where not(g=any(allowed_genders))) then raise exception 'invalid_preferences'; end if;
  if exists(select 1 from unnest(coalesce(p_goals,array[]::text[])) g where not(g=any(allowed_goals))) then raise exception 'invalid_goal'; end if;
  insert into public.preferences(user_id,min_age,max_age,max_distance_km,genders,goals,verified_only,updated_at)
  values(uid,p_min_age,p_max_age,p_max_distance_km,p_genders,coalesce(p_goals,array[]::text[]),coalesce(p_verified_only,false),now())
  on conflict(user_id) do update set min_age=excluded.min_age,max_age=excluded.max_age,max_distance_km=excluded.max_distance_km,genders=excluded.genders,goals=excluded.goals,verified_only=excluded.verified_only,updated_at=now();
end$$;

create or replace function public.update_my_visibility(
  p_show_age boolean,p_show_distance boolean,p_show_orientation boolean,p_show_gender boolean,p_show_work boolean,p_show_school boolean,p_show_recent_activity boolean,p_discoverable boolean,p_invisible_mode boolean
) returns void
language plpgsql security definer set search_path=public
as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  insert into public.profile_visibility(user_id,show_age,show_distance,show_orientation,show_gender,show_work,show_school,show_recent_activity,discoverable,invisible_mode,updated_at)
  values(uid,coalesce(p_show_age,true),coalesce(p_show_distance,true),coalesce(p_show_orientation,false),coalesce(p_show_gender,true),coalesce(p_show_work,true),coalesce(p_show_school,true),coalesce(p_show_recent_activity,true),coalesce(p_discoverable,true),coalesce(p_invisible_mode,false),now())
  on conflict(user_id) do update set show_age=excluded.show_age,show_distance=excluded.show_distance,show_orientation=excluded.show_orientation,show_gender=excluded.show_gender,show_work=excluded.show_work,show_school=excluded.show_school,show_recent_activity=excluded.show_recent_activity,discoverable=excluded.discoverable,invisible_mode=excluded.invisible_mode,updated_at=now();
end$$;

revoke all on function public.update_my_preferences(smallint,smallint,integer,text[],text[],boolean) from public,anon;
revoke all on function public.update_my_visibility(boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean) from public,anon;
grant execute on function public.update_my_preferences(smallint,smallint,integer,text[],text[],boolean) to authenticated,service_role;
grant execute on function public.update_my_visibility(boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean,boolean) to authenticated,service_role;
revoke insert,update,delete on public.preferences from authenticated;
revoke insert,update,delete on public.profile_visibility from authenticated;
