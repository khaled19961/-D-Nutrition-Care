-- Store checkout, customer snapshot, tax/payment fields, cancellation stock restoration
alter table public.store_orders
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists customer_email text,
  add column if not exists address_line1 text,
  add column if not exists district text,
  add column if not exists city text,
  add column if not exists postal_code text,
  add column if not exists delivery_notes text,
  add column if not exists shipping_method text not null default 'standard',
  add column if not exists shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  add column if not exists discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  add column if not exists tax_rate numeric(5,2) not null default 15 check (tax_rate >= 0),
  add column if not exists tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  add column if not exists payment_provider text,
  add column if not exists payment_transaction_id text,
  add column if not exists paid_at timestamptz;

create unique index if not exists idx_store_orders_payment_transaction
  on public.store_orders(payment_provider, payment_transaction_id)
  where payment_transaction_id is not null;

create or replace function public.create_store_order(p_items jsonb, p_customer jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path=public as $function$
declare v_user uuid:=auth.uid(); v_order uuid; v_subtotal numeric(12,2):=0; v_tax numeric(12,2):=0; v_total numeric(12,2):=0; v_item jsonb; v_product public.store_products%rowtype; v_qty integer; v_line numeric(12,2); v_name text:=nullif(trim(p_customer->>'name'),''); v_phone text:=nullif(trim(p_customer->>'phone'),''); v_email text:=coalesce(nullif(trim(auth.jwt()->>'email'),''),nullif(trim(p_customer->>'email'),''));
v_address text:=nullif(trim(p_customer->>'addressLine1'),''); v_district text:=nullif(trim(p_customer->>'district'),''); v_city text:=nullif(trim(p_customer->>'city'),''); v_postal text:=nullif(trim(p_customer->>'postalCode'),''); v_notes text:=nullif(trim(p_customer->>'deliveryNotes'),'');
begin
if v_user is null then raise exception 'not_authenticated'; end if;
if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'cart_empty'; end if;
if v_name is null then raise exception 'customer_name_required'; end if;
if v_phone is null then raise exception 'customer_phone_required'; end if;
if v_address is null then raise exception 'address_required'; end if;
if v_city is null then raise exception 'city_required'; end if;
insert into public.store_orders(user_id,customer_name,customer_phone,customer_email,address_line1,district,city,postal_code,delivery_notes,shipping_method,shipping_fee,discount_amount,tax_rate,tax_amount,subtotal,total)
values(v_user,v_name,v_phone,v_email,v_address,v_district,v_city,v_postal,v_notes,'standard',0,0,15,0,0,0) returning id into v_order;
for v_item in select value from jsonb_array_elements(p_items) loop
if not (v_item ? 'productId') or not (v_item ? 'quantity') then raise exception 'invalid_cart_item'; end if;
begin v_qty:=(v_item->>'quantity')::integer; exception when others then raise exception 'invalid_quantity'; end;
if v_qty<1 or v_qty>100 then raise exception 'invalid_quantity'; end if;
select * into v_product from public.store_products where id=(v_item->>'productId')::uuid and is_active=true for update;
if not found then raise exception 'product_unavailable'; end if;
if v_product.stock_quantity<v_qty then raise exception 'insufficient_stock'; end if;
v_line:=round(v_product.price*v_qty,2); v_subtotal:=v_subtotal+v_line;
insert into public.store_order_items(order_id,product_id,product_name_ar,unit_price,quantity,line_total) values(v_order,v_product.id,v_product.name_ar,v_product.price,v_qty,v_line);
update public.store_products set stock_quantity=stock_quantity-v_qty,updated_at=now() where id=v_product.id;
end loop;
v_tax:=round(v_subtotal-(v_subtotal/1.15),2); v_total:=round(v_subtotal,2);
update public.store_orders set subtotal=round(v_subtotal,2),tax_amount=v_tax,total=v_total,updated_at=now() where id=v_order;
return v_order;
exception when others then if v_order is not null then delete from public.store_orders where id=v_order; end if; raise;
end;$function$;

drop function if exists public.create_store_order(jsonb);
revoke all on function public.create_store_order(jsonb,jsonb) from public;
grant execute on function public.create_store_order(jsonb,jsonb) to authenticated;

create or replace function public.restore_cancelled_store_order_stock()
returns trigger language plpgsql security definer set search_path=public as $function$
declare v_item record;
begin
if old.status<>'cancelled' and new.status='cancelled' then
for v_item in select product_id,quantity from public.store_order_items where order_id=new.id and product_id is not null loop
update public.store_products set stock_quantity=stock_quantity+v_item.quantity,updated_at=now() where id=v_item.product_id;
end loop;
end if;
return new;
end;$function$;

drop trigger if exists trg_restore_cancelled_store_order_stock on public.store_orders;
create trigger trg_restore_cancelled_store_order_stock after update of status on public.store_orders for each row execute function public.restore_cancelled_store_order_stock();

create or replace function public.cancel_store_order(p_order_id uuid)
returns boolean language plpgsql security definer set search_path=public as $function$
declare v_user uuid:=auth.uid();
begin
if v_user is null then raise exception 'not_authenticated'; end if;
update public.store_orders set status='cancelled',updated_at=now() where id=p_order_id and status in('pending','confirmed') and (user_id=v_user or public.is_admin());
if not found then raise exception 'order_not_cancellable'; end if;
return true;
end;$function$;

revoke all on function public.cancel_store_order(uuid) from public;
grant execute on function public.cancel_store_order(uuid) to authenticated;
