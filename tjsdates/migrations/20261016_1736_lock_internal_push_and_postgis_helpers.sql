-- Keep internal push delivery bookkeeping inaccessible to browser roles.
revoke all on table public.web_push_deliveries from anon, authenticated;
drop policy if exists web_push_deliveries_no_client_access on public.web_push_deliveries;
create policy web_push_deliveries_no_client_access on public.web_push_deliveries
  for all to authenticated using (false) with check (false);

-- These PostGIS helper RPCs are not used by TJSDATES clients; remove REST-callable access.
revoke execute on function public.st_estimatedextent(text,text) from public, anon, authenticated;
revoke execute on function public.st_estimatedextent(text,text,text) from public, anon, authenticated;
revoke execute on function public.st_estimatedextent(text,text,text,boolean) from public, anon, authenticated;
