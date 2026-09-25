# Deployment

## Target
Production target: Cloudflare Workers.

Cloudflare currently recommends vinext for new Next.js applications on Workers. The project keeps the application architecture portable so the deployment adapter can change later without redesigning the product. [Cloudflare Next.js Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).

## Database
Supabase PostgreSQL remains the application database and Auth provider. Cloudflare documents Supabase integration directly and supports PostgreSQL connectivity through Hyperdrive when direct server-side database access is needed.

## Production checklist
- Configure Workers project.
- Configure environment variables/secrets.
- Apply Supabase migrations.
- Configure Supabase Auth redirect URLs.
- Configure custom domain.
- Run build/typecheck.
- Test authentication, booking, RLS and storage.
- Verify sitemap/robots and public SEO pages.

## Portability
Do not couple business logic to Cloudflare-only APIs unless isolated behind adapters.
