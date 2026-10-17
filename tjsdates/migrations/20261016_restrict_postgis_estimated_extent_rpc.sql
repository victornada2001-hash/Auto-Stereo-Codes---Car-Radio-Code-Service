-- Best-effort hardening for PostGIS helper RPCs. On managed Supabase projects these
-- extension-owned ACLs may be restored/controlled by supabase_admin; verify advisors
-- after applying rather than assuming the REVOKE took effect.
revoke execute on function public.st_estimatedextent(text, text) from public, anon, authenticated;
revoke execute on function public.st_estimatedextent(text, text, text) from public, anon, authenticated;
revoke execute on function public.st_estimatedextent(text, text, text, boolean) from public, anon, authenticated;

grant execute on function public.st_estimatedextent(text, text) to service_role;
grant execute on function public.st_estimatedextent(text, text, text) to service_role;
grant execute on function public.st_estimatedextent(text, text, text, boolean) to service_role;
