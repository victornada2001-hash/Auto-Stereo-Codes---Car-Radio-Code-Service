create or replace function public.get_group_plans(plan_limit integer default 50)
returns table(id uuid, owner_id uuid, title text, description text, city text, starts_at timestamptz, max_members smallint, member_count integer, joined boolean, is_owner boolean, conversation_id uuid)
language sql
stable
security definer
set search_path='public'
as $$
 select g.id,g.owner_id,g.title,g.description,g.city,g.starts_at,g.max_members,
   (select count(*)::int from public.group_members gm where gm.group_id=g.id),
   exists(select 1 from public.group_members gm where gm.group_id=g.id and gm.user_id=auth.uid()),
   g.owner_id=auth.uid(),gc.conversation_id
 from public.groups g
 join public.profiles owner on owner.id=g.owner_id
 left join public.group_conversations gc on gc.group_id=g.id
 where exists(select 1 from public.profiles me where me.id=auth.uid() and me.is_active and not me.is_paused and coalesce(me.account_state,'active')='active' and me.onboarding_complete)
   and g.status='active'
   and (
     g.starts_at>=now()
     or g.owner_id=auth.uid()
     or exists(select 1 from public.group_members mine where mine.group_id=g.id and mine.user_id=auth.uid())
   )
   and owner.is_active and coalesce(owner.account_state,'active')='active'
   and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=g.owner_id) or (b.blocker_id=g.owner_id and b.blocked_id=auth.uid()))
 order by (g.starts_at < now()) asc, g.starts_at asc
 limit least(greatest(plan_limit,1),100)
$$;

revoke all on function public.close_group_plan(uuid) from public, anon;
grant execute on function public.close_group_plan(uuid) to authenticated, service_role;

revoke all on function public.get_group_plans(integer) from public, anon;
grant execute on function public.get_group_plans(integer) to authenticated, service_role;
