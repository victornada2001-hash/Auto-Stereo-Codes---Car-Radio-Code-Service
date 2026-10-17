-- Phase 65: immutable chat-media uploads, orphan limits and server-side attachment validation.

create or replace function public.can_upload_chat_media_object(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path='public','storage'
as $function$
declare
  uid uuid:=auth.uid();
  conv uuid;
  parts text[];
  orphan_count integer;
begin
  if uid is null then return false; end if;
  parts:=storage.foldername(p_name);
  if coalesce(array_length(parts,1),0)<>2 then return false; end if;
  begin conv:=parts[1]::uuid; exception when others then return false; end;
  if parts[2]<>uid::text then return false; end if;
  if p_name !~ ('^' || conv::text || '/' || uid::text || '/[0-9a-fA-F-]{36}[.]webp$') then return false; end if;
  if not public.is_conversation_member(conv) then return false; end if;
  select count(*) into orphan_count
  from storage.objects o
  where o.bucket_id='chat-media'
    and o.owner_id=uid::text
    and o.name like conv::text || '/' || uid::text || '/%'
    and not exists(select 1 from public.messages m where m.attachment_path=o.name);
  return orphan_count<5;
end
$function$;
revoke all on function public.can_upload_chat_media_object(text) from public,anon;
grant execute on function public.can_upload_chat_media_object(text) to authenticated,service_role;

drop policy if exists chat_media_member_upload on storage.objects;
create policy chat_media_member_upload on storage.objects
for insert to authenticated
with check (
  bucket_id='chat-media'
  and public.can_upload_chat_media_object(name)
);

create or replace function public.send_message(cid uuid,p_body text default null,p_attachment_path text default null,p_reply_to uuid default null)
returns table(message_id uuid,message_created_at timestamptz)
language plpgsql
security definer
set search_path='public','storage'
as $function$
declare
  me uuid:=auth.uid();
  mid uuid;
  mts timestamptz;
  body_clean text;
  attachment_clean text;
  obj_mime text;
  obj_size bigint;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if cid is null or not public.is_conversation_member(cid) then raise exception 'forbidden'; end if;
  body_clean:=nullif(left(trim(coalesce(p_body,'')),1000),'');
  attachment_clean:=nullif(trim(coalesce(p_attachment_path,'')),'');
  if body_clean is null and attachment_clean is null then raise exception 'empty message'; end if;
  if p_reply_to is not null and not exists(select 1 from public.messages m where m.id=p_reply_to and m.conversation_id=cid) then raise exception 'invalid reply'; end if;
  if attachment_clean is not null then
    if attachment_clean !~ ('^' || cid::text || '/' || me::text || '/[0-9a-fA-F-]{36}[.]webp$') then raise exception 'invalid attachment path'; end if;
    select o.metadata->>'mimetype',coalesce((o.metadata->>'size')::bigint,0)
      into obj_mime,obj_size
    from storage.objects o
    where o.bucket_id='chat-media' and o.name=attachment_clean and o.owner_id=me::text;
    if obj_mime is null then raise exception 'attachment not found'; end if;
    if obj_mime<>'image/webp' then raise exception 'invalid attachment mime'; end if;
    if obj_size<=0 or obj_size>10485760 then raise exception 'invalid attachment size'; end if;
    if exists(select 1 from public.messages m where m.attachment_path=attachment_clean) then raise exception 'attachment already used'; end if;
  end if;
  perform public.check_rate_limit('send_message',120,3600);
  insert into public.messages(conversation_id,sender_id,body,attachment_path,reply_to_id)
  values(cid,me,body_clean,attachment_clean,p_reply_to)
  returning id,created_at into mid,mts;
  return query select mid,mts;
end
$function$;
revoke all on function public.send_message(uuid,text,text,uuid) from public,anon;
grant execute on function public.send_message(uuid,text,text,uuid) to authenticated,service_role;
