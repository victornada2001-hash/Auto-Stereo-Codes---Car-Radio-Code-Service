create or replace function public.is_conversation_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path='public'
as $$
  select case
    when auth.uid() is null or cid is null then false
    when not exists (
      select 1
      from public.profiles me
      where me.id=auth.uid()
        and me.is_active
        and coalesce(me.account_state,'active')='active'
    ) then false
    when not exists (
      select 1
      from public.conversation_members cm
      where cm.conversation_id=cid
        and cm.user_id=auth.uid()
        and cm.left_at is null
    ) then false
    when exists (
      select 1
      from public.conversations c
      where c.id=cid and c.kind='match'
    ) then exists (
      select 1
      from public.conversations c
      join public.matches m on m.id=c.match_id
      join public.profiles p_low on p_low.id=m.user_low
      join public.profiles p_high on p_high.id=m.user_high
      where c.id=cid
        and c.kind='match'
        and m.status='active'
        and auth.uid() in (m.user_low,m.user_high)
        and p_low.is_active
        and coalesce(p_low.account_state,'active')='active'
        and p_high.is_active
        and coalesce(p_high.account_state,'active')='active'
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id=m.user_low and b.blocked_id=m.user_high)
             or (b.blocker_id=m.user_high and b.blocked_id=m.user_low)
        )
    )
    else true
  end;
$$;

revoke all on function public.is_conversation_member(uuid) from public, anon;
grant execute on function public.is_conversation_member(uuid) to authenticated, service_role;
