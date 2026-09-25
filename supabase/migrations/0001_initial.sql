create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'patient' check (role in ('patient','nutritionist','admin','super_admin')),
  full_name text,
  phone text,
  avatar_url text,
  locale text not null default 'ar' check (locale in ('ar','en')),
  timezone text not null default 'Asia/Riyadh',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nutritionists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  bio text,
  license_number text,
  years_experience integer check (years_experience >= 0),
  consultation_fee numeric(12,2) not null default 0 check (consultation_fee >= 0),
  currency text not null default 'SAR',
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.nutritionist_specialties (
  nutritionist_id uuid not null references public.nutritionists(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete cascade,
  primary key (nutritionist_id, specialty_id)
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists(id) on delete cascade,
  name_ar text not null,
  name_en text not null,
  description_ar text,
  description_en text,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(12,2) not null default 0 check (price >= 0),
  currency text not null default 'SAR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'open' check (status in ('open','blocked','booked')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete restrict,
  nutritionist_id uuid not null references public.nutritionists(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  slot_id uuid unique references public.availability_slots(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled','no_show')),
  booking_notes text,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.nutrition_programs (
  id uuid primary key default gen_random_uuid(),
  nutritionist_id uuid not null references public.nutritionists(id) on delete cascade,
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  duration_days integer check (duration_days > 0),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patient_programs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.nutrition_programs(id) on delete restrict,
  nutritionist_id uuid not null references public.nutritionists(id) on delete restrict,
  start_date date not null,
  end_date date,
  status text not null default 'active' check (status in ('planned','active','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or end_date >= start_date)
);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.nutrition_programs(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  meal_type text not null,
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  calories numeric(10,2),
  protein_grams numeric(10,2),
  carbs_grams numeric(10,2),
  fat_grams numeric(10,2),
  sort_order integer not null default 0
);

create table public.progress_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  nutritionist_id uuid not null references public.nutritionists(id) on delete restrict,
  patient_program_id uuid references public.patient_programs(id) on delete set null,
  recorded_at timestamptz not null default now(),
  weight_kg numeric(7,2),
  height_cm numeric(7,2),
  bmi numeric(7,2),
  body_fat_percentage numeric(7,2),
  waist_cm numeric(7,2),
  notes text,
  created_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  target_value numeric(12,2),
  unit text,
  target_date date,
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  nutritionist_id uuid not null references public.nutritionists(id) on delete cascade,
  appointment_id uuid unique references public.appointments(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table public.article_categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  is_active boolean not null default true
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.article_categories(id) on delete set null,
  title_ar text not null,
  title_en text not null,
  slug text not null unique,
  excerpt_ar text,
  excerpt_en text,
  content_ar text not null,
  content_en text not null,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  patient_id uuid not null references public.profiles(id) on delete cascade,
  nutritionist_id uuid not null references public.nutritionists(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (patient_id, nutritionist_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete restrict,
  appointment_id uuid references public.appointments(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'SAR',
  provider text,
  provider_reference text,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  plan_name text not null,
  provider text,
  provider_reference text,
  status text not null default 'active' check (status in ('trialing','active','past_due','cancelled','expired')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index idx_nutritionists_profile on public.nutritionists(profile_id);
create index idx_services_nutritionist on public.services(nutritionist_id);
create index idx_slots_nutritionist_time on public.availability_slots(nutritionist_id, starts_at);
create index idx_appointments_patient on public.appointments(patient_id, starts_at desc);
create index idx_appointments_nutritionist on public.appointments(nutritionist_id, starts_at desc);
create index idx_patient_programs_patient on public.patient_programs(patient_id, status);
create index idx_progress_patient on public.progress_records(patient_id, recorded_at desc);
create index idx_goals_patient on public.goals(patient_id, status);
create index idx_articles_status_date on public.articles(status, published_at desc);
create index idx_notifications_profile on public.notifications(profile_id, created_at desc);
create index idx_payments_patient on public.payments(patient_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.nutritionists enable row level security;
alter table public.specialties enable row level security;
alter table public.nutritionist_specialties enable row level security;
alter table public.services enable row level security;
alter table public.availability_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.nutrition_programs enable row level security;
alter table public.patient_programs enable row level security;
alter table public.meals enable row level security;
alter table public.progress_records enable row level security;
alter table public.goals enable row level security;
alter table public.reviews enable row level security;
alter table public.article_categories enable row level security;
alter table public.articles enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;
alter table public.subscriptions enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','super_admin') and is_active = true
  );
$$;

create or replace function public.my_nutritionist_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.nutritionists
  where profile_id = auth.uid()
  limit 1;
$$;

create policy "profiles_select_own" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
for update to authenticated using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "nutritionists_public_read" on public.nutritionists
for select to anon, authenticated
using (verification_status = 'verified' and is_available = true or profile_id = auth.uid() or public.is_admin());

create policy "nutritionists_owner_insert" on public.nutritionists
for insert to authenticated with check (profile_id = auth.uid() or public.is_admin());

create policy "nutritionists_owner_update" on public.nutritionists
for update to authenticated using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy "specialties_public_read" on public.specialties
for select to anon, authenticated using (is_active = true or public.is_admin());

create policy "specialties_admin_write" on public.specialties
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "nutritionist_specialties_public_read" on public.nutritionist_specialties
for select to anon, authenticated using (true);

create policy "nutritionist_specialties_owner_write" on public.nutritionist_specialties
for all to authenticated using (nutritionist_id = public.my_nutritionist_id() or public.is_admin())
with check (nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "services_public_read" on public.services
for select to anon, authenticated using (is_active = true or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "services_owner_write" on public.services
for all to authenticated using (nutritionist_id = public.my_nutritionist_id() or public.is_admin())
with check (nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "slots_public_read" on public.availability_slots
for select to anon, authenticated using (status = 'open' or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "slots_owner_write" on public.availability_slots
for all to authenticated using (nutritionist_id = public.my_nutritionist_id() or public.is_admin())
with check (nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "appointments_patient_read" on public.appointments
for select to authenticated using (patient_id = auth.uid() or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "appointments_patient_insert" on public.appointments
for insert to authenticated with check (patient_id = auth.uid());

create policy "appointments_participant_update" on public.appointments
for update to authenticated using (patient_id = auth.uid() or nutritionist_id = public.my_nutritionist_id() or public.is_admin())
with check (patient_id = auth.uid() or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "programs_public_read" on public.nutrition_programs
for select to anon, authenticated using (status = 'published' or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "programs_owner_write" on public.nutrition_programs
for all to authenticated using (nutritionist_id = public.my_nutritionist_id() or public.is_admin())
with check (nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "patient_programs_participant_read" on public.patient_programs
for select to authenticated using (patient_id = auth.uid() or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "patient_programs_owner_write" on public.patient_programs
for all to authenticated using (nutritionist_id = public.my_nutritionist_id() or public.is_admin())
with check (nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "meals_read" on public.meals
for select to anon, authenticated using (
  exists (select 1 from public.nutrition_programs p where p.id = program_id and (p.status = 'published' or p.nutritionist_id = public.my_nutritionist_id() or public.is_admin()))
);

create policy "meals_owner_write" on public.meals
for all to authenticated using (
  exists (select 1 from public.nutrition_programs p where p.id = program_id and (p.nutritionist_id = public.my_nutritionist_id() or public.is_admin()))
) with check (
  exists (select 1 from public.nutrition_programs p where p.id = program_id and (p.nutritionist_id = public.my_nutritionist_id() or public.is_admin()))
);

create policy "progress_participant_read" on public.progress_records
for select to authenticated using (patient_id = auth.uid() or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "progress_patient_insert" on public.progress_records
for insert to authenticated with check (patient_id = auth.uid());

create policy "progress_participant_update" on public.progress_records
for update to authenticated using (patient_id = auth.uid() or nutritionist_id = public.my_nutritionist_id() or public.is_admin())
with check (patient_id = auth.uid() or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "goals_patient_read" on public.goals
for select to authenticated using (patient_id = auth.uid() or public.is_admin());

create policy "goals_patient_write" on public.goals
for all to authenticated using (patient_id = auth.uid() or public.is_admin())
with check (patient_id = auth.uid() or public.is_admin());

create policy "reviews_public_approved" on public.reviews
for select to anon, authenticated using (status = 'approved' or patient_id = auth.uid() or nutritionist_id = public.my_nutritionist_id() or public.is_admin());

create policy "reviews_patient_insert" on public.reviews
for insert to authenticated with check (patient_id = auth.uid());

create policy "reviews_moderation" on public.reviews
for update to authenticated using (patient_id = auth.uid() or public.is_admin())
with check (patient_id = auth.uid() or public.is_admin());

create policy "article_categories_public_read" on public.article_categories
for select to anon, authenticated using (is_active = true or public.is_admin());

create policy "article_categories_admin_write" on public.article_categories
for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "articles_public_read" on public.articles
for select to anon, authenticated using (status = 'published' or author_profile_id = auth.uid() or public.is_admin());

create policy "articles_author_write" on public.articles
for all to authenticated using (author_profile_id = auth.uid() or public.is_admin())
with check (author_profile_id = auth.uid() or public.is_admin());

create policy "favorites_own" on public.favorites
for all to authenticated using (patient_id = auth.uid() or public.is_admin())
with check (patient_id = auth.uid() or public.is_admin());

create policy "notifications_own" on public.notifications
for select to authenticated using (profile_id = auth.uid() or public.is_admin());

create policy "notifications_mark_read" on public.notifications
for update to authenticated using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy "payments_private" on public.payments
for select to authenticated using (patient_id = auth.uid() or public.is_admin());

create policy "subscriptions_private" on public.subscriptions
for select to authenticated using (patient_id = auth.uid() or public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
