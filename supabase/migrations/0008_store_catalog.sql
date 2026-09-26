create table public.store_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.store_categories(id) on delete set null,
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  description_ar text,
  description_en text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_brands (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.store_brands(id) on delete set null,
  sku text unique,
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  description_ar text,
  description_en text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  currency text not null default 'SAR',
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default false,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_product_categories (
  product_id uuid not null references public.store_products(id) on delete cascade,
  category_id uuid not null references public.store_categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table public.store_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.store_products(id) on delete cascade,
  image_url text not null,
  alt_ar text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.store_bundles (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  slug text not null unique,
  description_ar text,
  description_en text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= price),
  currency text not null default 'SAR',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_bundle_items (
  bundle_id uuid not null references public.store_bundles(id) on delete cascade,
  product_id uuid not null references public.store_products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  primary key (bundle_id, product_id)
);

create table public.store_branches (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  address_ar text,
  address_en text,
  phone text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  opening_hours jsonb not null default '{}'::jsonb,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_store_categories_parent_sort on public.store_categories(parent_id, sort_order);
create index idx_store_brands_active on public.store_brands(is_active);
create index idx_store_products_brand_active on public.store_products(brand_id, is_active);
create index idx_store_products_featured on public.store_products(is_featured, is_active);
create index idx_store_products_new on public.store_products(is_new, is_active);
create index idx_store_product_categories_category on public.store_product_categories(category_id, product_id);
create index idx_store_product_images_product_sort on public.store_product_images(product_id, sort_order);
create index idx_store_bundles_active on public.store_bundles(is_active);
create index idx_store_bundle_items_product on public.store_bundle_items(product_id);
create index idx_store_branches_active on public.store_branches(is_active);

alter table public.store_categories enable row level security;
alter table public.store_brands enable row level security;
alter table public.store_products enable row level security;
alter table public.store_product_categories enable row level security;
alter table public.store_product_images enable row level security;
alter table public.store_bundles enable row level security;
alter table public.store_bundle_items enable row level security;
alter table public.store_branches enable row level security;

create policy "store_categories_public_read" on public.store_categories
for select to anon, authenticated
using (is_active = true or public.is_admin());

create policy "store_categories_admin_write" on public.store_categories
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "store_brands_public_read" on public.store_brands
for select to anon, authenticated
using (is_active = true or public.is_admin());

create policy "store_brands_admin_write" on public.store_brands
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "store_products_public_read" on public.store_products
for select to anon, authenticated
using ((is_active = true and stock_quantity > 0) or public.is_admin());

create policy "store_products_admin_write" on public.store_products
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "store_product_categories_public_read" on public.store_product_categories
for select to anon, authenticated
using (
  exists (
    select 1 from public.store_products p
    where p.id = product_id and (p.is_active = true or public.is_admin())
  )
);

create policy "store_product_categories_admin_write" on public.store_product_categories
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "store_product_images_public_read" on public.store_product_images
for select to anon, authenticated
using (
  exists (
    select 1 from public.store_products p
    where p.id = product_id and (p.is_active = true or public.is_admin())
  )
);

create policy "store_product_images_admin_write" on public.store_product_images
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "store_bundles_public_read" on public.store_bundles
for select to anon, authenticated
using ((is_active = true or public.is_admin()));

create policy "store_bundles_admin_write" on public.store_bundles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "store_bundle_items_public_read" on public.store_bundle_items
for select to anon, authenticated
using (
  exists (
    select 1 from public.store_bundles b
    where b.id = bundle_id and (b.is_active = true or public.is_admin())
  )
);

create policy "store_bundle_items_admin_write" on public.store_bundle_items
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "store_branches_public_read" on public.store_branches
for select to anon, authenticated
using (is_active = true or public.is_admin());

create policy "store_branches_admin_write" on public.store_branches
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
