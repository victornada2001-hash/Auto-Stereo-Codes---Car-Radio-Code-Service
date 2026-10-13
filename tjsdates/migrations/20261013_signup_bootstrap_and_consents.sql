create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bd date;
  terms_ok boolean := coalesce((new.raw_user_meta_data->>'accepted_terms')::boolean,false);
  privacy_ok boolean := coalesce((new.raw_user_meta_data->>'accepted_privacy')::boolean,false);
  age_ok boolean := coalesce((new.raw_user_meta_data->>'confirmed_18_plus')::boolean,false);
begin
  if (new.raw_user_meta_data->>'birth_date') ~ '^\d{4}-\d{2}-\d{2}$' then
    bd := (new.raw_user_meta_data->>'birth_date')::date;
  end if;

  if bd is not null and bd > (current_date - interval '18 years')::date then
    raise exception 'TJSDATES is only for adults 18+';
  end if;

  insert into public.profiles(id,display_name,birth_date)
  values(new.id, null, bd)
  on conflict (id) do update set birth_date=coalesce(public.profiles.birth_date, excluded.birth_date);

  insert into public.profile_visibility(user_id) values(new.id) on conflict do nothing;
  insert into public.preferences(user_id) values(new.id) on conflict do nothing;

  if age_ok then
    insert into public.consents(user_id,consent_type,document_version,granted)
    select new.id,'age_18_plus','1.0',true
    where not exists(select 1 from public.consents c where c.user_id=new.id and c.consent_type='age_18_plus' and c.granted=true);
  end if;
  if terms_ok then
    insert into public.consents(user_id,consent_type,document_version,granted)
    select new.id,'terms','1.0',true
    where not exists(select 1 from public.consents c where c.user_id=new.id and c.consent_type='terms' and c.granted=true);
  end if;
  if privacy_ok then
    insert into public.consents(user_id,consent_type,document_version,granted)
    select new.id,'privacy','1.0',true
    where not exists(select 1 from public.consents c where c.user_id=new.id and c.consent_type='privacy' and c.granted=true);
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
