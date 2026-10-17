create or replace function public.before_user_created_enforce_tjsdates_age(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = 'public'
as $$
declare
  meta jsonb := coalesce(event->'user'->'user_metadata','{}'::jsonb);
  birth_text text := btrim(coalesce(meta->>'birth_date',''));
  bd date;
  age_ok boolean := lower(coalesce(meta->>'confirmed_18_plus','')) = 'true';
  terms_ok boolean := lower(coalesce(meta->>'accepted_terms','')) = 'true';
  privacy_ok boolean := lower(coalesce(meta->>'accepted_privacy','')) = 'true';
begin
  if birth_text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','TJSDATES requiere una fecha de nacimiento válida.'));
  end if;

  begin
    bd := birth_text::date;
  exception when others then
    return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','TJSDATES requiere una fecha de nacimiento válida.'));
  end;

  if bd > current_date - interval '18 years' or bd < current_date - interval '120 years' then
    return jsonb_build_object('error',jsonb_build_object('http_code',403,'message','TJSDATES es exclusivamente para personas de 18 años o más.'));
  end if;

  if not age_ok or not terms_ok or not privacy_ok then
    return jsonb_build_object('error',jsonb_build_object('http_code',400,'message','Debes confirmar que tienes 18 años o más y aceptar los Términos y la Política de Privacidad.'));
  end if;

  return '{}'::jsonb;
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.before_user_created_enforce_tjsdates_age(jsonb) to supabase_auth_admin;
revoke execute on function public.before_user_created_enforce_tjsdates_age(jsonb) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  birth_text text := btrim(coalesce(new.raw_user_meta_data->>'birth_date',''));
  bd date;
  terms_ok boolean := lower(coalesce(new.raw_user_meta_data->>'accepted_terms','')) = 'true';
  privacy_ok boolean := lower(coalesce(new.raw_user_meta_data->>'accepted_privacy','')) = 'true';
  age_ok boolean := lower(coalesce(new.raw_user_meta_data->>'confirmed_18_plus','')) = 'true';
begin
  if birth_text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
    raise exception 'TJSDATES requires a valid birth date';
  end if;

  begin
    bd := birth_text::date;
  exception when others then
    raise exception 'TJSDATES requires a valid birth date';
  end;

  if bd > current_date - interval '18 years' or bd < current_date - interval '120 years' then
    raise exception 'TJSDATES is only for adults 18+';
  end if;

  if not age_ok then
    raise exception 'TJSDATES requires 18+ confirmation';
  end if;
  if not terms_ok then
    raise exception 'TJSDATES requires Terms acceptance';
  end if;
  if not privacy_ok then
    raise exception 'TJSDATES requires Privacy Policy acceptance';
  end if;

  insert into public.profiles(id,display_name,birth_date)
  values(new.id, null, bd)
  on conflict (id) do update
    set birth_date = coalesce(public.profiles.birth_date, excluded.birth_date);

  insert into public.profile_visibility(user_id) values(new.id) on conflict do nothing;
  insert into public.preferences(user_id) values(new.id) on conflict do nothing;

  insert into public.consents(user_id,consent_type,document_version,granted)
  select new.id,'age_18_plus','1.0',true
  where not exists(select 1 from public.consents c where c.user_id=new.id and c.consent_type='age_18_plus' and c.granted=true);

  insert into public.consents(user_id,consent_type,document_version,granted)
  select new.id,'terms','1.0',true
  where not exists(select 1 from public.consents c where c.user_id=new.id and c.consent_type='terms' and c.granted=true);

  insert into public.consents(user_id,consent_type,document_version,granted)
  select new.id,'privacy','1.0',true
  where not exists(select 1 from public.consents c where c.user_id=new.id and c.consent_type='privacy' and c.granted=true);

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;