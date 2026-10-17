drop policy if exists groups_read on public.groups;
create policy groups_read on public.groups
for select to authenticated
using (
  is_admin(null::text[])
  or owner_id=(select auth.uid())
  or (
    status='active'
    and exists(select 1 from public.profiles me where me.id=(select auth.uid()) and me.is_active and not me.is_paused and coalesce(me.account_state,'active')='active' and me.onboarding_complete)
    and exists(select 1 from public.profiles owner where owner.id=groups.owner_id and owner.is_active and coalesce(owner.account_state,'active')='active')
    and not exists(select 1 from public.blocks b where (b.blocker_id=(select auth.uid()) and b.blocked_id=groups.owner_id) or (b.blocker_id=groups.owner_id and b.blocked_id=(select auth.uid())))
  )
);

create or replace function public.get_my_double_matches()
returns table(couple_match_id uuid, conversation_id uuid, other_couple_id uuid, member_one_name text, member_two_name text, created_at timestamptz)
language sql stable security definer set search_path='public' as $$
 with me_ok as (
  select p.id from public.profiles p where p.id=auth.uid() and p.is_active and not p.is_paused and coalesce(p.account_state,'active')='active' and p.onboarding_complete
 ), mine as (
  select c.id,c.created_by,c.partner_id from public.couples c cross join me_ok
  join public.profiles a on a.id=c.created_by join public.profiles b on b.id=c.partner_id
  where c.status='active' and (c.created_by=auth.uid() or c.partner_id=auth.uid())
   and a.is_active and coalesce(a.account_state,'active')='active'
   and b.is_active and coalesce(b.account_state,'active')='active'
  order by c.created_at desc limit 1
 ), rows as (
  select cm.id,cmc.conversation_id,case when cm.couple_low=m.id then cm.couple_high else cm.couple_low end as other_id,cm.created_at,m.created_by as my_one,m.partner_id as my_two
  from public.couple_matches cm join mine m on m.id in (cm.couple_low,cm.couple_high)
  join public.couple_match_conversations cmc on cmc.couple_match_id=cm.id
 )
 select r.id,r.conversation_id,r.other_id,p1.display_name,p2.display_name,r.created_at
 from rows r join public.couples oc on oc.id=r.other_id and oc.status='active'
 join public.profiles p1 on p1.id=oc.created_by join public.profiles p2 on p2.id=oc.partner_id
 where p1.is_active and coalesce(p1.account_state,'active')='active'
  and p2.is_active and coalesce(p2.account_state,'active')='active'
  and not exists(select 1 from public.blocks bl where (bl.blocker_id in (r.my_one,r.my_two) and bl.blocked_id in (oc.created_by,oc.partner_id)) or (bl.blocker_id in (oc.created_by,oc.partner_id) and bl.blocked_id in (r.my_one,r.my_two)))
 order by r.created_at desc
$$;
revoke all on function public.get_my_double_matches() from public, anon;
grant execute on function public.get_my_double_matches() to authenticated, service_role;
