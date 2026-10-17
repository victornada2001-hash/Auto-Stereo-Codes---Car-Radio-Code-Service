create or replace function public.export_my_data()
returns jsonb
language sql
stable
security definer
set search_path='public'
as $$
select jsonb_build_object(
  'generated_at', now(),
  'profile', (select to_jsonb(p) from public.profiles p where p.id=auth.uid()),
  'preferences', (select to_jsonb(x) from public.preferences x where x.user_id=auth.uid()),
  'visibility', (select to_jsonb(x) from public.profile_visibility x where x.user_id=auth.uid()),
  'location', (select to_jsonb(x) - 'user_id' from public.locations x where x.user_id=auth.uid()),
  'interests', coalesce((select jsonb_agg(jsonb_build_object('slug',i.slug,'name',i.name_es,'added_at',ui.created_at) order by ui.created_at) from public.user_interests ui join public.interests i on i.id=ui.interest_id where ui.user_id=auth.uid()),'[]'::jsonb),
  'photos', coalesce((select jsonb_agg(to_jsonb(x) - 'user_id' order by x.position) from public.profile_photos x where x.user_id=auth.uid()),'[]'::jsonb),
  'consents', coalesce((select jsonb_agg(to_jsonb(x) - 'user_id' - 'ip_hash' order by x.created_at) from public.consents x where x.user_id=auth.uid()),'[]'::jsonb),
  'blocks', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.blocks x where x.blocker_id=auth.uid()),'[]'::jsonb),
  'likes_sent', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.likes x where x.from_user_id=auth.uid()),'[]'::jsonb),
  'passes', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.passes x where x.from_user_id=auth.uid()),'[]'::jsonb),
  'matches', coalesce((select jsonb_agg(to_jsonb(x) order by x.matched_at) from public.matches x where x.user_low=auth.uid() or x.user_high=auth.uid()),'[]'::jsonb),
  'messages_sent', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.messages x where x.sender_id=auth.uid()),'[]'::jsonb),
  'reports_created', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.reports x where x.reporter_id=auth.uid()),'[]'::jsonb),
  'verifications', coalesce((select jsonb_agg(to_jsonb(x) - 'user_id' order by x.created_at) from public.verifications x where x.user_id=auth.uid()),'[]'::jsonb),
  'notification_preferences', (select to_jsonb(x) - 'user_id' from public.notification_preferences x where x.user_id=auth.uid()),
  'notifications', coalesce((select jsonb_agg(to_jsonb(x) - 'user_id' order by x.created_at desc) from public.notifications x where x.user_id=auth.uid()),'[]'::jsonb),
  'support_tickets', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.support_tickets x where x.user_id=auth.uid()),'[]'::jsonb),
  'support_replies', coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at) from public.support_ticket_replies r join public.support_tickets t on t.id=r.ticket_id where t.user_id=auth.uid()),'[]'::jsonb),
  'referrals', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.referrals x where x.referrer_id=auth.uid() or x.referred_id=auth.uid()),'[]'::jsonb),
  'account_deletion_request', (select to_jsonb(x) - 'last_error' from public.account_deletion_requests x where x.user_id=auth.uid()),
  'subscriptions', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.subscriptions x where x.user_id=auth.uid()),'[]'::jsonb),
  'payments', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.payments x where x.user_id=auth.uid()),'[]'::jsonb)
);
$$;
revoke all on function public.export_my_data() from public,anon;
grant execute on function public.export_my_data() to authenticated;
