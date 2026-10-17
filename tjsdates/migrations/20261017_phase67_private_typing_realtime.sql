drop policy if exists "tjsdates_typing_receive" on realtime.messages;
drop policy if exists "tjsdates_typing_send" on realtime.messages;

create policy "tjsdates_typing_receive"
on realtime.messages
for select
to authenticated
using (
  extension = 'broadcast'
  and realtime.topic() ~ '^typing-[0-9a-fA-F-]{36}$'
  and public.is_conversation_member(substring(realtime.topic() from 8)::uuid)
);

create policy "tjsdates_typing_send"
on realtime.messages
for insert
to authenticated
with check (
  extension = 'broadcast'
  and realtime.topic() ~ '^typing-[0-9a-fA-F-]{36}$'
  and public.is_conversation_member(substring(realtime.topic() from 8)::uuid)
);
