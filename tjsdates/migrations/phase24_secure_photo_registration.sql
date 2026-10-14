create or replace function public.register_my_profile_photo(p_storage_path text)
returns uuid
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  uid uuid := auth.uid();
  photo_id uuid;
  photo_count integer;
  next_pos integer;
begin
  if uid is null then raise exception 'authentication required'; end if;
  if p_storage_path is null or p_storage_path = '' or split_part(p_storage_path,'/',1) <> uid::text then
    raise exception 'invalid photo path';
  end if;
  if not exists (select 1 from storage.objects where bucket_id='profile-photos' and name=p_storage_path) then
    raise exception 'photo object not found';
  end if;
  select count(*), coalesce(max(position),-1)+1 into photo_count, next_pos
  from public.profile_photos where user_id=uid;
  if photo_count >= 9 then raise exception 'maximum 9 photos'; end if;
  insert into public.profile_photos(user_id,storage_path,position,is_primary,moderation_status)
  values(uid,p_storage_path,next_pos,photo_count=0,'pending')
  returning id into photo_id;
  return photo_id;
end;
$$;
revoke all on function public.register_my_profile_photo(text) from public, anon;
grant execute on function public.register_my_profile_photo(text) to authenticated;

revoke insert, update, delete on public.profile_photos from authenticated;
drop policy if exists photos_self_insert on public.profile_photos;
drop policy if exists photos_self_update on public.profile_photos;
drop policy if exists photos_self_delete on public.profile_photos;

drop policy if exists profile_photo_select on storage.objects;
