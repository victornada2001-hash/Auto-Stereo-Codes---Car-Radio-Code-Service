create or replace function public.send_message(cid uuid, p_body text default null, p_attachment_path text default null, p_reply_to uuid default null)
returns table(message_id uuid, message_created_at timestamptz)
language plpgsql
security definer
set search_path='public'
as $$
declare
  me uuid:=auth.uid();
  mid uuid;
  mts timestamptz;
  body_clean text;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if cid is null or not public.is_conversation_member(cid) then raise exception 'forbidden'; end if;
  body_clean:=nullif(left(trim(coalesce(p_body,'')),1000),'');
  if body_clean is null and nullif(trim(coalesce(p_attachment_path,'')),'') is null then raise exception 'empty message'; end if;
  if p_reply_to is not null and not exists(select 1 from public.messages m where m.id=p_reply_to and m.conversation_id=cid) then raise exception 'invalid reply'; end if;
  if p_attachment_path is not null and split_part(p_attachment_path,'/',1)<>cid::text then raise exception 'invalid attachment path'; end if;
  if p_attachment_path is not null and split_part(p_attachment_path,'/',2)<>me::text then raise exception 'invalid attachment owner'; end if;
  insert into public.messages(conversation_id,sender_id,body,attachment_path,reply_to_id)
  values(cid,me,body_clean,nullif(trim(coalesce(p_attachment_path,'')),''),p_reply_to)
  returning id, created_at into mid, mts;
  return query select mid,mts;
end;
$$;
revoke all on function public.send_message(uuid,text,text,uuid) from public, anon;
grant execute on function public.send_message(uuid,text,text,uuid) to authenticated;
revoke insert, update, delete on table public.messages from authenticated;
drop policy if exists messages_members_insert on public.messages;
