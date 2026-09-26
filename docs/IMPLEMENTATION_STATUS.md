# Implementation Status

Updated: 2026-09-26

## Completed in the application

- Cloudflare Workers deployment foundation with vinext.
- Supabase SSR authentication foundation for Next.js 16 using the proxy.ts convention.
- Email/password login.
- Patient registration with profile metadata.
- Password reset and PKCE callback.
- Protected patient dashboard.
- Patient appointments and atomic cancellation.
- Atomic booking RPC with slot locking and double-booking protection.
- Patient profile editing.
- Patient programs, goals and progress tracking.
- Secure progress recording linked to an active/planned patient program.
- Public nutritionist directory and profile pages.
- Public published nutrition-program listing.
- Public article listing and article detail pages.
- Nutritionist dashboard, service management, availability management and appointment list.
- Admin dashboard with nutritionist verification, review moderation, article management and payment monitoring.
- Robots and sitemap endpoints.
- Security migrations for booking, progress, reviews, articles, public nutritionist data and signup metadata.

## Database migrations

1. 0001_initial.sql — core schema and RLS.
2. 0002_booking_security.sql — atomic booking/cancellation.
3. 0003_secure_progress.sql — secure progress recording.
4. 0004_security_reviews_articles.sql — review and article authorization hardening.
5. 0005_public_nutritionist_directory.sql — safe public nutritionist RPCs.
6. 0006_profile_signup_metadata.sql — persist registration metadata.
7. 0007_booking_visibility.sql — restrict public services and booking to verified available nutritionists.

## Still required before production

- Apply all Supabase migrations to the real Supabase project.
- Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and NEXT_PUBLIC_SITE_URL in Cloudflare.
- Configure Supabase Auth Site URL and redirect URLs for the production Worker domain.
- Configure email provider/templates and production auth settings.
- Add payment provider integration and webhook verification.
- Add file/image storage policies and upload UI.
- Add automated database/RLS tests and application end-to-end tests.
- Review Cloudflare caching rules for authenticated routes and confirm private no-store behavior.
- Run the full production build/deploy again after the new changes.