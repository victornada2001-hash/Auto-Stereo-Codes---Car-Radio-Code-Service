revoke execute on function public.account_is_active(uuid) from public, anon, authenticated;
revoke execute on function public.current_plan_rank() from public, anon, authenticated;
revoke execute on function public.refresh_my_profile_quality() from public, anon, authenticated;

grant execute on function public.account_is_active(uuid) to service_role;
grant execute on function public.current_plan_rank() to service_role;
grant execute on function public.refresh_my_profile_quality() to service_role;
