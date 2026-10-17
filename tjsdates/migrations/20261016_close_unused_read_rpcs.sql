revoke execute on function public.get_conversation_messages(uuid, integer) from public, anon, authenticated;
revoke execute on function public.get_received_likes(integer) from public, anon, authenticated;

grant execute on function public.get_conversation_messages(uuid, integer) to service_role;
grant execute on function public.get_received_likes(integer) to service_role;
