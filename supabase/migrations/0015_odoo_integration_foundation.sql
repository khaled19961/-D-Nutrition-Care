-- Odoo integration foundation for the store catalog and orders
alter table public.store_products
  add column if not exists odoo_product_id bigint,
  add column if not exists odoo_default_code text,
  add column if not exists odoo_sync_status text not null default 'not_connected'
    check (odoo_sync_status in ('not_connected','pending','synced','error')),
  add column if not exists odoo_last_synced_at timestamptz,
  add column if not exists odoo_sync_error text;

create unique index if not exists idx_store_products_odoo_product_id
  on public.store_products(odoo_product_id)
  where odoo_product_id is not null;

create index if not exists idx_store_products_odoo_sync_status
  on public.store_products(odoo_sync_status);

alter table public.store_orders
  add column if not exists odoo_order_id bigint,
  add column if not exists odoo_session_id bigint,
  add column if not exists odoo_sync_status text not null default 'not_connected'
    check (odoo_sync_status in ('not_connected','pending','synced','error')),
  add column if not exists odoo_last_synced_at timestamptz,
  add column if not exists odoo_sync_error text;

create unique index if not exists idx_store_orders_odoo_order_id
  on public.store_orders(odoo_order_id)
  where odoo_order_id is not null;

create index if not exists idx_store_orders_odoo_sync_status
  on public.store_orders(odoo_sync_status);

create table if not exists public.odoo_sync_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('product','order','session')),
  entity_id uuid,
  odoo_record_id bigint,
  direction text not null check (direction in ('pull','push')),
  status text not null check (status in ('started','success','error')),
  message text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_odoo_sync_logs_entity
  on public.odoo_sync_logs(entity_type, entity_id, created_at desc);

alter table public.odoo_sync_logs enable row level security;

create policy "odoo_sync_logs_admin_read"
  on public.odoo_sync_logs
  for select to authenticated
  using (public.is_admin());

create policy "odoo_sync_logs_admin_write"
  on public.odoo_sync_logs
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
