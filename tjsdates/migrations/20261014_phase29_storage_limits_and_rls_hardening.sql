-- Keep server-side storage limits aligned with browser rules.
update storage.buckets
set file_size_limit=10485760,
    allowed_mime_types=array['image/jpeg','image/png','image/webp']::text[]
where id in ('profile-photos','chat-media');

update storage.buckets
set file_size_limit=10485760,
    allowed_mime_types=array['image/jpeg','image/png','image/webp','application/pdf']::text[]
where id='report-evidence';

-- Evaluate auth.uid() once per storage policy statement.
do $$
declare r record; sql text; q text; c text;
begin
  for r in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='storage' and tablename='objects'
      and ((qual is not null and qual like '%auth.uid()%') or (with_check is not null and with_check like '%auth.uid()%'))
  loop
    q := case when r.qual is null then null else replace(r.qual,'auth.uid()','(select auth.uid())') end;
    c := case when r.with_check is null then null else replace(r.with_check,'auth.uid()','(select auth.uid())') end;
    sql := format('alter policy %I on %I.%I',r.policyname,r.schemaname,r.tablename);
    if q is not null then sql := sql || ' using (' || q || ')'; end if;
    if c is not null then sql := sql || ' with check (' || c || ')'; end if;
    execute sql;
  end loop;
end $$;

do $$
declare r record; sql text; q text; c text;
begin
  for r in select schemaname,tablename,policyname,qual,with_check from pg_policies
  where schemaname='storage' and tablename='objects'
    and ((qual is not null and qual like '%SELECT ( SELECT auth.uid()%') or (with_check is not null and with_check like '%SELECT ( SELECT auth.uid()%'))
  loop
    q:=r.qual; c:=r.with_check;
    if q is not null then q:=replace(q,'( SELECT ( SELECT auth.uid() AS uid) AS uid)','(select auth.uid())'); end if;
    if c is not null then c:=replace(c,'( SELECT ( SELECT auth.uid() AS uid) AS uid)','(select auth.uid())'); end if;
    sql:=format('alter policy %I on %I.%I',r.policyname,r.schemaname,r.tablename);
    if q is not null then sql:=sql||' using ('||q||')'; end if;
    if c is not null then sql:=sql||' with check ('||c||')'; end if;
    execute sql;
  end loop;
end $$;
