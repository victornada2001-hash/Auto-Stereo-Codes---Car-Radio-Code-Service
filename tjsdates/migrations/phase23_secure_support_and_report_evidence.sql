create or replace function public.create_support_ticket(p_category text, p_subject text, p_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ticket_id uuid;
  state text;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  select account_state into state from public.profiles where id=uid;
  if coalesce(state,'active') <> 'active' then raise exception 'account_restricted'; end if;
  p_category := lower(trim(coalesce(p_category,'')));
  p_subject := trim(coalesce(p_subject,''));
  p_message := trim(coalesce(p_message,''));
  if p_category not in ('account','safety','verification','technical','billing','other') then raise exception 'invalid_category'; end if;
  if length(p_subject) < 4 or length(p_subject) > 120 then raise exception 'invalid_subject'; end if;
  if length(p_message) < 10 or length(p_message) > 2000 then raise exception 'invalid_message'; end if;
  perform public.check_rate_limit('support_ticket_create', 8, 3600);
  insert into public.support_tickets(user_id,category,subject,message,status)
  values(uid,p_category,p_subject,p_message,'open')
  returning id into ticket_id;
  return ticket_id;
end;
$$;

create or replace function public.reply_support_ticket(ticket_uuid uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  reply_id uuid;
  ticket_status text;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  p_body := trim(coalesce(p_body,''));
  if length(p_body) < 1 or length(p_body) > 2000 then raise exception 'invalid_message'; end if;
  select status into ticket_status from public.support_tickets where id=ticket_uuid and user_id=uid;
  if ticket_status is null then raise exception 'ticket_not_found'; end if;
  if ticket_status='resolved' then raise exception 'ticket_closed'; end if;
  perform public.check_rate_limit('support_ticket_reply', 30, 3600);
  insert into public.support_ticket_replies(ticket_id,sender_id,sender_role,body)
  values(ticket_uuid,uid,'user',p_body)
  returning id into reply_id;
  update public.support_tickets set updated_at=now() where id=ticket_uuid;
  return reply_id;
end;
$$;

create or replace function public.register_report_evidence(report_uuid uuid, p_storage_path text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  evidence_id uuid;
  evidence_count integer;
  report_status text;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if p_storage_path is null or length(p_storage_path) > 500 then raise exception 'invalid_path'; end if;
  if p_storage_path !~ ('^' || uid::text || '/' || report_uuid::text || '/[0-9a-fA-F-]+\.(webp|pdf)$') then raise exception 'invalid_path'; end if;
  select status into report_status from public.reports where id=report_uuid and reporter_id=uid;
  if report_status is null then raise exception 'report_not_found'; end if;
  if report_status not in ('pending','reviewing') then raise exception 'report_closed'; end if;
  select count(*) into evidence_count from public.report_evidence where report_id=report_uuid;
  if evidence_count >= 3 then raise exception 'evidence_limit_reached'; end if;
  if not exists(select 1 from storage.objects where bucket_id='report-evidence' and name=p_storage_path and owner_id=uid::text) then
    raise exception 'storage_object_not_found';
  end if;
  perform public.check_rate_limit('report_evidence_register', 12, 3600);
  insert into public.report_evidence(report_id,storage_path) values(report_uuid,p_storage_path)
  returning id into evidence_id;
  return evidence_id;
end;
$$;

revoke insert, update, delete, truncate on public.support_tickets from authenticated;
revoke insert, update, delete, truncate on public.support_ticket_replies from authenticated;
revoke insert, update, delete, truncate on public.report_evidence from authenticated;
revoke update, delete, truncate on public.reports from authenticated;
revoke truncate on public.notifications from authenticated;

grant execute on function public.create_support_ticket(text,text,text) to authenticated;
grant execute on function public.reply_support_ticket(uuid,text) to authenticated;
grant execute on function public.register_report_evidence(uuid,text) to authenticated;
revoke execute on function public.create_support_ticket(text,text,text) from anon;
revoke execute on function public.reply_support_ticket(uuid,text) from anon;
revoke execute on function public.register_report_evidence(uuid,text) from anon;

drop policy if exists support_self_insert on public.support_tickets;
drop policy if exists support_reply_user_insert on public.support_ticket_replies;
drop policy if exists evidence_insert_reporter on public.report_evidence;
