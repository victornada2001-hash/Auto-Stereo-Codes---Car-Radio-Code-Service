create or replace function public.set_my_location(lat double precision, lon double precision, p_city text, p_zone text default null)
returns void
language plpgsql
security definer
set search_path='public'
as $function$
declare
  uid uuid := auth.uid();
  pt geography;
  tj geography := st_setsrid(st_makepoint(-117.0382,32.5149),4326)::geography;
  sd geography := st_setsrid(st_makepoint(-117.1611,32.7157),4326)::geography;
  d_tj double precision;
  d_sd double precision;
  resolved_city text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if lat < -90 or lat > 90 or lon < -180 or lon > 180 then raise exception 'invalid coordinates'; end if;
  pt := st_setsrid(st_makepoint(lon,lat),4326)::geography;
  d_tj := st_distance(pt,tj);
  d_sd := st_distance(pt,sd);
  if least(d_tj,d_sd) > 100000 then raise exception 'outside_service_area'; end if;
  resolved_city := case when d_tj <= d_sd then 'Tijuana' else 'San Diego' end;
  insert into public.locations(user_id,city,zone,point,privacy_radius_m,updated_at)
  values(uid,resolved_city,nullif(left(trim(coalesce(p_zone,'')),80),''),pt,1000,now())
  on conflict(user_id) do update set city=excluded.city,zone=excluded.zone,point=excluded.point,privacy_radius_m=1000,updated_at=now();
end;
$function$;

revoke all on function public.set_my_location(double precision,double precision,text,text) from public, anon;
grant execute on function public.set_my_location(double precision,double precision,text,text) to authenticated;
