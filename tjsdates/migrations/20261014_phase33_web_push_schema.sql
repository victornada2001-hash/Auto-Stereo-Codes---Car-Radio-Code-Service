-- Web Push schema. VAPID key material is provisioned separately and must never be committed.
create table if not exists private.push_config (
  id boolean primary key default true check(id),
  public_key text not null,
  private_key text not null,
  subject text not null,
  updated_at timestamptz not null default now()
);
revoke all on private.push_config from public, anon, authenticated;

insert into private.cron_secrets(name,secret)
values('send-web-push',encode(gen_random_bytes(32),'hex'))
on conflict(name) do nothing;

create or replace function public.get_web_push_public_key()
returns text language sql stable security definer set search_path='private','public'
as $$ select public_key from private.push_config where id=true $$;
revoke execute on function public.get_web_push_public_key() from public, anon;
grant execute on function public.get_web_push_public_key() to authenticated;

create or replace function public.get_web_push_server_config()
returns table(public_key text, private_key text, subject text)
language sql stable security definer set search_path='private','public'
as $$ select p.public_key,p.private_key,p.subject from private.push_config p where p.id=true $$;
revoke execute on function public.get_web_push_server_config() from public, anon, authenticated;
grant execute on function public.get_web_push_server_config() to service_role;

create table if not exists public.web_push_deliveries (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  device_token_id uuid not null references public.device_tokens(id) on delete cascade,
  status text not null default 'pending' check(status in ('pending','sent','failed','gone')),
  attempts integer not null default 0,
  last_attempt_at timestamptz,
  last_error text,
  primary key(notification_id,device_token_id)
);
alter table public.web_push_deliveries enable row level security;
revoke all on public.web_push_deliveries from anon, authenticated;

create or replace function public.enqueue_web_push_notification()
returns trigger language plpgsql security definer set search_path='public','private','extensions'
as $$
declare pref_ok boolean := true;
begin
  pref_ok := case new.type
    when 'match' then coalesce((select new_matches from public.notification_preferences where user_id=new.user_id),true)
    when 'message' then coalesce((select new_messages from public.notification_preferences where user_id=new.user_id),true)
    when 'like' then coalesce((select new_likes from public.notification_preferences where user_id=new.user_id),true)
    when 'safety' then coalesce((select safety_alerts from public.notification_preferences where user_id=new.user_id),true)
    when 'marketing' then coalesce((select marketing from public.notification_preferences where user_id=new.user_id),false)
    else true
  end;
  if pref_ok and exists(select 1 from public.device_tokens d where d.user_id=new.user_id and d.platform='web' and d.enabled) then
    perform net.http_post(
      url := 'https://svaybfqheetndkahtbbc.supabase.co/functions/v1/send-web-push',
      headers := jsonb_build_object('Content-Type','application/json','x-tjs-cron-secret',(select secret from private.cron_secrets where name='send-web-push')),
      body := jsonb_build_object('notification_id',new.id), timeout_milliseconds := 15000
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notifications_enqueue_web_push on public.notifications;
create trigger notifications_enqueue_web_push after insert on public.notifications
for each row execute function public.enqueue_web_push_notification();

-- Production setup requirement after applying this migration:
-- insert exactly one VAPID keypair into private.push_config using a secrets-management step.
