-- Only verified/available nutritionists should expose active services and bookable slots.
drop policy if exists "services_public_read" on public.services;
create policy "services_public_read"
on public.services
for select to anon, authenticated
using (
  is_active = true
  and exists (
    select 1 from public.nutritionists n
    where n.id = services.nutritionist_id
      and n.verification_status = 'verified'
      and n.is_available = true
  )
  or nutritionist_id = public.my_nutritionist_id()
  or public.is_admin()
);

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
  if v_patient_id is null then raise exception 'not_authenticated'; end if;

  if not exists (
    select 1 from public.profiles
    where id = v_patient_id and role = 'patient' and is_active = true
  ) then
    raise exception 'patient_account_required';
  end if;

  select s.* into v_service
  from public.services s
  join public.nutritionists n on n.id = s.nutritionist_id
  where s.id = p_service_id
    and s.is_active = true
    and n.verification_status = 'verified'
    and n.is_available = true
  for update;

  if not found then raise exception 'service_not_available'; end if;

  select * into v_slot
  from public.availability_slots
  where id = p_slot_id
    and nutritionist_id = v_service.nutritionist_id
    and status = 'open'
    and starts_at > now()
  for update;

  if not found then raise exception 'slot_not_available'; end if;
  if v_slot.ends_at <= v_slot.starts_at then raise exception 'invalid_slot'; end if;
  if extract(epoch from (v_slot.ends_at - v_slot.starts_at)) / 60 < v_service.duration_minutes then raise exception 'slot_too_short'; end if;

  insert into public.appointments (
    patient_id, nutritionist_id, service_id, slot_id, starts_at, ends_at, status, booking_notes
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
