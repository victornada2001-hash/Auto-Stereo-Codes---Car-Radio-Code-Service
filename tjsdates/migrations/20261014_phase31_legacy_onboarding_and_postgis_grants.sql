-- Legacy profiles created before interests became mandatory must revisit onboarding.
update public.profiles p
set onboarding_complete=false,
    updated_at=now()
where p.onboarding_complete=true
  and (select count(*) from public.user_interests ui where ui.user_id=p.id) not between 3 and 10;

-- Keep PostGIS catalog readable for spatial functions but never writable by browser roles.
revoke insert, update, delete, truncate, references, trigger on public.spatial_ref_sys from anon, authenticated;
