-- Secure patient progress entry: derive the nutritionist from the patient's program.
create or replace function public.record_progress(
  p_weight_kg numeric default null,
  p_height_cm numeric default null,
  p_body_fat_percentage numeric default null,
  p_waist_cm numeric default null,
  p_notes text default null
)
returns public.progress_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid := auth.uid();
  v_nutritionist_id uuid;
  v_record public.progress_records%rowtype;
  v_bmi numeric(7,2);
begin
  if v_patient_id is null then
    raise exception 'not_authenticated';
  end if;

  select pp.nutritionist_id
    into v_nutritionist_id
  from public.patient_programs pp
  where pp.patient_id = v_patient_id
    and pp.status in ('planned','active')
  order by
    case when pp.status = 'active' then 0 else 1 end,
    pp.start_date desc nulls last
  limit 1;

  if v_nutritionist_id is null then
    raise exception 'active_program_required';
  end if;

  if p_weight_kg is not null and p_height_cm is not null and p_weight_kg > 0 and p_height_cm > 0 then
    v_bmi := round((p_weight_kg / power(p_height_cm / 100, 2))::numeric, 2);
  end if;

  insert into public.progress_records (
    patient_id,
    nutritionist_id,
    weight_kg,
    height_cm,
    bmi,
    body_fat_percentage,
    waist_cm,
    notes
  )
  values (
    v_patient_id,
    v_nutritionist_id,
    p_weight_kg,
    p_height_cm,
    v_bmi,
    p_body_fat_percentage,
    p_waist_cm,
    nullif(trim(p_notes), '')
  )
  returning * into v_record;

  return v_record;
end;
$$;

revoke all on function public.record_progress(numeric,numeric,numeric,numeric,text) from public;
grant execute on function public.record_progress(numeric,numeric,numeric,numeric,text) to authenticated;
