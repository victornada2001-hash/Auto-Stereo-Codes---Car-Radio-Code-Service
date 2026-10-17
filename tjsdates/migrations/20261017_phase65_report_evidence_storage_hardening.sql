-- Phase 65: bind report-evidence uploads to an open report owned by the uploader.

create or replace function public.can_upload_report_evidence_object(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path='public','storage'
as $function$
declare
  uid uuid:=auth.uid();
  parts text[];
  rid uuid;
  object_count integer;
begin
  if uid is null then return false; end if;
  parts:=storage.foldername(p_name);
  if coalesce(array_length(parts,1),0)<>2 then return false; end if;
  if parts[1]<>uid::text then return false; end if;
  begin rid:=parts[2]::uuid; exception when others then return false; end;
  if p_name !~ ('^' || uid::text || '/' || rid::text || '/[0-9a-fA-F-]{36}[.](webp|pdf)$') then return false; end if;
  if not exists(select 1 from public.reports r where r.id=rid and r.reporter_id=uid and r.status in ('pending','reviewing')) then return false; end if;
  select count(*) into object_count from storage.objects o
   where o.bucket_id='report-evidence' and o.owner_id=uid::text and o.name like uid::text || '/' || rid::text || '/%';
  return object_count<5;
end
$function$;
revoke all on function public.can_upload_report_evidence_object(text) from public,anon;
grant execute on function public.can_upload_report_evidence_object(text) to authenticated,service_role;

drop policy if exists report_evidence_upload on storage.objects;
create policy report_evidence_upload on storage.objects
for insert to authenticated
with check (
  bucket_id='report-evidence'
  and public.can_upload_report_evidence_object(name)
);

create or replace function public.register_report_evidence(report_uuid uuid,p_storage_path text)
returns uuid
language plpgsql
security definer
set search_path='public','storage'
as $function$
declare
  uid uuid:=auth.uid();
  evidence_id uuid;
  evidence_count integer;
  report_status text;
  obj_mime text;
  obj_size bigint;
begin
  if uid is null then raise exception 'unauthenticated'; end if;
  if p_storage_path is null or length(p_storage_path)>500 then raise exception 'invalid_path'; end if;
  if p_storage_path !~ ('^' || uid::text || '/' || report_uuid::text || '/[0-9a-fA-F-]{36}[.](webp|pdf)$') then raise exception 'invalid_path'; end if;
  select status into report_status from public.reports where id=report_uuid and reporter_id=uid;
  if report_status is null then raise exception 'report_not_found'; end if;
  if report_status not in ('pending','reviewing') then raise exception 'report_closed'; end if;
  select count(*) into evidence_count from public.report_evidence where report_id=report_uuid;
  if evidence_count>=3 then raise exception 'evidence_limit_reached'; end if;
  select o.metadata->>'mimetype',coalesce((o.metadata->>'size')::bigint,0)
    into obj_mime,obj_size
  from storage.objects o
  where o.bucket_id='report-evidence' and o.name=p_storage_path and o.owner_id=uid::text;
  if obj_mime is null then raise exception 'storage_object_not_found'; end if;
  if obj_mime not in ('image/webp','application/pdf') then raise exception 'invalid_evidence_mime'; end if;
  if obj_size<=0 or obj_size>10485760 then raise exception 'invalid_evidence_size'; end if;
  perform public.check_rate_limit('report_evidence_register',12,3600);
  insert into public.report_evidence(report_id,storage_path) values(report_uuid,p_storage_path)
  returning id into evidence_id;
  return evidence_id;
end
$function$;
revoke all on function public.register_report_evidence(uuid,text) from public,anon;
grant execute on function public.register_report_evidence(uuid,text) to authenticated,service_role;
