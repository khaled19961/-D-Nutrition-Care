-- Harden reviews and article authoring.
drop policy if exists "reviews_patient_insert" on public.reviews;
drop policy if exists "reviews_moderation" on public.reviews;

create or replace function public.submit_review(
  p_appointment_id uuid,
  p_rating integer,
  p_comment text default null
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_patient_id uuid := auth.uid();
  v_appointment public.appointments%rowtype;
  v_review public.reviews%rowtype;
begin
  if v_patient_id is null then raise exception 'not_authenticated'; end if;
  if p_rating < 1 or p_rating > 5 then raise exception 'invalid_rating'; end if;

  select * into v_appointment
  from public.appointments
  where id = p_appointment_id
    and patient_id = v_patient_id
    and status = 'completed'
  for update;

  if not found then raise exception 'completed_appointment_required'; end if;

  if exists (select 1 from public.reviews where appointment_id = p_appointment_id) then
    raise exception 'review_already_submitted';
  end if;

  insert into public.reviews (
    patient_id, nutritionist_id, appointment_id, rating, comment, status
  )
  values (
    v_patient_id,
    v_appointment.nutritionist_id,
    v_appointment.id,
    p_rating,
    nullif(trim(p_comment), ''),
    'pending'
  )
  returning * into v_review;

  return v_review;
end;
$$;

revoke all on function public.submit_review(uuid,integer,text) from public;
grant execute on function public.submit_review(uuid,integer,text) to authenticated;

create policy "reviews_admin_update"
on public.reviews
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "articles_author_write" on public.articles;
create policy "articles_author_write"
on public.articles
for all to authenticated
using (
  author_profile_id = auth.uid()
  and exists (
    select 1 from public.nutritionists n
    where n.profile_id = auth.uid()
  )
  or public.is_admin()
)
with check (
  author_profile_id = auth.uid()
  and exists (
    select 1 from public.nutritionists n
    where n.profile_id = auth.uid()
  )
  or public.is_admin()
);
