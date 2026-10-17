create table if not exists public.date_safety_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  trusted_name text not null,
  trusted_contact text not null,
  venue_name text not null,
  venue_area text,
  starts_at timestamptz not null,
  checkin_at timestamptz not null,
  notes text,
  status text not null default 'planned' check (status in ('planned','safe','help','cancelled')),
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint date_safety_contact_len check (char_length(trusted_name) between 2 and 80 and char_length(trusted_contact) between 3 and 160),
  constraint date_safety_venue_len check (char_length(venue_name) between 2 and 160),
  constraint date_safety_notes_len check (notes is null or char_length(notes) <= 500),
  constraint date_safety_checkin_after_start check (checkin_at >= starts_at)
);
create index if not exists date_safety_plans_user_idx on public.date_safety_plans(user_id, created_at desc);
create index if not exists date_safety_plans_checkin_idx on public.date_safety_plans(checkin_at) where status='planned';
alter table public.date_safety_plans enable row level security;
revoke all on public.date_safety_plans from public, anon, authenticated;
grant select on public.date_safety_plans to authenticated;
drop policy if exists date_safety_self_read on public.date_safety_plans;
create policy date_safety_self_read on public.date_safety_plans for select to authenticated using (user_id=(select auth.uid()));

create or replace function public.create_date_safety_plan(p_match_id uuid,p_trusted_name text,p_trusted_contact text,p_venue_name text,p_venue_area text,p_starts_at timestamptz,p_checkin_at timestamptz,p_notes text default null) returns uuid
language plpgsql security definer set search_path='public' as $$
declare me uuid:=auth.uid(); out_id uuid;
begin
  if me is null then raise exception 'unauthenticated'; end if;
  if not exists(select 1 from public.matches m where m.id=p_match_id and m.status='active' and me in (m.user_low,m.user_high)) then raise exception 'invalid_match'; end if;
  if exists(select 1 from public.blocks b join public.matches m on m.id=p_match_id where (b.blocker_id=me and b.blocked_id=case when m.user_low=me then m.user_high else m.user_low end) or (b.blocked_id=me and b.blocker_id=case when m.user_low=me then m.user_high else m.user_low end)) then raise exception 'interaction_not_allowed'; end if;
  if char_length(trim(coalesce(p_trusted_name,''))) not between 2 and 80 then raise exception 'invalid_trusted_name'; end if;
  if char_length(trim(coalesce(p_trusted_contact,''))) not between 3 and 160 then raise exception 'invalid_trusted_contact'; end if;
  if char_length(trim(coalesce(p_venue_name,''))) not between 2 and 160 then raise exception 'invalid_venue'; end if;
  if p_starts_at is null or p_checkin_at is null or p_checkin_at < p_starts_at then raise exception 'invalid_time'; end if;
  if p_starts_at < now() - interval '2 hours' or p_starts_at > now() + interval '180 days' then raise exception 'invalid_time'; end if;
  insert into public.date_safety_plans(user_id,match_id,trusted_name,trusted_contact,venue_name,venue_area,starts_at,checkin_at,notes)
  values(me,p_match_id,trim(p_trusted_name),trim(p_trusted_contact),trim(p_venue_name),nullif(trim(coalesce(p_venue_area,'')),''),p_starts_at,p_checkin_at,nullif(left(trim(coalesce(p_notes,'')),500),'')) returning id into out_id;
  return out_id;
end $$;

create or replace function public.get_my_date_safety_plans(p_limit integer default 20)
returns table(id uuid, match_id uuid, match_name text, trusted_name text, trusted_contact text, venue_name text, venue_area text, starts_at timestamptz, checkin_at timestamptz, notes text, status text, checked_in_at timestamptz, created_at timestamptz)
language sql stable security definer set search_path='public' as $$
  select d.id,d.match_id,p.display_name,d.trusted_name,d.trusted_contact,d.venue_name,d.venue_area,d.starts_at,d.checkin_at,d.notes,d.status,d.checked_in_at,d.created_at
  from public.date_safety_plans d join public.matches m on m.id=d.match_id join public.profiles p on p.id=case when m.user_low=auth.uid() then m.user_high else m.user_low end
  where d.user_id=auth.uid() and auth.uid() is not null order by d.created_at desc limit least(greatest(coalesce(p_limit,20),1),100);
$$;

create or replace function public.update_date_safety_status(p_plan_id uuid,p_status text) returns void
language plpgsql security definer set search_path='public' as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if p_status not in ('safe','help','cancelled') then raise exception 'invalid_status'; end if;
  update public.date_safety_plans set status=p_status,checked_in_at=case when p_status in ('safe','help') then now() else checked_in_at end,updated_at=now() where id=p_plan_id and user_id=auth.uid() and status='planned';
  if not found then raise exception 'plan_not_available'; end if;
end $$;

revoke all on function public.create_date_safety_plan(uuid,text,text,text,text,timestamptz,timestamptz,text) from public, anon;
revoke all on function public.get_my_date_safety_plans(integer) from public, anon;
revoke all on function public.update_date_safety_status(uuid,text) from public, anon;
grant execute on function public.create_date_safety_plan(uuid,text,text,text,text,timestamptz,timestamptz,text) to authenticated;
grant execute on function public.get_my_date_safety_plans(integer) to authenticated;
grant execute on function public.update_date_safety_status(uuid,text) to authenticated;
