create unique index if not exists profile_photos_storage_path_key on public.profile_photos(storage_path);

create or replace function public.send_message(cid uuid, p_body text default null::text, p_attachment_path text default null::text, p_reply_to uuid default null::uuid)
returns table(message_id uuid, message_created_at timestamptz)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  me uuid:=auth.uid();
  mid uuid;
  mts timestamptz;
  body_clean text;
  attachment_clean text;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if cid is null or not public.is_conversation_member(cid) then raise exception 'forbidden'; end if;
  body_clean:=nullif(left(trim(coalesce(p_body,'')),1000),'');
  attachment_clean:=nullif(trim(coalesce(p_attachment_path,'')),'');
  if body_clean is null and attachment_clean is null then raise exception 'empty message'; end if;
  if p_reply_to is not null and not exists(select 1 from public.messages m where m.id=p_reply_to and m.conversation_id=cid) then raise exception 'invalid reply'; end if;
  if attachment_clean is not null and split_part(attachment_clean,'/',1)<>cid::text then raise exception 'invalid attachment path'; end if;
  if attachment_clean is not null and split_part(attachment_clean,'/',2)<>me::text then raise exception 'invalid attachment owner'; end if;
  if attachment_clean is not null and not exists (
    select 1 from storage.objects o where o.bucket_id='chat-media' and o.name=attachment_clean
  ) then raise exception 'attachment not found'; end if;
  insert into public.messages(conversation_id,sender_id,body,attachment_path,reply_to_id)
  values(cid,me,body_clean,attachment_clean,p_reply_to)
  returning id, created_at into mid, mts;
  return query select mid,mts;
end;
$function$;

revoke all on function public.send_message(uuid,text,text,uuid) from public, anon;
grant execute on function public.send_message(uuid,text,text,uuid) to authenticated;
