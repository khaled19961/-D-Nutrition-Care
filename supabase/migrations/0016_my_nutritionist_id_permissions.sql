-- Keep the SECURITY DEFINER helper available to authenticated RLS policies,
-- but never expose it through the anonymous PostgREST role.
revoke all on function public.my_nutritionist_id() from public, anon;
grant execute on function public.my_nutritionist_id() to authenticated;
