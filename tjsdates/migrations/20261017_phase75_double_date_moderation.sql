-- Phase 75: harden Double Date moderation, blocking, suspension and member visibility.

create or replace function public.get_double_match_members(p_conversation_id uuid)
returns table(user_id uuid, display_name text, couple_id uuid, is_my_couple boolean, is_me boolean)
language sql stable security definer set search_path='public'
as $$
  with ctx as (
    select cm.id as couple_match_id, cm.couple_low, cm.couple_high
    from public.couple_match_conversations cmc
    join public.couple_matches cm on cm.id=cmc.couple_match_id
    where cmc.conversation_id=p_conversation_id
      and public.is_conversation_member(p_conversation_id)
    limit 1
  ), people as (
    select c.id as couple_id,c.created_by as user_id from public.couples c join ctx on c.id in (ctx.couple_low,ctx.couple_high)
    union all
    select c.id,c.partner_id from public.couples c join ctx on c.id in (ctx.couple_low,ctx.couple_high) where c.partner_id is not null
  ), mine as (
    select c.id from public.couples c where c.status='active' and auth.uid() in (c.created_by,c.partner_id) order by c.created_at desc limit 1
  )
  select p.user_id,pr.display_name,p.couple_id,p.couple_id=(select id from mine),p.user_id=auth.uid()
  from people p join public.profiles pr on pr.id=p.user_id
  where pr.is_active and coalesce(pr.account_state,'active')='active'
  order by p.couple_id,p.user_id
$$;
revoke execute on function public.get_double_match_members(uuid) from public,anon;
grant execute on function public.get_double_match_members(uuid) to authenticated,service_role;

-- Existing admin_set_account_state is extended so suspending/banning a Double Date member ends
-- their active/pending couple and closes any four-person conversations that depend on it.
-- Existing block_user is extended so blocking a current Double Date partner ends the pair,
-- while blocking someone in the matched couple closes that specific four-person conversation.
-- get_my_double_date now requires the caller and active partner to remain account-active.

-- The production definitions for these three functions were applied through the Supabase migration
-- named harden_double_date_moderation_and_account_state and are intentionally kept in database history.
