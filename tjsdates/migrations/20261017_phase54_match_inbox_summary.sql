-- Phase 54: efficient, privacy-safe Match inbox summary.

create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);

create index if not exists messages_conversation_unread_idx
  on public.messages (conversation_id, sender_id, read_at)
  where read_at is null;

create or replace function public.get_my_match_inbox(p_limit integer default 100)
returns table(
  match_id uuid,
  conversation_id uuid,
  other_user_id uuid,
  display_name text,
  city text,
  is_verified boolean,
  relationship_goal text,
  last_active_at timestamptz,
  last_message_id uuid,
  last_message_body text,
  last_message_has_attachment boolean,
  last_message_sender_id uuid,
  last_message_at timestamptz,
  unread_count bigint,
  matched_at timestamptz
)
language sql
security definer
set search_path='public'
as $$
  with mine as (
    select
      m.id as match_id,
      c.id as conversation_id,
      case when m.user_low = auth.uid() then m.user_high else m.user_low end as other_user_id,
      m.matched_at as matched_at
    from public.matches m
    join public.conversations c on c.match_id = m.id
    where m.status = 'active'
      and auth.uid() is not null
      and auth.uid() in (m.user_low, m.user_high)
  )
  select
    x.match_id,
    x.conversation_id,
    x.other_user_id,
    p.display_name,
    p.city,
    coalesce(p.is_verified,false) as is_verified,
    p.relationship_goal,
    p.last_active_at,
    lm.id as last_message_id,
    lm.body as last_message_body,
    (lm.attachment_path is not null) as last_message_has_attachment,
    lm.sender_id as last_message_sender_id,
    lm.created_at as last_message_at,
    coalesce(uc.unread_count,0)::bigint as unread_count,
    x.matched_at
  from mine x
  join public.profiles p on p.id = x.other_user_id
  left join lateral (
    select mm.id, mm.body, mm.attachment_path, mm.sender_id, mm.created_at
    from public.messages mm
    where mm.conversation_id = x.conversation_id
    order by mm.created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select count(*)::bigint as unread_count
    from public.messages um
    where um.conversation_id = x.conversation_id
      and um.sender_id <> auth.uid()
      and um.read_at is null
  ) uc on true
  order by coalesce(lm.created_at,x.matched_at) desc
  limit greatest(1,least(coalesce(p_limit,100),100));
$$;

revoke all on function public.get_my_match_inbox(integer) from public, anon;
grant execute on function public.get_my_match_inbox(integer) to authenticated;
