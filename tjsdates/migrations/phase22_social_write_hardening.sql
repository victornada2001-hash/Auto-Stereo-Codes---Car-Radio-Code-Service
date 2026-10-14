begin;

-- All group and Double Date mutations must go through the validated SECURITY DEFINER RPCs.
revoke insert, update, delete on table public.groups from authenticated;
revoke insert, update, delete on table public.group_members from authenticated;
revoke insert, update, delete on table public.couples from authenticated;
revoke insert, update, delete on table public.couple_invites from authenticated;

-- Remove legacy broad write policies. Read policies remain in place.
drop policy if exists groups_owner_write on public.groups;
drop policy if exists group_members_self_write on public.group_members;
drop policy if exists couples_creator_insert on public.couples;
drop policy if exists couples_members_update on public.couples;

commit;
