# Deployment

## Target

Production target: Cloudflare Workers.

Cloudflare currently recommends vinext for new Next.js applications on Workers. The project is configured for the Next.js App Router + vinext + Cloudflare Vite plugin path.

## Database

Supabase PostgreSQL remains the application database and Auth provider.

## Repository deployment configuration

The repository now contains:

- `vite.config.ts`
- `wrangler.jsonc`
- `postcss.config.mjs`
- Cloudflare/vinext scripts in `package.json`

## Workers Builds

Connect the GitHub repository to Cloudflare Workers and use:

- Production branch: `main`
- Build command: `npm run build:vinext`
- Deploy command: `npx wrangler deploy`
- Root directory: `/`

Cloudflare Workers Builds can automatically deploy every push to the configured production branch.

## Environment variables

Configure these in Cloudflare, not GitHub:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key is a secret.

## Supabase

Before production, apply all SQL migrations and configure Supabase Auth redirect URLs for the final Worker domain.

## Production checklist

- [ ] Worker build succeeds.
- [ ] Home page returns HTTP 200.
- [ ] Public pages render correctly.
- [ ] Supabase environment variables are configured.
- [ ] Supabase Auth redirect URLs are configured.
- [ ] Protected routes reject unauthenticated users.
- [ ] RLS is enabled and tested.
- [ ] Booking transaction is atomic and prevents double booking.
- [ ] Storage policies are tested.
- [ ] Sitemap and robots are available.
- [ ] Custom domain is connected.
- [ ] `NEXT_PUBLIC_SITE_URL` uses the canonical domain.

## Portability

Do not couple business logic to Cloudflare-only APIs unless isolated behind adapters.
