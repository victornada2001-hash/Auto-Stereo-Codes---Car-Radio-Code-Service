-- Remove duplicate permissive SELECT paths while preserving intended writes.
drop policy if exists locations_self_write on public.locations;
create policy locations_self_insert on public.locations for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy locations_self_update on public.locations for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy locations_self_delete on public.locations for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists plans_authenticated_read on public.plans;

drop policy if exists user_interests_self_write on public.user_interests;
create policy user_interests_self_insert on public.user_interests for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy user_interests_self_update on public.user_interests for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy user_interests_self_delete on public.user_interests for delete to authenticated
  using (user_id = (select auth.uid()));

-- Duplicate reports index: retain the more descriptive composite-name index.
drop index if exists public.reports_reporter_idx;

-- Cover remaining foreign keys reported by the database advisor.
create index if not exists audit_logs_admin_user_idx on public.audit_logs(admin_user_id);
create index if not exists boosts_user_idx on public.boosts(user_id);
create index if not exists consents_user_idx on public.consents(user_id);
create index if not exists couple_likes_created_by_idx on public.couple_likes(created_by);
create index if not exists couple_likes_to_couple_idx on public.couple_likes(to_couple_id);
create index if not exists couple_matches_high_idx on public.couple_matches(couple_high);
create index if not exists device_tokens_user_idx on public.device_tokens(user_id);
create index if not exists group_matches_high_idx on public.group_matches(group_high);
create index if not exists moderation_actions_admin_user_idx on public.moderation_actions(admin_user_id);
create index if not exists moderation_actions_report_idx on public.moderation_actions(report_id);
create index if not exists passes_to_user_idx on public.passes(to_user_id);
create index if not exists premium_likes_from_user_idx on public.premium_likes(from_user_id);
create index if not exists premium_likes_to_user_idx on public.premium_likes(to_user_id);
create index if not exists referrals_referred_idx on public.referrals(referred_id);
create index if not exists risk_events_user_idx on public.risk_events(user_id);
create index if not exists subscriptions_plan_idx on public.subscriptions(plan_id);
create index if not exists user_interests_interest_idx on public.user_interests(interest_id);

-- PostGIS helper is not part of the TJSDATES API and should not be callable through PostgREST.
revoke execute on function public.st_estimatedextent(text,text) from public, anon, authenticated;
revoke execute on function public.st_estimatedextent(text,text,text) from public, anon, authenticated;
revoke execute on function public.st_estimatedextent(text,text,text,boolean) from public, anon, authenticated;
