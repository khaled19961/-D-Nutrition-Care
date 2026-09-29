# Implementation Status

Updated: 2026-09-29

> This file describes the repository implementation. A feature in the repository is not proof that production configuration, database migrations, or live data are ready.

## Implemented in the repository

- Cloudflare Workers deployment foundation with vinext.
- Supabase SSR authentication foundation for Next.js 16 using the `proxy.ts` convention.
- Email/password login, patient registration metadata, password reset and PKCE callback.
- Protected patient and nutritionist dashboards.
- Patient profile, appointments, programs, goals and progress tracking.
- Atomic booking/cancellation RPCs and public nutritionist directory/profile pages.
- Public nutrition-program and article listing/detail pages.
- Admin dashboard for nutritionist verification, reviews, articles and payment monitoring.
- Store catalog schema, product/category/brand/bundle/branch administration, product detail pages, cart and order creation flow.
- Store order creation validates products and stock in the database. This is not a payment-provider integration.
- Odoo API client and admin health-check/product-read endpoint. This is not a complete product/order synchronization workflow.
- Robots and sitemap endpoints; the repository now uses a shared site-URL helper and omits the cart from the sitemap.
- An explicit execute grant for the `my_nutritionist_id()` function used by public service RLS policies.

## Current known blockers and operational gaps

- Production `/store` has returned a product-query error. Verify Supabase configuration, applied schema/RLS and real catalog records before launch.
- Production `/booking` has returned `permission denied for function my_nutritionist_id`. The new `0016` migration must be applied and the actual production role grants/policies retested.
- Product, nutritionist, service and availability data must be created and published in the intended production database.
- Checkout creates an order in a pending-payment state; there is no payment provider, signed webhook verification, or finalized shipping policy.
- Contact, privacy, terms, booking, shipping and return information still need approved business/legal text and actual contact details.
- Odoo integration is currently a connectivity/product-read foundation, not a verified synchronization workflow.
- Automated database/RLS and end-to-end tests are not part of the current CI workflow.

## Database migration files in this repository

1. `0001_initial.sql` — core schema and RLS.
2. `0002_booking_security.sql` — atomic booking/cancellation.
3. `0003_secure_progress.sql` — secure progress recording.
4. `0004_security_reviews_articles.sql` — review and article authorization hardening.
5. `0005_public_nutritionist_directory.sql` — safe public nutritionist RPCs.
6. `0006_profile_signup_metadata.sql` — persist registration metadata.
7. `0007_booking_visibility.sql` — restrict public services and booking to verified, available nutritionists.
8. `0008_store_catalog.sql` — store catalog tables and policies.
9. `0009_store_orders.sql` — store orders and order items.
10. `0010_store_checkout_orders.sql` — checkout/customer/tax fields and order RPC updates.
11. `0010_store_order_rpc.sql` — initial store order creation RPC.
12. `0011_admin_store_order_rpc.sql` — admin order update RPC.
13. `0012_staff_roles_security.sql` — staff roles and related security policies.
14. `0013_seed_store_home_categories.sql` — seed initial store categories.
15. `0014_seed_home_product_sections.sql` — seed home-page section taxonomy.
16. `0015_odoo_integration_foundation.sql` — Odoo reference/sync-status fields and logs.
17. `0016_my_nutritionist_id_permissions.sql` — explicit execute grant for application roles.

### Migration history warning

`0010_store_checkout_orders.sql` and `0010_store_order_rpc.sql` share the same version prefix (`0010`). Supabase tracks migration versions as unique identifiers. Before applying migrations with Supabase CLI, compare local and remote migration history and resolve this duplicate safely. Do not rename or mark migrations applied/reverted until the production history is known; otherwise the local and remote histories can diverge.

## Still required before production

- Confirm the intended Supabase project and compare its migration history against every file listed above.
- Resolve the duplicate `0010` migration version without rewriting migrations that may already have been applied remotely.
- Apply the missing migrations, including `0016`, then verify RLS and execute permissions as `anon` and `authenticated`.
- Set and validate `NEXT_PUBLIC_SUPABASE_URL`, the supported publishable/anon key and `NEXT_PUBLIC_SITE_URL` in Cloudflare. Use the canonical HTTPS origin; the new helper removes a trailing slash when constructing URLs.
- Configure Supabase Auth Site URL, callback/reset redirects, email provider/templates and production auth settings.
- Fix the live store/service query failures, then populate real products, images, inventory, nutritionists, services and future availability slots.
- Choose and integrate a payment provider, signed webhook verification, payment state transitions and idempotency.
- Approve shipping, tax/invoice presentation and handling for expired or unpaid orders before taking commercial orders.
- Publish real contact information and approved privacy, terms, booking/cancellation, shipping and return policies.
- Decide whether Odoo is required. If it is, implement and test product/order synchronization in the intended directions; otherwise document manual operations and remove unused promises.
- Add and test file/image storage policies and an approved image upload workflow.
- Add database/RLS tests and application end-to-end tests covering booking, store, checkout and payment sandbox flows.
- Review Cloudflare caching for authenticated routes and verify private `no-store` behavior.
- Enforce HTTPS and verify security headers on the final domain.
- Recheck robots, sitemap URLs, canonical metadata, noindex routes and all public URLs after deployment.
- Run CI, production build, smoke tests and a full customer journey test after the final changes.
