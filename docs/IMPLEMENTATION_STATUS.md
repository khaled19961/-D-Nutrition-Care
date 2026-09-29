# Implementation Status

Updated: 2026-09-30

> Repository code is not proof that production configuration, migrations, or live data are ready.

## Implemented in the repository

- Cloudflare Workers deployment foundation with vinext.
- Supabase SSR authentication foundation, patient registration, password reset, and protected dashboards.
- Patient and nutritionist workflows, atomic booking/cancellation RPCs, and public nutritionist directory.
- Public nutrition programs and article pages; admin tooling for reviews, articles, and payment monitoring.
- Store catalog, administration, product pages, cart, and order creation. This is not a payment-provider integration.
- Odoo API connectivity/product-read foundation, not a complete synchronization workflow.
- Robots/sitemap fixes and normalized site URL handling.
- Database helper execution remains limited to authenticated roles; public RLS policies no longer call private helper functions.

## Live verification on 2026-09-30

The connected Supabase project `mhmbtlirintgcabscptj` is active and healthy. Migration `public_rls_role_split` was applied successfully as version `20260929210958`.

Read-only tests now pass as both `anon` and `authenticated`: public reads of services, availability slots, store categories/products, nutritionists, and articles complete without permission errors. A policy scan found no `anon` policy invoking `is_admin()`, `is_super_admin()`, or `my_nutritionist_id()`. Those helper functions remain `anon_execute=false` and `authenticated_execute=true`.

The live `/store` page now shows the expected empty-catalog state rather than a database error. `/booking` now shows the expected “no services published” state rather than a permissions error. The database has 12 store categories and one brand, but zero products, nutritionists, services, availability slots, appointments, and store orders. Therefore read-paths are verified, but a real booking or checkout cannot be completed until business data is added. No business rows or orders were created in these tests; only RLS policies and function grants were changed.

## Database migration files in this repository

1. `0001_initial.sql` — core schema and RLS.
2. `0002_booking_security.sql` — atomic booking/cancellation.
3. `0003_secure_progress.sql` — secure progress recording.
4. `0004_security_reviews_articles.sql` — review and article authorization hardening.
5. `0005_public_nutritionist_directory.sql` — public nutritionist RPCs.
6. `0006_profile_signup_metadata.sql` — registration metadata.
7. `0007_booking_visibility.sql` — public service and slot visibility.
8. `0008_store_catalog.sql` — store catalog tables and policies.
9. `0009_store_orders.sql` — store orders and items.
10. `0010_store_checkout_orders.sql` — checkout fields and final order RPC; supersedes the old one-argument RPC migration and drops that overload.
11. `0011_admin_store_order_rpc.sql` — admin order update RPC.
12. `0012_staff_roles_security.sql` — staff roles and related security policies.
13. `0013_seed_store_home_categories.sql` — store category seed data.
14. `0014_seed_home_product_sections.sql` — home-page section taxonomy.
15. `0015_odoo_integration_foundation.sql` — Odoo reference/sync-status fields and logs.
16. `0016_my_nutritionist_id_permissions.sql` — helper execution granted to authenticated only, never `anon`.
17. `20260929210958_public_rls_role_split.sql` — applied production policy fix; public policies expose active/published rows and private owner/participant reads are authenticated-only.

### Migration history note

The active Supabase project reports timestamp-versioned migrations; the applied RLS migration is recorded as `20260929210958`. The duplicate local `0010_store_order_rpc.sql` file was removed after confirming the remote database had no `0010` record and no one-argument `create_store_order(jsonb)` overload. The final `0010_store_checkout_orders.sql` creates the two-argument RPC and drops that legacy overload.

The other local numeric migrations still do not map one-to-one to the timestamped remote history. Do not run a bulk `supabase db push`, `migration repair`, or mark historical migrations applied/reverted until the full history is reconciled.

## Remaining before launch

- Add and publish real products, images, inventory, nutritionists, services, and future appointment slots.
- Test a real booking and checkout only after test-safe business data and an authenticated test user are available; no payment provider is integrated.
- Choose a payment provider, signed webhook verification, payment transitions/idempotency, shipping, tax/invoice presentation, and handling of expired/unpaid orders.
- Publish approved contact, privacy, terms, booking/cancellation, shipping, and returns information.
- Complete Odoo synchronization or document manual operations and remove unsupported promises.
- Add database/RLS and application end-to-end tests; review file/image storage policies and upload workflow.
- Review the remaining Security Advisor warnings: two intentionally public directory SECURITY DEFINER RPCs return only published public fields; 12 authenticated SECURITY DEFINER RPCs still need individual least-privilege review. Leaked-password protection is disabled.
- Verify Cloudflare secrets, Supabase Auth URLs/email setup, cache behavior for authenticated routes, security headers, sitemap/canonical URLs, and the full customer journey after deployment.
