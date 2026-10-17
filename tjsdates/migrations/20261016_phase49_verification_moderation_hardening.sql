alter table public.verifications add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
alter table public.verifications add column if not exists review_note text;

create unique index if not exists verifications_one_pending_per_type
  on public.verifications(user_id,verification_type)
  where status='pending';

create or replace function public.request_photo_verification()
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare
  uid uuid := auth.uid();
  v_id uuid;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if not exists(select 1 from public.profiles p where p.id=uid and p.account_state='active' and p.is_active) then raise exception 'profile_unavailable'; end if;
  if exists(select 1 from public.profiles p where p.id=uid and p.is_verified) then raise exception 'already_verified'; end if;
  if not exists(select 1 from public.profile_photos pp where pp.user_id=uid and pp.moderation_status='approved') then raise exception 'approved_photo_required'; end if;
  select id into v_id from public.verifications where user_id=uid and verification_type='photo' and status='pending' order by created_at desc limit 1;
  if v_id is not null then return v_id; end if;
  insert into public.verifications(user_id,verification_type,status,provider,consent_at)
  values(uid,'photo','pending','manual',now()) returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.request_photo_verification() from public, anon;
grant execute on function public.request_photo_verification() to authenticated;

drop function if exists public.admin_verification_queue(integer);
create function public.admin_verification_queue(lim integer default 50)
returns table(id uuid,user_id uuid,display_name text,verification_type text,status text,created_at timestamptz,photo_paths text[],photo_count integer)
language plpgsql stable security definer set search_path='public'
as $$
begin
  if not public.is_admin(array['superadmin','admin','moderator']) then raise exception 'forbidden'; end if;
  return query
  select v.id,v.user_id,p.display_name,v.verification_type,v.status,v.created_at,
         coalesce((select array_agg(pp.storage_path order by pp.is_primary desc, pp.position asc) from public.profile_photos pp where pp.user_id=v.user_id and pp.moderation_status='approved'),array[]::text[]),
         (select count(*)::int from public.profile_photos pp where pp.user_id=v.user_id and pp.moderation_status='approved')
  from public.verifications v left join public.profiles p on p.id=v.user_id
  where v.status='pending' order by v.created_at asc limit least(greatest(lim,1),200);
end;
$$;
revoke all on function public.admin_verification_queue(integer) from public, anon;
grant execute on function public.admin_verification_queue(integer) to authenticated;

create or replace function public.admin_moderate_verification(verification_uuid uuid, decision text, note text default null)
returns void language plpgsql security definer set search_path='public'
as $$
declare uid uuid; current_status text;
begin
  if not public.is_admin(array['superadmin','admin','moderator']) then raise exception 'forbidden'; end if;
  if decision not in ('approved','rejected') then raise exception 'invalid_decision'; end if;
  if length(coalesce(note,'')) > 500 then raise exception 'note_too_long'; end if;
  select user_id,status into uid,current_status from public.verifications where id=verification_uuid for update;
  if uid is null then raise exception 'verification_not_found'; end if;
  if current_status <> 'pending' then raise exception 'verification_already_reviewed'; end if;
  if decision='approved' and not exists(select 1 from public.profile_photos pp where pp.user_id=uid and pp.moderation_status='approved') then raise exception 'approved_photo_required'; end if;
  update public.verifications set status=decision,reviewed_at=now(),reviewed_by=auth.uid(),review_note=nullif(left(trim(coalesce(note,'')),500),'') where id=verification_uuid;
  if decision='approved' then update public.profiles set is_verified=true,updated_at=now() where id=uid and account_state='active'; end if;
  insert into public.moderation_actions(admin_user_id,target_user_id,action,reason,metadata)
  values(auth.uid(),uid,'verification_'||decision,nullif(left(trim(coalesce(note,'')),500),''),jsonb_build_object('verification_id',verification_uuid));
end;
$$;
revoke all on function public.admin_moderate_verification(uuid,text,text) from public, anon;
grant execute on function public.admin_moderate_verification(uuid,text,text) to authenticated;

drop function if exists public.get_my_verification_status();
create function public.get_my_verification_status()
returns table(status text,verification_type text,created_at timestamptz,reviewed_at timestamptz,review_note text)
language sql stable security definer set search_path='public'
as $$
  select v.status,v.verification_type,v.created_at,v.reviewed_at,v.review_note
  from public.verifications v where v.user_id=auth.uid() order by v.created_at desc limit 1;
$$;
revoke all on function public.get_my_verification_status() from public, anon;
grant execute on function public.get_my_verification_status() to authenticated;

drop policy if exists "profile_photo_admin_read" on storage.objects;
create policy "profile_photo_admin_read" on storage.objects
for select to authenticated
using (bucket_id='profile-photos' and public.is_admin(array['superadmin','admin','moderator']));
