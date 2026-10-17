with centers as (
  select st_setsrid(st_makepoint(-117.0382,32.5149),4326)::geography as tj,
         st_setsrid(st_makepoint(-117.1611,32.7157),4326)::geography as sd
)
update public.locations l
set city = case when st_distance(l.point,c.tj) <= st_distance(l.point,c.sd) then 'Tijuana' else 'San Diego' end,
    updated_at = now()
from centers c
where l.point is not null
  and least(st_distance(l.point,c.tj),st_distance(l.point,c.sd)) <= 100000
  and coalesce(l.city,'') not in ('Tijuana','San Diego');
