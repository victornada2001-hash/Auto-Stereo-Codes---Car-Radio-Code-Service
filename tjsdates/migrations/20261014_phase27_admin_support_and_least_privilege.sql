-- Fix admin support reply to use the real admin_users.active column.
create or replace function public.admin_reply_support(ticket_uuid uuid, p_body text, p_status text default 'in_progress')
returns void
language plpgsql
security definer
set search_path=public
as $$
declare role_name text;
begin
  if not public.is_admin(array['superadmin','admin','support']) then raise exception 'forbidden'; end if;
  if length(trim(coalesce(p_body,'')))<1 then raise exception 'empty reply'; end if;
  if not exists(select 1 from public.support_tickets where id=ticket_uuid) then raise exception 'ticket not found'; end if;
  select role into role_name from public.admin_users where user_id=auth.uid() and active limit 1;
  insert into public.support_ticket_replies(ticket_id,sender_id,sender_role,body)
  values(ticket_uuid,auth.uid(),case when role_name in ('superadmin','admin','support') then role_name else 'support' end,left(trim(p_body),4000));
  update public.support_tickets
  set status=case when p_status in ('open','in_progress','resolved','closed') then p_status else 'in_progress' end,
      updated_at=now()
  where id=ticket_uuid;
end $$;
revoke execute on function public.admin_reply_support(uuid,text,text) from public, anon;
grant execute on function public.admin_reply_support(uuid,text,text) to authenticated;

-- Anonymous visitors use Supabase Auth endpoints only; application data is not public.
revoke all privileges on all tables in schema public from anon;
revoke truncate, references, trigger on all tables in schema public from authenticated;

-- Server/RPC-managed tables are read-only from the browser where RLS permits.
revoke insert, update, delete on table
  public.account_deletion_requests, public.admin_users, public.audit_logs, public.blocks,
  public.boosts, public.consents, public.conversation_members, public.conversations,
  public.couple_invites, public.couple_likes, public.couple_match_conversations,
  public.couple_matches, public.couples, public.coupons, public.device_tokens,
  public.explore_categories, public.group_conversations, public.group_matches,
  public.group_members, public.groups, public.interests, public.likes, public.locations,
  public.matches, public.messages, public.moderation_actions, public.notification_preferences,
  public.notifications, public.passes, public.payments, public.plans, public.premium_likes,
  public.profile_photos, public.report_evidence, public.reports, public.risk_events,
  public.subscriptions, public.support_ticket_replies, public.support_tickets,
  public.user_interests, public.verifications
from authenticated;
