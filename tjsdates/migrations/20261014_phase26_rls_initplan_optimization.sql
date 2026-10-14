-- Phase 26: make auth.uid() in RLS policies an initplan so it is evaluated once per statement.
-- This preserves policy semantics while removing the Supabase auth_rls_initplan warnings.
do $$
declare r record; sql text; q text; c text;
begin
  for r in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='public'
      and ((qual is not null and qual like '%auth.uid()%') or (with_check is not null and with_check like '%auth.uid()%'))
  loop
    q := case when r.qual is null then null else replace(r.qual,'auth.uid()','(select auth.uid())') end;
    c := case when r.with_check is null then null else replace(r.with_check,'auth.uid()','(select auth.uid())') end;
    sql := format('alter policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    if q is not null then sql := sql || ' using (' || q || ')'; end if;
    if c is not null then sql := sql || ' with check (' || c || ')'; end if;
    execute sql;
  end loop;
end $$;

-- Normalize policies that had already been optimized by earlier migrations to avoid nested SELECTs.
do $$
declare r record; sql text; q text; c text;
begin
  for r in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='public'
      and ((qual is not null and qual like '%SELECT ( SELECT auth.uid()%') or (with_check is not null and with_check like '%SELECT ( SELECT auth.uid()%'))
  loop
    q := r.qual;
    c := r.with_check;
    if q is not null then q := replace(q,'( SELECT ( SELECT auth.uid() AS uid) AS uid)','(select auth.uid())'); end if;
    if c is not null then c := replace(c,'( SELECT ( SELECT auth.uid() AS uid) AS uid)','(select auth.uid())'); end if;
    sql := format('alter policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    if q is not null then sql := sql || ' using (' || q || ')'; end if;
    if c is not null then sql := sql || ' with check (' || c || ')'; end if;
    execute sql;
  end loop;
end $$;
