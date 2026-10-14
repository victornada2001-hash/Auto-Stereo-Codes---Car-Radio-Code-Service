create extension if not exists pg_net;
create extension if not exists pg_cron;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.cron_secrets (
  name text primary key,
  secret text not null,
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);
revoke all on private.cron_secrets from public, anon, authenticated;

insert into private.cron_secrets(name,secret)
values('process-account-deletions',encode(gen_random_bytes(32),'hex'))
on conflict(name) do nothing;

alter table public.account_deletion_requests
  add column if not exists attempt_count integer not null default 0,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists last_error text;

create or replace function public.verify_internal_cron_secret(p_name text,p_secret text)
returns boolean
language sql
stable
security definer
set search_path='private','public'
as $$
  select exists(select 1 from private.cron_secrets where name=p_name and secret=p_secret);
$$;
revoke execute on function public.verify_internal_cron_secret(text,text) from public, anon, authenticated;
grant execute on function public.verify_internal_cron_secret(text,text) to service_role;

do $$
declare existing bigint;
begin
  select jobid into existing from cron.job where jobname='tjsdates-process-account-deletions' limit 1;
  if existing is not null then perform cron.unschedule(existing); end if;
  perform cron.schedule(
    'tjsdates-process-account-deletions',
    '17 * * * *',
    $job$
      select net.http_post(
        url := 'https://svaybfqheetndkahtbbc.supabase.co/functions/v1/process-account-deletions',
        headers := jsonb_build_object(
          'Content-Type','application/json',
          'x-tjs-cron-secret',(select secret from private.cron_secrets where name='process-account-deletions')
        ),
        body := jsonb_build_object('source','pg_cron'),
        timeout_milliseconds := 120000
      );
    $job$
  );
end $$;
