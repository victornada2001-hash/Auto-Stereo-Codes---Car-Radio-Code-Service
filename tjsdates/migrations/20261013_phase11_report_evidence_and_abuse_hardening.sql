create or replace function public.create_report(target_user uuid, report_reason text, report_comment text default null)
returns uuid
language plpgsql
security definer
set search_path='public'
as $$
declare rid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if target_user=auth.uid() then raise exception 'cannot report self'; end if;
  if report_reason not in ('perfil falso','spam','acoso','contenido sexual no solicitado','menor de edad','amenazas','discriminación','estafa','prostitución/explotación','fotografías robadas','suplantación','comportamiento peligroso','otro') then
    raise exception 'invalid reason';
  end if;
  if (select count(*) from public.reports where reporter_id=auth.uid() and created_at > now()-interval '1 hour') >= 10 then
    raise exception 'too many reports; try again later';
  end if;
  insert into public.reports(reporter_id,reported_user_id,reason,comment,status,risk_level)
  values(auth.uid(),target_user,report_reason,left(nullif(trim(report_comment),''),2000),'pending',
    case when report_reason in ('menor de edad','amenazas','comportamiento peligroso') then 'high' else 'medium' end)
  returning id into rid;
  return rid;
end;
$$;
revoke all on function public.create_report(uuid,text,text) from public, anon;
grant execute on function public.create_report(uuid,text,text) to authenticated;

revoke insert on table public.reports from authenticated, anon;

create index if not exists report_evidence_report_idx on public.report_evidence(report_id);
create index if not exists reports_reporter_created_idx on public.reports(reporter_id,created_at desc);

create policy "report_evidence_storage_read"
on storage.objects for select to authenticated
using (
  bucket_id='report-evidence' and (
    (storage.foldername(name))[1]=(select auth.uid())::text
    or exists (
      select 1
      from public.report_evidence re
      join public.reports r on r.id=re.report_id
      where re.storage_path=storage.objects.name
        and public.is_admin(array['superadmin','admin','moderator'])
    )
  )
);
