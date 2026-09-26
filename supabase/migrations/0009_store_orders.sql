create table public.store_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','shipped','completed','cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  currency text not null default 'SAR',
  subtotal numeric(12,2) not null check (subtotal >= 0),
  total numeric(12,2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.store_orders(id) on delete cascade,
  product_id uuid references public.store_products(id) on delete set null,
  product_name_ar text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create index idx_store_orders_user_created on public.store_orders(user_id, created_at desc);
create index idx_store_order_items_order on public.store_order_items(order_id);

alter table public.store_orders enable row level security;
alter table public.store_order_items enable row level security;

create policy "store_orders_owner_read" on public.store_orders
for select to authenticated using (user_id = auth.uid() or public.is_admin());

create policy "store_orders_admin_update" on public.store_orders
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "store_order_items_owner_read" on public.store_order_items
for select to authenticated using (
  exists (select 1 from public.store_orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);