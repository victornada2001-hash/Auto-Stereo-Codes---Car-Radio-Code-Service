create or replace function public.set_my_primary_photo(photo_uuid uuid)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare uid uuid:=auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if not exists(select 1 from public.profile_photos where id=photo_uuid and user_id=uid) then raise exception 'photo not found'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  update public.profile_photos set is_primary=false where user_id=uid and is_primary;
  update public.profile_photos set is_primary=true where id=photo_uuid and user_id=uid;
end;
$$;

create or replace function public.move_my_profile_photo(photo_uuid uuid, direction integer)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare uid uuid:=auth.uid(); curpos smallint; target_id uuid; targetpos smallint;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if direction not in (-1,1) then raise exception 'invalid direction'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select position into curpos from public.profile_photos where id=photo_uuid and user_id=uid for update;
  if curpos is null then raise exception 'photo not found'; end if;
  if direction=-1 then
    select id,position into target_id,targetpos from public.profile_photos where user_id=uid and position<curpos order by position desc limit 1 for update;
  else
    select id,position into target_id,targetpos from public.profile_photos where user_id=uid and position>curpos order by position asc limit 1 for update;
  end if;
  if target_id is null then return; end if;
  update public.profile_photos set position=-32768 where id=target_id;
  update public.profile_photos set position=targetpos where id=photo_uuid;
  update public.profile_photos set position=curpos where id=target_id;
end;
$$;

create or replace function public.delete_my_profile_photo(photo_uuid uuid)
returns text
language plpgsql
security definer
set search_path=public
as $$
declare uid uuid:=auth.uid(); p text; was_primary boolean; replacement uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
  select storage_path,is_primary into p,was_primary from public.profile_photos where id=photo_uuid and user_id=uid for update;
  if p is null then raise exception 'photo not found'; end if;
  delete from public.profile_photos where id=photo_uuid and user_id=uid;
  if was_primary then
    select id into replacement from public.profile_photos where user_id=uid order by position asc limit 1;
    if replacement is not null then update public.profile_photos set is_primary=true where id=replacement; end if;
  end if;
  return p;
end;
$$;

revoke all on function public.set_my_primary_photo(uuid) from public,anon;
revoke all on function public.move_my_profile_photo(uuid,integer) from public,anon;
revoke all on function public.delete_my_profile_photo(uuid) from public,anon;
grant execute on function public.set_my_primary_photo(uuid) to authenticated;
grant execute on function public.move_my_profile_photo(uuid,integer) to authenticated;
grant execute on function public.delete_my_profile_photo(uuid) to authenticated;
