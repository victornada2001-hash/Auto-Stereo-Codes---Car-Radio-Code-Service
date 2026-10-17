create or replace function public.get_my_matches()
returns table(match_id uuid, conversation_id uuid, other_user_id uuid, display_name text, city text, is_verified boolean, matched_at timestamptz)
language sql
stable
security definer
set search_path='public'
as $$
  with me as (
    select p.id from public.profiles p
    where p.id=auth.uid() and p.is_active and coalesce(p.account_state,'active')='active' and p.onboarding_complete=true
  )
  select m.id,c.id,p.id,p.display_name,p.city,coalesce(p.is_verified,false),m.matched_at
  from me
  join public.matches m on auth.uid() in (m.user_low,m.user_high)
  join public.profiles p on p.id=case when m.user_low=auth.uid() then m.user_high else m.user_low end
  left join public.conversations c on c.match_id=m.id
  where m.status='active'
    and p.is_active and coalesce(p.account_state,'active')='active' and p.onboarding_complete=true
    and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=p.id) or (b.blocker_id=p.id and b.blocked_id=auth.uid()))
  order by m.matched_at desc;
$$;

create or replace function public.get_my_match_inbox(p_limit integer default 100)
returns table(match_id uuid, conversation_id uuid, other_user_id uuid, display_name text, city text, is_verified boolean, relationship_goal text, last_active_at timestamptz, last_message_id uuid, last_message_body text, last_message_has_attachment boolean, last_message_sender_id uuid, last_message_at timestamptz, unread_count bigint, matched_at timestamptz)
language sql
stable
security definer
set search_path='public'
as $$
  with me as (
    select p.id from public.profiles p
    where p.id=auth.uid() and p.is_active and coalesce(p.account_state,'active')='active' and p.onboarding_complete=true
  ), mine as (
    select m.id as match_id,c.id as conversation_id,case when m.user_low=auth.uid() then m.user_high else m.user_low end as other_user_id,m.matched_at
    from me join public.matches m on auth.uid() in (m.user_low,m.user_high)
    join public.conversations c on c.match_id=m.id
    where m.status='active'
  )
  select x.match_id,x.conversation_id,x.other_user_id,p.display_name,p.city,coalesce(p.is_verified,false),p.relationship_goal,
         case when coalesce(v.show_recent_activity,true) then p.last_active_at else null end,
         lm.id,lm.body,(lm.attachment_path is not null),lm.sender_id,lm.created_at,coalesce(uc.unread_count,0)::bigint,x.matched_at
  from mine x
  join public.profiles p on p.id=x.other_user_id
  left join public.profile_visibility v on v.user_id=p.id
  left join lateral (select mm.id,mm.body,mm.attachment_path,mm.sender_id,mm.created_at from public.messages mm where mm.conversation_id=x.conversation_id order by mm.created_at desc limit 1) lm on true
  left join lateral (select count(*)::bigint as unread_count from public.messages um where um.conversation_id=x.conversation_id and um.sender_id<>auth.uid() and um.read_at is null) uc on true
  where p.is_active and coalesce(p.account_state,'active')='active' and p.onboarding_complete=true
    and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=p.id) or (b.blocker_id=p.id and b.blocked_id=auth.uid()))
  order by coalesce(lm.created_at,x.matched_at) desc
  limit greatest(1,least(coalesce(p_limit,100),100));
$$;

create or replace function public.get_my_match_history(lim integer default 50)
returns table(match_id uuid, other_user_id uuid, display_name text, city text, match_status text, matched_at timestamptz, ended_at timestamptz)
language sql
stable
security definer
set search_path='public'
as $$
  with me as (
    select p.id from public.profiles p
    where p.id=auth.uid() and p.is_active and coalesce(p.account_state,'active')='active' and p.onboarding_complete=true
  )
  select m.id,p.id,p.display_name,p.city,m.status,m.matched_at,m.ended_at
  from me
  join public.matches m on auth.uid() in (m.user_low,m.user_high)
  join public.profiles p on p.id=case when m.user_low=auth.uid() then m.user_high else m.user_low end
  where m.status<>'active'
    and p.is_active and coalesce(p.account_state,'active')='active' and p.onboarding_complete=true
    and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=p.id) or (b.blocker_id=p.id and b.blocked_id=auth.uid()))
  order by coalesce(m.ended_at,m.matched_at) desc
  limit least(greatest(coalesce(lim,50),1),100);
$$;

revoke execute on function public.get_my_matches() from public, anon;
revoke execute on function public.get_my_match_inbox(integer) from public, anon;
revoke execute on function public.get_my_match_history(integer) from public, anon;
grant execute on function public.get_my_matches() to authenticated, service_role;
grant execute on function public.get_my_match_inbox(integer) to authenticated, service_role;
grant execute on function public.get_my_match_history(integer) to authenticated, service_role;
