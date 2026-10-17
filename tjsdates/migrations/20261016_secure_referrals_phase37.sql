revoke insert, update, delete on table public.referrals from authenticated;
drop policy if exists referrals_self_insert on public.referrals;

create or replace function public.get_or_create_my_referral_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  existing_code text;
  new_code text;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  select code into existing_code
  from public.referrals
  where referrer_id=uid and referred_id is null and status='pending'
  order by created_at desc
  limit 1;
  if existing_code is not null then return existing_code; end if;
  loop
    new_code := upper(substr(encode(gen_random_bytes(8),'hex'),1,10));
    begin
      insert into public.referrals(referrer_id,code,status,reward_data)
      values(uid,new_code,'pending','{}'::jsonb);
      return new_code;
    exception when unique_violation then
    end;
  end loop;
end;
$$;

create or replace function public.apply_referral_code(p_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  target_id uuid;
  normalized text := upper(trim(coalesce(p_code,'')));
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if length(normalized) < 6 or length(normalized) > 32 then raise exception 'invalid_referral_code'; end if;
  if exists(select 1 from public.referrals where referred_id=uid) then raise exception 'referral_already_used'; end if;
  select referrer_id into target_id
  from public.referrals
  where code=normalized and referred_id is null and status='pending'
  order by created_at desc
  limit 1
  for update;
  if target_id is null then raise exception 'invalid_referral_code'; end if;
  if target_id=uid then raise exception 'self_referral_not_allowed'; end if;
  update public.referrals
  set referred_id=uid,status='completed'
  where referrer_id=target_id and code=normalized and referred_id is null and status='pending';
  if not found then raise exception 'referral_unavailable'; end if;
  return true;
end;
$$;

revoke all on function public.get_or_create_my_referral_code() from public, anon;
revoke all on function public.apply_referral_code(text) from public, anon;
grant execute on function public.get_or_create_my_referral_code() to authenticated;
grant execute on function public.apply_referral_code(text) to authenticated;

create unique index if not exists referrals_one_referred_user_idx on public.referrals(referred_id) where referred_id is not null;
