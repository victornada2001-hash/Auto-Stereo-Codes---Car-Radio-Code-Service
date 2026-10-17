create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer
set search_path='public'
as $$
begin
  insert into public.notifications(user_id,type,title,body,data)
  select cm.user_id,'message','Nuevo mensaje','Tienes un mensaje nuevo',jsonb_build_object('conversation_id',new.conversation_id)
  from public.conversation_members cm
  join public.profiles p on p.id=cm.user_id
  where cm.conversation_id=new.conversation_id
    and cm.user_id<>new.sender_id
    and cm.left_at is null
    and p.is_active
    and coalesce(p.account_state,'active')='active';
  return new;
end;
$$;

revoke all on function public.notify_new_message() from public, anon, authenticated;
grant execute on function public.notify_new_message() to service_role;
