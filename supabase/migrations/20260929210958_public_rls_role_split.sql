-- Anonymous/public policies must not call private SECURITY DEFINER helpers.
-- Keep helper RPC access limited to signed-in users; public read rules below
-- express only the content intended to be visible to everyone.
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_super_admin() from public, anon;
revoke all on function public.my_nutritionist_id() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.my_nutritionist_id() to authenticated;

-- Article categories: admins already have their authenticated ALL policy.
drop policy if exists article_categories_public_read on public.article_categories;
create policy article_categories_public_read
on public.article_categories for select to anon, authenticated
using (is_active = true);

-- Public articles are published only; author/admin access remains in the
-- authenticated articles_author_write policy.
drop policy if exists articles_public_read on public.articles;
create policy articles_public_read
on public.articles for select to anon, authenticated
using (status = 'published');

-- The newer policy already exposes only open future slots. The legacy policy
-- is broader and invokes helpers unavailable to anon; owners retain access via
-- slots_owner_write (authenticated ALL).
drop policy if exists slots_public_read on public.availability_slots;

-- Public nutrition programs and meals are published content only. Owner/admin
-- access remains in the corresponding authenticated ALL policies.
drop policy if exists meals_read on public.meals;
create policy meals_read
on public.meals for select to anon, authenticated
using (
  exists (
    select 1
    from public.nutrition_programs p
    where p.id = meals.program_id
      and p.status = 'published'
  )
);

drop policy if exists programs_public_read on public.nutrition_programs;
create policy programs_public_read
on public.nutrition_programs for select to anon, authenticated
using (status = 'published');

-- The public directory exposes verified/available nutritionists only.
-- A signed-in owner and admins retain access to their full row.
drop policy if exists nutritionists_public_read on public.nutritionists;
create policy nutritionists_public_read
on public.nutritionists for select to anon, authenticated
using (verification_status = 'verified' and is_available = true);
create policy nutritionists_owner_read
on public.nutritionists for select to authenticated
using (profile_id = (select auth.uid()) or (select public.is_admin()));

-- Approved reviews are public. Participants and admins can also read their
-- own/private review rows when signed in.
drop policy if exists reviews_public_approved on public.reviews;
create policy reviews_public_approved
on public.reviews for select to anon, authenticated
using (status = 'approved');
create policy reviews_participant_read
on public.reviews for select to authenticated
using (
  patient_id = (select auth.uid())
  or nutritionist_id = (select public.my_nutritionist_id())
  or (select public.is_admin())
);

-- Services are public only when active and attached to an available verified
-- nutritionist. Owners/admins retain access through services_owner_write.
drop policy if exists services_public_read on public.services;
create policy services_public_read
on public.services for select to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.nutritionists n
    where n.id = services.nutritionist_id
      and n.verification_status = 'verified'
      and n.is_available = true
  )
);

-- Active specialties are public; the authenticated ALL policy retains admin access.
drop policy if exists specialties_public_read on public.specialties;
create policy specialties_public_read
on public.specialties for select to anon, authenticated
using (is_active = true);

-- Store catalogue public policies contain no admin helper calls. The separate
-- authenticated ALL policies continue to provide administrator access.
drop policy if exists store_branches_public_read on public.store_branches;
create policy store_branches_public_read
on public.store_branches for select to anon, authenticated
using (is_active = true);

drop policy if exists store_brands_public_read on public.store_brands;
create policy store_brands_public_read
on public.store_brands for select to anon, authenticated
using (is_active = true);

drop policy if exists store_bundle_items_public_read on public.store_bundle_items;
create policy store_bundle_items_public_read
on public.store_bundle_items for select to anon, authenticated
using (
  exists (
    select 1
    from public.store_bundles b
    where b.id = store_bundle_items.bundle_id
      and b.is_active = true
  )
);

drop policy if exists store_bundles_public_read on public.store_bundles;
create policy store_bundles_public_read
on public.store_bundles for select to anon, authenticated
using (is_active = true);

drop policy if exists store_categories_public_read on public.store_categories;
create policy store_categories_public_read
on public.store_categories for select to anon, authenticated
using (is_active = true);

drop policy if exists store_product_categories_public_read on public.store_product_categories;
create policy store_product_categories_public_read
on public.store_product_categories for select to anon, authenticated
using (
  exists (
    select 1
    from public.store_products p
    where p.id = store_product_categories.product_id
      and p.is_active = true
  )
);

drop policy if exists store_product_images_public_read on public.store_product_images;
create policy store_product_images_public_read
on public.store_product_images for select to anon, authenticated
using (
  exists (
    select 1
    from public.store_products p
    where p.id = store_product_images.product_id
      and p.is_active = true
  )
);

drop policy if exists store_products_public_read on public.store_products;
create policy store_products_public_read
on public.store_products for select to anon, authenticated
using (is_active = true and stock_quantity > 0);
