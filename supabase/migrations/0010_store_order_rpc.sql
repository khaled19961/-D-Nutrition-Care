create or replace function public.create_store_order(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_order uuid;
  v_subtotal numeric(12,2) := 0;
  v_item jsonb;
  v_product public.store_products%rowtype;
  v_qty integer;
  v_line numeric(12,2);
begin
  if v_user is null then raise exception 'not_authenticated'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception 'cart_empty'; end if;

  insert into public.store_orders(user_id, subtotal, total)
  values (v_user, 0, 0) returning id into v_order;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if not (v_item ? 'productId') or not (v_item ? 'quantity') then raise exception 'invalid_cart_item'; end if;
    v_qty := (v_item->>'quantity')::integer;
    if v_qty < 1 or v_qty > 100 then raise exception 'invalid_quantity'; end if;

    select * into v_product
    from public.store_products
    where id = (v_item->>'productId')::uuid and is_active = true
    for update;

    if not found then raise exception 'product_unavailable'; end if;
    if v_product.stock_quantity < v_qty then raise exception 'insufficient_stock'; end if;

    v_line := v_product.price * v_qty;
    v_subtotal := v_subtotal + v_line;

    insert into public.store_order_items(order_id, product_id, product_name_ar, unit_price, quantity, line_total)
    values (v_order, v_product.id, v_product.name_ar, v_product.price, v_qty, v_line);

    update public.store_products
    set stock_quantity = stock_quantity - v_qty, updated_at = now()
    where id = v_product.id;
  end loop;

  update public.store_orders
  set subtotal = v_subtotal, total = v_subtotal, updated_at = now()
  where id = v_order;

  return v_order;
exception when others then
  if v_order is not null then
    delete from public.store_orders where id = v_order;
  end if;
  raise;
end;
$$;

revoke all on function public.create_store_order(jsonb) from public;
grant execute on function public.create_store_order(jsonb) to authenticated;
