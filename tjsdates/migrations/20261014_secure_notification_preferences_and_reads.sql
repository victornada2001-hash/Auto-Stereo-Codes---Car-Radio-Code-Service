create or replace function public.get_my_notification_preferences()
returns table(new_matches boolean,new_messages boolean,new_likes boolean,safety_alerts boolean,marketing boolean)
language sql
security definer
set search_path=public
as $$
  select np.new_matches,np.new_messages,np.new_likes,np.safety_alerts,np.marketing
  from public.notification_preferences np
  where np.user_id=auth.uid()
  union all
  select true,true,true,true,false
  where auth.uid() is not null and not exists(select 1 from public.notification_preferences x where x.user_id=auth.uid())
  limit 1;
$$;

create or replace function public.update_my_notification_preferences(
  p_new_matches boolean,
  p_new_messages boolean,
  p_new_likes boolean,
  p_safety_alerts boolean,
  p_marketing boolean
) returns void
language plpgsql
security definer
set search_path=public
as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  insert into public.notification_preferences(user_id,new_matches,new_messages,new_likes,safety_alerts,marketing,updated_at)
  values(auth.uid(),coalesce(p_new_matches,true),coalesce(p_new_messages,true),coalesce(p_new_likes,true),coalesce(p_safety_alerts,true),coalesce(p_marketing,false),now())
  on conflict(user_id) do update set
    new_matches=excluded.new_matches,
    new_messages=excluded.new_messages,
    new_likes=excluded.new_likes,
    safety_alerts=excluded.safety_alerts,
    marketing=excluded.marketing,
    updated_at=now();
end;
$$;

create or replace function public.mark_notification_read(notification_uuid uuid)
returns boolean
language plpgsql
security definer
set search_path=public
as $$
declare n integer;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  update public.notifications
  set read_at=coalesce(read_at,now())
  where id=notification_uuid and user_id=auth.uid();
  get diagnostics n=row_count;
  return n=1;
end;
$$;

revoke all on function public.get_my_notification_preferences() from public,anon;
revoke all on function public.update_my_notification_preferences(boolean,boolean,boolean,boolean,boolean) from public,anon;
revoke all on function public.mark_notification_read(uuid) from public,anon;
grant execute on function public.get_my_notification_preferences() to authenticated;
grant execute on function public.update_my_notification_preferences(boolean,boolean,boolean,boolean,boolean) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;

revoke insert,update,delete,truncate on public.notification_preferences from authenticated;
revoke update,delete,insert,truncate on public.notifications from authenticated;

drop policy if exists notification_preferences_self on public.notification_preferences;
create policy notification_preferences_self_read on public.notification_preferences for select to authenticated using (user_id=auth.uid());
drop policy if exists notifications_self_update on public.notifications;
