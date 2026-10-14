create or replace function public.register_device_token(p_platform text, p_token text)
returns uuid language plpgsql security definer set search_path=public
as $$
declare uid uuid:=auth.uid(); out_id uuid; clean_platform text:=lower(trim(coalesce(p_platform,''))); clean_token text:=trim(coalesce(p_token,''));
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if clean_platform not in ('web','ios','android') then raise exception 'invalid_platform'; end if;
  if length(clean_token)<16 or length(clean_token)>4096 then raise exception 'invalid_token'; end if;
  perform public.check_rate_limit('device_token_register',30,3600);
  select id into out_id from public.device_tokens where token=clean_token and user_id=uid limit 1;
  if out_id is not null then update public.device_tokens set platform=clean_platform,enabled=true,updated_at=now() where id=out_id; return out_id; end if;
  if exists(select 1 from public.device_tokens where token=clean_token and user_id<>uid) then raise exception 'token_already_registered'; end if;
  insert into public.device_tokens(user_id,platform,token,enabled,updated_at) values(uid,clean_platform,clean_token,true,now()) returning id into out_id;
  return out_id;
end;$$;
revoke execute on function public.register_device_token(text,text) from public,anon;
grant execute on function public.register_device_token(text,text) to authenticated;

create or replace function public.create_like(target_user uuid, p_like_type text default 'like')
returns table(match_created boolean, match_id uuid, conversation_id uuid, remaining_likes integer)
language plpgsql security definer set search_path=public
as $$
declare me uuid:=auth.uid(); rank_now int:=0; today_count int:=0; existing_match uuid; conv uuid; inserted_count int:=0;
begin
  if me is null then raise exception 'not authenticated'; end if;
  perform public.check_rate_limit('like',120,3600);
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
  get diagnostics inserted_count=row_count;
  select m.id into existing_match from public.matches m where m.user_low=least(me,target_user) and m.user_high=greatest(me,target_user) and m.status='active';
  if existing_match is not null then select c.id into conv from public.conversations c where c.match_id=existing_match limit 1; end if;
  if inserted_count>0 and existing_match is null then
    insert into public.notifications(user_id,type,title,body,data)
    values(target_user,'like',case when p_like_type='highlighted' then 'Nuevo Like destacado' else 'A alguien le gustó tu perfil' end,
      case when p_like_type='highlighted' then 'Recibiste un Like destacado.' else 'Tienes un nuevo Like.' end,jsonb_build_object('like_type',p_like_type));
  end if;
  return query select existing_match is not null,existing_match,conv,
    case when rank_now=0 then greatest(0,25-(select count(*)::int from public.likes where from_user_id=me and created_at>=date_trunc('day',now()) and created_at<date_trunc('day',now())+interval '1 day')) else null end;
end;$$;
revoke execute on function public.create_like(uuid,text) from public,anon;
grant execute on function public.create_like(uuid,text) to authenticated;
