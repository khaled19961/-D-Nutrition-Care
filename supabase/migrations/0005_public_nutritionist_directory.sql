-- Public nutritionist directory without exposing private profile columns.
create or replace function public.list_public_nutritionists()
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  years_experience integer,
  consultation_fee numeric,
  currency text
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    n.id,
    p.full_name,
    p.avatar_url,
    n.bio,
    n.years_experience,
    n.consultation_fee,
    n.currency
  from public.nutritionists n
  join public.profiles p on p.id = n.profile_id
  where n.verification_status = 'verified'
    and n.is_available = true
    and p.is_active = true
  order by n.years_experience desc nulls last, p.full_name asc;
$$;

create or replace function public.get_public_nutritionist(p_id uuid)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  bio text,
  years_experience integer,
  consultation_fee numeric,
  currency text
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    n.id,
    p.full_name,
    p.avatar_url,
    n.bio,
    n.years_experience,
    n.consultation_fee,
    n.currency
  from public.nutritionists n
  join public.profiles p on p.id = n.profile_id
  where n.id = p_id
    and n.verification_status = 'verified'
    and n.is_available = true
    and p.is_active = true
  limit 1;
$$;

revoke all on function public.list_public_nutritionists() from public;
grant execute on function public.list_public_nutritionists() to anon, authenticated;

revoke all on function public.get_public_nutritionist(uuid) from public;
grant execute on function public.get_public_nutritionist(uuid) to anon, authenticated;
