-- TJSDATES phase 10 security hardening

-- Support tickets: users can create/read their own tickets, but only staff can change status.
drop policy if exists support_self_update on public.support_tickets;
create policy support_admin_update on public.support_tickets for update to authenticated using (public.is_admin(array['superadmin','admin','support'])) with check (public.is_admin(array['superadmin','admin','support']));

create or replace function public.force_support_ticket_defaults()
returns trigger language plpgsql security definer set search_path='public' as $$
begin
  if not public.is_admin(array['superadmin','admin','support']) then
    new.user_id := auth.uid();
    new.status := 'open';
  end if;
  return new;
end;$$;
revoke execute on function public.force_support_ticket_defaults() from public, anon, authenticated;
drop trigger if exists trg_force_support_ticket_defaults on public.support_tickets;
create trigger trg_force_support_ticket_defaults before insert on public.support_tickets for each row execute function public.force_support_ticket_defaults();

-- Plan owners can close a Planes TJ event.
create or replace function public.close_group_plan(group_uuid uuid)
returns void language plpgsql security definer set search_path='public' as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if not exists(select 1 from public.groups where id=group_uuid and owner_id=auth.uid() and status='active') then raise exception 'not owner or plan unavailable'; end if;
  update public.groups set status='closed' where id=group_uuid and owner_id=auth.uid();
  select conversation_id into cid from public.group_conversations where group_id=group_uuid;
  if cid is not null then update public.conversation_members set left_at=coalesce(left_at,now()) where conversation_id=cid; end if;
end;$$;
revoke all on function public.close_group_plan(uuid) from public, anon;
grant execute on function public.close_group_plan(uuid) to authenticated;

-- PostGIS helpers are not needed through the public API.
revoke execute on function public.st_estimatedextent(text,text) from anon, authenticated;
revoke execute on function public.st_estimatedextent(text,text,text) from anon, authenticated;
revoke execute on function public.st_estimatedextent(text,text,text,boolean) from anon, authenticated;

-- Server-side per-user rate limit state.
create table if not exists public.action_rate_limits (
  user_id uuid not null,
  action_key text not null,
  window_start timestamptz not null default now(),
  action_count integer not null default 0,
  primary key(user_id, action_key)
);
alter table public.action_rate_limits enable row level security;
revoke all on public.action_rate_limits from anon, authenticated;

create or replace function public.check_rate_limit(p_action text, p_limit integer, p_window_seconds integer)
returns void language plpgsql security definer set search_path='public' as $$
declare r public.action_rate_limits%rowtype; now_ts timestamptz:=now();
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if p_limit < 1 or p_window_seconds < 1 then raise exception 'invalid rate limit'; end if;
  select * into r from public.action_rate_limits where user_id=auth.uid() and action_key=p_action for update;
  if not found then
    insert into public.action_rate_limits(user_id,action_key,window_start,action_count) values(auth.uid(),p_action,now_ts,1);
    return;
  end if;
  if r.window_start + make_interval(secs=>p_window_seconds) <= now_ts then
    update public.action_rate_limits set window_start=now_ts,action_count=1 where user_id=auth.uid() and action_key=p_action;
    return;
  end if;
  if r.action_count >= p_limit then raise exception 'rate_limit_exceeded'; end if;
  update public.action_rate_limits set action_count=action_count+1 where user_id=auth.uid() and action_key=p_action;
end;$$;
revoke all on function public.check_rate_limit(text,integer,integer) from public, anon, authenticated;

-- Messages: sender is forced to auth.uid, membership is checked, content is bounded,
-- delivery/read/moderation trust fields are server-controlled, and abuse is rate-limited.
create or replace function public.guard_message_insert()
returns trigger language plpgsql security definer set search_path='public' as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if new.sender_id is distinct from auth.uid() then new.sender_id:=auth.uid(); end if;
  if not public.is_conversation_member(new.conversation_id) then raise exception 'not a conversation member'; end if;
  perform public.check_rate_limit('message',60,60);
  new.body:=nullif(left(trim(coalesce(new.body,'')),1000),'');
  if new.body is null and new.attachment_path is null then raise exception 'empty message'; end if;
  new.moderation_status:='pending';
  new.delivered_at:=null;
  new.read_at:=null;
  return new;
end;$$;
revoke execute on function public.guard_message_insert() from public,anon,authenticated;
drop trigger if exists trg_guard_message_insert on public.messages;
create trigger trg_guard_message_insert before insert on public.messages for each row execute function public.guard_message_insert();

-- Likes: force sender identity, reject self/blocked interactions and rate-limit abuse.
create or replace function public.guard_like_insert()
returns trigger language plpgsql security definer set search_path='public' as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  new.from_user_id:=auth.uid();
  if new.to_user_id=auth.uid() then raise exception 'cannot like yourself'; end if;
  if exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=new.to_user_id) or (b.blocker_id=new.to_user_id and b.blocked_id=auth.uid())) then raise exception 'blocked'; end if;
  perform public.check_rate_limit('like',120,3600);
  new.message:=case when new.message is null then null else left(trim(new.message),300) end;
  return new;
end;$$;
revoke execute on function public.guard_like_insert() from public,anon,authenticated;
drop trigger if exists trg_guard_like_insert on public.likes;
create trigger trg_guard_like_insert before insert on public.likes for each row execute function public.guard_like_insert();
