revoke execute on function public.close_group_plan(uuid) from public, anon, authenticated;
grant execute on function public.close_group_plan(uuid) to service_role;
