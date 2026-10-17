-- Optimize remaining RLS policies so auth.uid() is initialized once per statement.
do $$
declare r record; q text; wc text;
begin
  for r in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='public'
      and ((qual is not null and qual like '%auth.uid()%') or (with_check is not null and with_check like '%auth.uid()%'))
  loop
    q := case when r.qual is null then null else replace(r.qual,'auth.uid()','(select auth.uid())') end;
    wc := case when r.with_check is null then null else replace(r.with_check,'auth.uid()','(select auth.uid())') end;
    execute format(
      'alter policy %I on %I.%I %s %s',
      r.policyname, r.schemaname, r.tablename,
      case when q is null then '' else 'using ('||q||')' end,
      case when wc is null then '' else 'with check ('||wc||')' end
    );
  end loop;
end $$;
