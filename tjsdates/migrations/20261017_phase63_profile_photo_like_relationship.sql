create or replace function public.can_view_profile_photo(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and target_user is not null
    and (
      target_user = auth.uid()
      or public.is_admin(array['superadmin','admin','moderator'])
      or (
        not exists (
          select 1
          from public.blocks b
          where (b.blocker_id = auth.uid() and b.blocked_id = target_user)
             or (b.blocker_id = target_user and b.blocked_id = auth.uid())
        )
        and (
          exists (
            select 1
            from public.matches m
            where m.status = 'active'
              and ((m.user_low = auth.uid() and m.user_high = target_user)
                or (m.user_low = target_user and m.user_high = auth.uid()))
          )
          or exists (
            select 1
            from public.likes l
            where l.from_user_id = target_user
              and l.to_user_id = auth.uid()
          )
          or exists (
            select 1
            from public.profiles p
            left join public.profile_visibility v on v.user_id = p.id
            where p.id = target_user
              and coalesce(p.account_state,'active') = 'active'
              and coalesce(p.is_active,true) = true
              and coalesce(p.is_paused,false) = false
              and p.onboarding_complete = true
              and coalesce(v.discoverable,true) = true
              and coalesce(v.invisible_mode,false) = false
          )
        )
      )
    );
$$;

revoke all on function public.can_view_profile_photo(uuid) from public;
revoke all on function public.can_view_profile_photo(uuid) from anon;
grant execute on function public.can_view_profile_photo(uuid) to authenticated, service_role;
