create or replace function public.is_conversation_member(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $function$
  select case
    when auth.uid() is null or cid is null then false
    when not exists (
      select 1 from public.profiles me
      where me.id=auth.uid()
        and me.is_active
        and coalesce(me.account_state,'active')='active'
    ) then false
    when not exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id=cid
        and cm.user_id=auth.uid()
        and cm.left_at is null
    ) then false
    when exists (select 1 from public.conversations c where c.id=cid and c.kind='match') then exists (
      select 1
      from public.conversations c
      join public.matches m on m.id=c.match_id
      join public.profiles p_low on p_low.id=m.user_low
      join public.profiles p_high on p_high.id=m.user_high
      where c.id=cid
        and c.kind='match'
        and m.status='active'
        and auth.uid() in (m.user_low,m.user_high)
        and p_low.is_active and coalesce(p_low.account_state,'active')='active'
        and p_high.is_active and coalesce(p_high.account_state,'active')='active'
        and not exists (
          select 1 from public.blocks b
          where (b.blocker_id=m.user_low and b.blocked_id=m.user_high)
             or (b.blocker_id=m.user_high and b.blocked_id=m.user_low)
        )
    )
    when exists (select 1 from public.conversations c where c.id=cid and c.kind='double_date') then exists (
      select 1
      from public.couple_match_conversations cmc
      join public.couple_matches cm on cm.id=cmc.couple_match_id
      join public.couples a on a.id=cm.couple_low and a.status='active' and a.partner_id is not null
      join public.couples b on b.id=cm.couple_high and b.status='active' and b.partner_id is not null
      join public.profiles a1 on a1.id=a.created_by
      join public.profiles a2 on a2.id=a.partner_id
      join public.profiles b1 on b1.id=b.created_by
      join public.profiles b2 on b2.id=b.partner_id
      where cmc.conversation_id=cid
        and auth.uid() in (a.created_by,a.partner_id,b.created_by,b.partner_id)
        and a1.is_active and coalesce(a1.account_state,'active')='active'
        and a2.is_active and coalesce(a2.account_state,'active')='active'
        and b1.is_active and coalesce(b1.account_state,'active')='active'
        and b2.is_active and coalesce(b2.account_state,'active')='active'
        and not exists (
          select 1 from public.blocks bl
          where (bl.blocker_id in (a.created_by,a.partner_id) and bl.blocked_id in (b.created_by,b.partner_id))
             or (bl.blocker_id in (b.created_by,b.partner_id) and bl.blocked_id in (a.created_by,a.partner_id))
        )
    )
    when exists (select 1 from public.conversations c where c.id=cid and c.kind='group') then exists (
      select 1
      from public.group_conversations gc
      join public.groups g on g.id=gc.group_id and g.status='active'
      join public.profiles owner_p on owner_p.id=g.owner_id
      where gc.conversation_id=cid
        and owner_p.is_active
        and coalesce(owner_p.account_state,'active')='active'
        and exists (
          select 1 from public.group_members gm
          where gm.group_id=g.id and gm.user_id=auth.uid()
        )
        and not exists (
          select 1 from public.blocks bl
          where (bl.blocker_id=auth.uid() and bl.blocked_id=g.owner_id)
             or (bl.blocker_id=g.owner_id and bl.blocked_id=auth.uid())
        )
    )
    else false
  end;
$function$;

revoke all on function public.is_conversation_member(uuid) from public, anon;
grant execute on function public.is_conversation_member(uuid) to authenticated, service_role;

create or replace function public.leave_double_date()
returns void
language plpgsql
security definer
set search_path = public
as $function$
declare
  affected_couples uuid[];
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;

  select coalesce(array_agg(c.id), array[]::uuid[])
  into affected_couples
  from public.couples c
  where (c.created_by=auth.uid() or c.partner_id=auth.uid())
    and c.status in ('pending','active');

  if coalesce(array_length(affected_couples,1),0)=0 then return; end if;

  update public.couples
  set status='ended'
  where id=any(affected_couples);

  update public.conversation_members cmem
  set left_at=coalesce(cmem.left_at,now())
  where cmem.conversation_id in (
    select cmc.conversation_id
    from public.couple_match_conversations cmc
    join public.couple_matches cm on cm.id=cmc.couple_match_id
    where cm.couple_low=any(affected_couples)
       or cm.couple_high=any(affected_couples)
  );
end;
$function$;

revoke all on function public.leave_double_date() from public, anon;
grant execute on function public.leave_double_date() to authenticated, service_role;
