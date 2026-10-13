-- Applied to Supabase project svaybfqheetndkahtbbc.
-- Phase 16: private interests, profile editor RPCs and profile quality scoring.

drop policy if exists user_interests_read on public.user_interests;
create policy user_interests_read_self_or_admin on public.user_interests
for select to authenticated
using (user_id=(select auth.uid()) or public.is_admin(array['superadmin','admin','moderator']));

create or replace function public.set_my_interests(p_interest_ids bigint[])
returns void language plpgsql security definer set search_path=public as $$
declare uid uuid:=auth.uid(); cnt int;
begin
 if uid is null then raise exception 'not authenticated'; end if;
 select count(*) into cnt from unnest(coalesce(p_interest_ids,'{}'::bigint[])) x;
 if cnt>10 then raise exception 'maximum 10 interests'; end if;
 if exists(select 1 from unnest(coalesce(p_interest_ids,'{}'::bigint[])) x left join public.interests i on i.id=x where i.id is null or not i.is_active) then raise exception 'invalid interest'; end if;
 delete from public.user_interests where user_id=uid;
 insert into public.user_interests(user_id,interest_id)
 select uid,x from unnest(coalesce(p_interest_ids,'{}'::bigint[])) x on conflict do nothing;
end$$;
revoke all on function public.set_my_interests(bigint[]) from public,anon;
grant execute on function public.set_my_interests(bigint[]) to authenticated;

create or replace function public.get_my_profile_editor()
returns table(display_name text,city text,gender text,gender_identity text,pronouns text,sexual_orientation text,relationship_goal text,bio text,occupation text,company text,school text,height_cm int,languages text[],zodiac_sign text,exercise text,smoking text,alcohol text,diet text,pets text,children text,wants_children text,sleep_habits text,profile_quality_score smallint,interest_ids bigint[])
language sql stable security definer set search_path=public as $$
 select p.display_name,p.city,p.gender,p.gender_identity,p.pronouns,p.sexual_orientation,p.relationship_goal,p.bio,p.occupation,p.company,p.school,p.height_cm,p.languages,p.zodiac_sign,p.exercise,p.smoking,p.alcohol,p.diet,p.pets,p.children,p.wants_children,p.sleep_habits,p.profile_quality_score,
 coalesce((select array_agg(ui.interest_id order by ui.interest_id) from public.user_interests ui where ui.user_id=p.id),'{}'::bigint[])
 from public.profiles p where p.id=auth.uid();
$$;
revoke all on function public.get_my_profile_editor() from public,anon;
grant execute on function public.get_my_profile_editor() to authenticated;

create or replace function public.recalculate_profile_quality(target_user uuid)
returns smallint language plpgsql security definer set search_path=public as $$
declare p public.profiles%rowtype; score int:=0; photos int:=0; ints int:=0;
begin
 select * into p from public.profiles where id=target_user;
 if not found then return 0; end if;
 if coalesce(length(trim(p.display_name)),0)>=2 then score:=score+10; end if;
 if p.birth_date is not null then score:=score+10; end if;
 if p.gender is not null then score:=score+5; end if;
 if p.relationship_goal is not null then score:=score+5; end if;
 if coalesce(length(trim(p.bio)),0)>=40 then score:=score+15; elsif coalesce(length(trim(p.bio)),0)>=10 then score:=score+8; end if;
 if p.city is not null then score:=score+5; end if;
 if p.occupation is not null or p.school is not null then score:=score+5; end if;
 if p.height_cm is not null then score:=score+3; end if;
 if cardinality(coalesce(p.languages,'{}'::text[]))>0 then score:=score+2; end if;
 select count(*) into photos from public.profile_photos where user_id=target_user and moderation_status='approved';
 score:=score+least(25,photos*5);
 select count(*) into ints from public.user_interests where user_id=target_user;
 score:=score+least(15,ints*3);
 score:=least(100,score);
 update public.profiles set profile_quality_score=score where id=target_user;
 return score::smallint;
end$$;
revoke all on function public.recalculate_profile_quality(uuid) from public,anon,authenticated;

create or replace function public.refresh_my_profile_quality()
returns smallint language sql security definer set search_path=public as $$ select public.recalculate_profile_quality(auth.uid()) $$;
revoke all on function public.refresh_my_profile_quality() from public,anon;
grant execute on function public.refresh_my_profile_quality() to authenticated;

create or replace function public.tg_refresh_profile_quality_from_interest()
returns trigger language plpgsql security definer set search_path=public as $$ begin perform public.recalculate_profile_quality(coalesce(new.user_id,old.user_id)); return coalesce(new,old); end $$;
revoke all on function public.tg_refresh_profile_quality_from_interest() from public,anon,authenticated;
drop trigger if exists trg_refresh_quality_interest on public.user_interests;
create trigger trg_refresh_quality_interest after insert or delete on public.user_interests for each row execute function public.tg_refresh_profile_quality_from_interest();

create or replace function public.tg_refresh_profile_quality_from_photo()
returns trigger language plpgsql security definer set search_path=public as $$ begin perform public.recalculate_profile_quality(coalesce(new.user_id,old.user_id)); return coalesce(new,old); end $$;
revoke all on function public.tg_refresh_profile_quality_from_photo() from public,anon,authenticated;
drop trigger if exists trg_refresh_quality_photo on public.profile_photos;
create trigger trg_refresh_quality_photo after insert or update of moderation_status or delete on public.profile_photos for each row execute function public.tg_refresh_profile_quality_from_photo();
