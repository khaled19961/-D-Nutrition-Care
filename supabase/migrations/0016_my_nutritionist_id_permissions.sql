-- Explicitly grant application roles access to the SECURITY DEFINER helper
-- referenced by public service RLS policies, including anonymous service reads.
grant execute on function public.my_nutritionist_id() to anon, authenticated;
