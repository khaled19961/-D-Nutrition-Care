alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('patient','employee','nutritionist','admin','super_admin'));

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin' and is_active = true
  );
$$;

drop policy if exists "nutritionists_owner_insert" on public.nutritionists;
create policy "nutritionists_admin_insert" on public.nutritionists
for insert to authenticated
with check (public.is_admin());

create or replace function public.prevent_staff_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_super_admin() then
    raise exception 'role_change_not_allowed';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
before update on public.profiles
for each row execute procedure public.prevent_staff_role_escalation();
