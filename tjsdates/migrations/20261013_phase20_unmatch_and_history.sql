create or replace function public.unmatch(match_uuid uuid)
returns boolean
language plpgsql
security definer
set search_path='public'
as $$
declare me uuid:=auth.uid();
begin
  if me is null then raise exception 'not authenticated'; end if;
  update public.matches
     set status='unmatched', ended_at=coalesce(ended_at,now())
   where id=match_uuid and status='active' and (user_low=me or user_high=me);
  if not found then return false; end if;
  update public.conversation_members cm
     set left_at=coalesce(left_at,now())
    where cm.conversation_id in (select c.id from public.conversations c where c.match_id=match_uuid)
      and cm.left_at is null;
  return true;
end;
$$;
revoke all on function public.unmatch(uuid) from public, anon;
grant execute on function public.unmatch(uuid) to authenticated;

create or replace function public.get_my_match_history(lim integer default 50)
returns table(match_id uuid, other_user_id uuid, display_name text, city text, match_status text, matched_at timestamptz, ended_at timestamptz)
language sql
stable
security definer
set search_path='public'
as $$
 select m.id,
        case when m.user_low=auth.uid() then m.user_high else m.user_low end,
        p.display_name,p.city,m.status,m.matched_at,m.ended_at
 from public.matches m
 join public.profiles p on p.id=case when m.user_low=auth.uid() then m.user_high else m.user_low end
 where auth.uid() is not null
   and auth.uid() in (m.user_low,m.user_high)
   and m.status<>'active'
 order by coalesce(m.ended_at,m.matched_at) desc
 limit least(greatest(coalesce(lim,50),1),100);
$$;
revoke all on function public.get_my_match_history(integer) from public, anon;
grant execute on function public.get_my_match_history(integer) to authenticated;
