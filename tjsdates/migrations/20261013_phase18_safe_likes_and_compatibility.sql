create or replace function public.create_like(target_user uuid, p_like_type text default 'like')
returns table(match_created boolean, match_id uuid, conversation_id uuid, remaining_likes integer)
language plpgsql security definer set search_path='public'
as $$
declare me uuid:=auth.uid(); rank_now int:=0; today_count int:=0; existing_match uuid; conv uuid;
begin
 if me is null then raise exception 'not authenticated'; end if;
 if target_user is null or target_user=me then raise exception 'invalid target'; end if;
 if p_like_type not in ('like','highlighted') then raise exception 'invalid like type'; end if;
 if exists(select 1 from public.blocks b where (b.blocker_id=me and b.blocked_id=target_user) or (b.blocker_id=target_user and b.blocked_id=me)) then raise exception 'interaction not allowed'; end if;
 if not exists(select 1 from public.profiles p join public.profile_visibility v on v.user_id=p.id where p.id=target_user and p.is_active and not p.is_paused and v.discoverable) then raise exception 'profile unavailable'; end if;
 select coalesce(public.current_plan_rank(),0) into rank_now;
 if p_like_type='highlighted' and rank_now<2 then raise exception 'highlighted like requires Gold or Platinum'; end if;
 if rank_now=0 then
  select count(*) into today_count from public.likes where from_user_id=me and created_at>=date_trunc('day',now()) and created_at<date_trunc('day',now())+interval '1 day';
  if today_count>=25 then raise exception 'daily like limit reached'; end if;
 end if;
 insert into public.likes(from_user_id,to_user_id,like_type) values(me,target_user,p_like_type) on conflict(from_user_id,to_user_id) do nothing;
 select m.id into existing_match from public.matches m where m.user_low=least(me,target_user) and m.user_high=greatest(me,target_user) and m.status='active';
 if existing_match is not null then select c.id into conv from public.conversations c where c.match_id=existing_match limit 1; end if;
 return query select existing_match is not null,existing_match,conv,case when rank_now=0 then greatest(0,25-(select count(*)::int from public.likes where from_user_id=me and created_at>=date_trunc('day',now()) and created_at<date_trunc('day',now())+interval '1 day')) else null end;
end;$$;
revoke all on function public.create_like(uuid,text) from public,anon;
grant execute on function public.create_like(uuid,text) to authenticated;
revoke insert on public.likes from authenticated;

create or replace function public.get_candidate_compatibility(target_user uuid)
returns table(common_interest_count integer, common_interest_names text[], target_interest_names text[])
language sql stable security definer set search_path='public'
as $$
 select
  (select count(*)::int from public.user_interests a join public.user_interests b on b.interest_id=a.interest_id where a.user_id=auth.uid() and b.user_id=target_user),
  coalesce((select array_agg(i.name_es order by i.sort_order,i.id) from public.interests i join public.user_interests a on a.interest_id=i.id join public.user_interests b on b.interest_id=i.id where a.user_id=auth.uid() and b.user_id=target_user and i.is_active),'{}'::text[]),
  coalesce((select array_agg(i.name_es order by i.sort_order,i.id) from public.interests i join public.user_interests ui on ui.interest_id=i.id where ui.user_id=target_user and i.is_active),'{}'::text[])
 where auth.uid() is not null and target_user<>auth.uid()
 and exists(select 1 from public.profiles p join public.profile_visibility v on v.user_id=p.id where p.id=target_user and p.is_active and not p.is_paused and v.discoverable)
 and not exists(select 1 from public.blocks b where (b.blocker_id=auth.uid() and b.blocked_id=target_user) or (b.blocker_id=target_user and b.blocked_id=auth.uid()));
$$;
revoke all on function public.get_candidate_compatibility(uuid) from public,anon;
grant execute on function public.get_candidate_compatibility(uuid) to authenticated;
