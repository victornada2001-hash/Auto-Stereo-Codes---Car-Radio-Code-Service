-- Phase 65: immutable, moderated profile-photo storage.
-- Users upload only new UUID-named image objects; approved objects cannot be overwritten.

create or replace function public.can_upload_profile_photo_object(p_name text)
returns boolean
language sql
stable
security definer
set search_path='public','storage'
as $function$
  select auth.uid() is not null
    and public.account_is_active(auth.uid())
    and p_name ~ ('^' || auth.uid()::text || '/[0-9a-fA-F-]{36}[.](webp|jpg|jpeg|png)$')
    and (
      select count(*)
      from storage.objects o
      where o.bucket_id='profile-photos'
        and o.owner_id=auth.uid()::text
        and o.name like auth.uid()::text || '/%'
    ) < 12;
$function$;
revoke all on function public.can_upload_profile_photo_object(text) from public,anon;
grant execute on function public.can_upload_profile_photo_object(text) to authenticated,service_role;

drop policy if exists profile_photo_owner_manage on storage.objects;
drop policy if exists profile_photo_upload on storage.objects;
create policy profile_photo_upload on storage.objects
for insert to authenticated
with check (
  bucket_id='profile-photos'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and public.can_upload_profile_photo_object(name)
);

create or replace function public.register_my_profile_photo(p_storage_path text)
returns uuid
language plpgsql
security definer
set search_path='public','storage'
as $function$
declare
  uid uuid:=auth.uid();
  photo_id uuid;
  photo_count integer;
  next_pos integer;
  obj_mime text;
  obj_size bigint;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if not public.account_is_active(uid) then raise exception 'account_restricted'; end if;
  if p_storage_path is null or p_storage_path='' or split_part(p_storage_path,'/',1)<>uid::text then raise exception 'invalid photo path'; end if;
  if p_storage_path !~ ('^' || uid::text || '/[0-9a-fA-F-]{36}[.](webp|jpg|jpeg|png)$') then raise exception 'invalid photo path'; end if;

  select o.metadata->>'mimetype', coalesce((o.metadata->>'size')::bigint,0)
    into obj_mime,obj_size
  from storage.objects o
  where o.bucket_id='profile-photos' and o.name=p_storage_path and o.owner_id=uid::text;
  if obj_mime is null then raise exception 'photo object not found'; end if;
  if obj_mime not in ('image/jpeg','image/png','image/webp') then raise exception 'invalid photo mime'; end if;
  if obj_size<=0 or obj_size>10485760 then raise exception 'invalid photo size'; end if;

  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select count(*),coalesce(max(position),-1)+1 into photo_count,next_pos
  from public.profile_photos where user_id=uid;
  if photo_count>=9 then raise exception 'maximum 9 photos'; end if;
  if exists(select 1 from public.profile_photos where storage_path=p_storage_path) then raise exception 'photo already registered'; end if;

  insert into public.profile_photos(user_id,storage_path,position,is_primary,moderation_status)
  values(uid,p_storage_path,next_pos,photo_count=0,'pending')
  returning id into photo_id;
  return photo_id;
end
$function$;
revoke all on function public.register_my_profile_photo(text) from public,anon;
grant execute on function public.register_my_profile_photo(text) to authenticated,service_role;
