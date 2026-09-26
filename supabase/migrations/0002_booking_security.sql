-- D-Nutrition-Care: atomic booking and cancellation safeguards
-- Requires the base migration 0001_initial.sql.

create or replace function public.book_appointment(
  p_service_id uuid,
  p_slot_id uuid,
  p_booking_notes text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid := auth.uid();
  v_service public.services%rowtype;
  v_slot public.availability_slots%rowtype;
  v_appointment public.appointments%rowtype;
begin
  if v_patient_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = v_patient_id and role = 'patient' and is_active = true
  ) then
    raise exception 'patient_account_required';
  end if;

  select * into v_service
  from public.services
  where id = p_service_id
    and is_active = true
  for update;

  if not found then
    raise exception 'service_not_available';
  end if;

  select * into v_slot
  from public.availability_slots
  where id = p_slot_id
    and nutritionist_id = v_service.nutritionist_id
    and status = 'open'
    and starts_at > now()
  for update;

  if not found then
    raise exception 'slot_not_available';
  end if;

  if v_slot.ends_at <= v_slot.starts_at then
    raise exception 'invalid_slot';
  end if;

  if extract(epoch from (v_slot.ends_at - v_slot.starts_at)) / 60 < v_service.duration_minutes then
    raise exception 'slot_too_short';
  end if;

  insert into public.appointments (
    patient_id,
    nutritionist_id,
    service_id,
    slot_id,
    starts_at,
    ends_at,
    status,
    booking_notes
  )
  values (
    v_patient_id,
    v_service.nutritionist_id,
    v_service.id,
    v_slot.id,
    v_slot.starts_at,
    v_slot.starts_at + make_interval(mins => v_service.duration_minutes),
    'confirmed',
    nullif(trim(p_booking_notes), '')
  )
  returning * into v_appointment;

  update public.availability_slots
  set status = 'booked', updated_at = now()
  where id = v_slot.id;

  return v_appointment;
exception
  when unique_violation then
    raise exception 'slot_not_available';
end;
$$;

create or replace function public.cancel_appointment(
  p_appointment_id uuid,
  p_reason text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_appointment public.appointments%rowtype;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_appointment
  from public.appointments
  where id = p_appointment_id
    and (patient_id = v_user_id or nutritionist_id = public.my_nutritionist_id())
    and status in ('pending', 'confirmed')
  for update;

  if not found then
    raise exception 'appointment_not_cancellable';
  end if;

  if v_appointment.starts_at <= now() then
    raise exception 'appointment_already_started';
  end if;

  update public.appointments
  set
    status = 'cancelled',
    cancellation_reason = nullif(trim(p_reason), ''),
    updated_at = now()
  where id = v_appointment.id
  returning * into v_appointment;

  if v_appointment.slot_id is not null then
    update public.availability_slots
    set status = 'open', updated_at = now()
    where id = v_appointment.slot_id
      and status = 'booked';
  end if;

  return v_appointment;
end;
$$;

revoke all on function public.book_appointment(uuid, uuid, text) from public;
grant execute on function public.book_appointment(uuid, uuid, text) to authenticated;

revoke all on function public.cancel_appointment(uuid, text) from public;
grant execute on function public.cancel_appointment(uuid, text) to authenticated;

-- Public booking data must never expose slots already booked.
drop policy if exists "Public can read open slots" on public.availability_slots;
create policy "Public can read open future slots"
on public.availability_slots for select
to anon, authenticated
using (status = 'open' and starts_at > now());
