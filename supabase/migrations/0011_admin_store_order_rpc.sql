create or replace function public.admin_update_store_order(
  p_order_id uuid,
  p_status text default null,
  p_payment_status text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.store_orders%rowtype;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  select * into v_order
  from public.store_orders
  where id = p_order_id
  for update;

  if not found then raise exception 'order_not_found'; end if;

  if p_status is not null then
    if p_status not in ('pending','confirmed','processing','shipped','completed','cancelled') then
      raise exception 'invalid_status';
    end if;
    if p_status <> v_order.status then
      if v_order.status = 'pending' and p_status not in ('confirmed','cancelled') then raise exception 'invalid_status_transition'; end if;
      if v_order.status = 'confirmed' and p_status not in ('processing','cancelled') then raise exception 'invalid_status_transition'; end if;
      if v_order.status = 'processing' and p_status not in ('shipped','cancelled') then raise exception 'invalid_status_transition'; end if;
      if v_order.status = 'shipped' and p_status <> 'completed' then raise exception 'invalid_status_transition'; end if;
      if v_order.status in ('completed','cancelled') then raise exception 'invalid_status_transition'; end if;
    end if;
  end if;

  if p_payment_status is not null and p_payment_status not in ('pending','paid','failed','refunded') then
    raise exception 'invalid_payment_status';
  end if;

  update public.store_orders
  set status = coalesce(p_status,status),
      payment_status = coalesce(p_payment_status,payment_status),
      updated_at = now()
  where id = p_order_id;

  return true;
end;
$$;

revoke all on function public.admin_update_store_order(uuid,text,text) from public;
grant execute on function public.admin_update_store_order(uuid,text,text) to authenticated;
