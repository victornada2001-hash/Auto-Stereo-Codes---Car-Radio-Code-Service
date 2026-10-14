create or replace function private.enqueue_web_push_notification()
returns trigger language plpgsql security definer set search_path='public','private','extensions'
as $$
declare pref_ok boolean:=true;
begin
  pref_ok:=case new.type
    when 'match' then coalesce((select new_matches from public.notification_preferences where user_id=new.user_id),true)
    when 'message' then coalesce((select new_messages from public.notification_preferences where user_id=new.user_id),true)
    when 'like' then coalesce((select new_likes from public.notification_preferences where user_id=new.user_id),true)
    when 'safety' then coalesce((select safety_alerts from public.notification_preferences where user_id=new.user_id),true)
    when 'marketing' then coalesce((select marketing from public.notification_preferences where user_id=new.user_id),false)
    else true end;
  if pref_ok and exists(select 1 from public.device_tokens d where d.user_id=new.user_id and d.platform='web' and d.enabled) then
    perform net.http_post(
      url:='https://svaybfqheetndkahtbbc.supabase.co/functions/v1/send-web-push',
      headers:=jsonb_build_object('Content-Type','application/json','x-tjs-cron-secret',(select secret from private.cron_secrets where name='send-web-push')),
      body:=jsonb_build_object('notification_id',new.id),timeout_milliseconds:=15000);
  end if;
  return new;
end;$$;
revoke all on function private.enqueue_web_push_notification() from public,anon,authenticated;
drop trigger if exists notifications_enqueue_web_push on public.notifications;
create trigger notifications_enqueue_web_push after insert on public.notifications for each row execute function private.enqueue_web_push_notification();
drop function if exists public.enqueue_web_push_notification();
