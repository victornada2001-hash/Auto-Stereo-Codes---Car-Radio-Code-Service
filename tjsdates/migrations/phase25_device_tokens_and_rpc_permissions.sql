-- Phase 25: secure device tokens, remove anonymous RPC execution, and optimize selected RLS policies.

revoke all on table public.device_tokens from anon;
revoke insert, update, delete, truncate on table public.device_tokens from authenticated;
grant select on table public.device_tokens to authenticated;

alter policy device_tokens_self on public.device_tokens
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

alter policy notification_preferences_self_read on public.notification_preferences
  using (user_id = (select auth.uid()));

alter policy notifications_self_read on public.notifications
  using (user_id = (select auth.uid()));

alter policy support_self_read on public.support_tickets
  using ((user_id = (select auth.uid())) or is_admin(array['superadmin','admin','support']));

alter policy support_reply_read on public.support_ticket_replies
  using ((exists (select 1 from public.support_tickets t where t.id = support_ticket_replies.ticket_id and t.user_id = (select auth.uid()))) or is_admin(array['superadmin','admin','support']));

alter policy reports_insert_self on public.reports
  with check (reporter_id = (select auth.uid()));

alter policy reports_own_or_admin_read on public.reports
  using ((reporter_id = (select auth.uid())) or is_admin(array['superadmin','admin','moderator']));

alter policy evidence_reporter_or_admin on public.report_evidence
  using (exists (select 1 from public.reports r where r.id = report_evidence.report_id and (r.reporter_id = (select auth.uid()) or is_admin(array['superadmin','admin','moderator']))));

create or replace function public.register_device_token(p_platform text, p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  out_id uuid;
  clean_platform text := lower(trim(coalesce(p_platform,'')));
  clean_token text := trim(coalesce(p_token,''));
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if clean_platform not in ('web','ios','android') then raise exception 'invalid_platform'; end if;
  if length(clean_token) < 16 or length(clean_token) > 4096 then raise exception 'invalid_token'; end if;
  perform public.check_rate_limit('device_token_register',30,3600);

  insert into public.device_tokens(user_id,platform,token,enabled,updated_at)
  values(uid,clean_platform,clean_token,true,now())
  on conflict (token) do update
    set user_id=excluded.user_id, platform=excluded.platform, enabled=true, updated_at=now()
  returning id into out_id;
  return out_id;
end;
$$;

create or replace function public.disable_device_token(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affected integer;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  update public.device_tokens
     set enabled=false, updated_at=now()
   where user_id=auth.uid() and token=trim(coalesce(p_token,''));
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$;

revoke all on function public.register_device_token(text,text) from public, anon;
revoke all on function public.disable_device_token(text) from public, anon;
grant execute on function public.register_device_token(text,text) to authenticated;
grant execute on function public.disable_device_token(text) to authenticated;

revoke all on function public.create_support_ticket(text,text,text) from public, anon;
revoke all on function public.reply_support_ticket(uuid,text) from public, anon;
revoke all on function public.register_report_evidence(uuid,text) from public, anon;
revoke all on function public.get_my_notification_preferences() from public, anon;
revoke all on function public.update_my_notification_preferences(boolean,boolean,boolean,boolean,boolean) from public, anon;
revoke all on function public.mark_notification_read(uuid) from public, anon;
grant execute on function public.create_support_ticket(text,text,text) to authenticated;
grant execute on function public.reply_support_ticket(uuid,text) to authenticated;
grant execute on function public.register_report_evidence(uuid,text) to authenticated;
grant execute on function public.get_my_notification_preferences() to authenticated;
grant execute on function public.update_my_notification_preferences(boolean,boolean,boolean,boolean,boolean) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
