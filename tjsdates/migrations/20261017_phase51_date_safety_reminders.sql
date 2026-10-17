-- Phase 51: idempotent safety check-in reminders through the existing notifications/Web Push pipeline.
-- This migration is safe to apply more than once.

create table if not exists private.date_safety_reminder_events (
  plan_id uuid not null references public.date_safety_plans(id) on delete cascade,
  reminder_type text not null check (reminder_type in ('pre30','due','overdue15')),
  notification_id uuid references public.notifications(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key(plan_id, reminder_type)
);
revoke all on private.date_safety_reminder_events from public, anon, authenticated;

create or replace function private.process_date_safety_reminders()
returns integer
language plpgsql
security definer
set search_path='public','private'
as $$
declare
  r record;
  n_id uuid;
  inserted integer := 0;
  claimed integer;
begin
  -- 30 minutes before check-in. A wide enough window tolerates a delayed cron run;
  -- the unique event key prevents duplicate notices.
  for r in
    select d.id,d.user_id,d.checkin_at
    from public.date_safety_plans d
    where d.status='planned'
      and d.checkin_at > now()
      and d.checkin_at <= now() + interval '30 minutes'
  loop
    insert into private.date_safety_reminder_events(plan_id,reminder_type)
    values(r.id,'pre30') on conflict do nothing;
    get diagnostics claimed = row_count;
    if claimed=1 then
      insert into public.notifications(user_id,type,title,body,data)
      values(r.user_id,'safety','Check-in de seguridad','Tu check-in de seguridad es en menos de 30 minutos.',
        jsonb_build_object('kind','date_safety_pre30','plan_id',r.id,'checkin_at',r.checkin_at,'url','/'))
      returning id into n_id;
      update private.date_safety_reminder_events set notification_id=n_id where plan_id=r.id and reminder_type='pre30';
      inserted:=inserted+1;
    end if;
  end loop;

  -- Due at check-in time.
  for r in
    select d.id,d.user_id,d.checkin_at
    from public.date_safety_plans d
    where d.status='planned'
      and d.checkin_at <= now()
  loop
    insert into private.date_safety_reminder_events(plan_id,reminder_type)
    values(r.id,'due') on conflict do nothing;
    get diagnostics claimed = row_count;
    if claimed=1 then
      insert into public.notifications(user_id,type,title,body,data)
      values(r.user_id,'safety','Hora de tu check-in','Abre TJSDATES y confirma que estás bien.',
        jsonb_build_object('kind','date_safety_due','plan_id',r.id,'checkin_at',r.checkin_at,'url','/'))
      returning id into n_id;
      update private.date_safety_reminder_events set notification_id=n_id where plan_id=r.id and reminder_type='due';
      inserted:=inserted+1;
    end if;
  end loop;

  -- Escalated reminder after 15 minutes if the plan is still pending.
  for r in
    select d.id,d.user_id,d.checkin_at
    from public.date_safety_plans d
    where d.status='planned'
      and d.checkin_at <= now() - interval '15 minutes'
  loop
    insert into private.date_safety_reminder_events(plan_id,reminder_type)
    values(r.id,'overdue15') on conflict do nothing;
    get diagnostics claimed = row_count;
    if claimed=1 then
      insert into public.notifications(user_id,type,title,body,data)
      values(r.user_id,'safety','Check-in pendiente','Aún no has confirmado tu check-in. Abre TJSDATES para actualizar tu estado.',
        jsonb_build_object('kind','date_safety_overdue15','plan_id',r.id,'checkin_at',r.checkin_at,'url','/'))
      returning id into n_id;
      update private.date_safety_reminder_events set notification_id=n_id where plan_id=r.id and reminder_type='overdue15';
      inserted:=inserted+1;
    end if;
  end loop;

  return inserted;
end;
$$;

revoke all on function private.process_date_safety_reminders() from public, anon, authenticated;

-- Schedule every minute when pg_cron is available. Dynamic SQL prevents this migration
-- from failing on environments where pg_cron is not installed yet.
do $$
begin
  if exists(select 1 from pg_extension where extname='pg_cron') then
    begin
      execute 'select cron.unschedule(''tjsdates-date-safety-reminders'')';
    exception when others then
      null;
    end;
    execute $cron$
      select cron.schedule(
        'tjsdates-date-safety-reminders',
        '* * * * *',
        'select private.process_date_safety_reminders();'
      )
    $cron$;
  end if;
end;
$$;
