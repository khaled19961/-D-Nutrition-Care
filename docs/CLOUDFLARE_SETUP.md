# Cloudflare Workers Hosting Setup

## Production target

D-Nutrition-Care is configured for Cloudflare Workers with vinext and the Next.js App Router.

Cloudflare currently recommends vinext as the default path for new Next.js applications on Workers.

## What is already in the repository

- `vite.config.ts` — vinext + Cloudflare Vite plugin
- `wrangler.jsonc` — Worker name, runtime compatibility and asset handling
- `package.json` — vinext build/deploy scripts
- `postcss.config.mjs` — Tailwind v4 PostCSS integration
- `.gitignore` — local secrets and generated Cloudflare files excluded

## Cloudflare dashboard

1. Open **Workers & Pages**.
2. Select **Create application**.
3. Choose **Import a repository**.
4. Connect the GitHub account that owns `khaled19961/-D-Nutrition-Care`.
5. Select repository `-D-Nutrition-Care`.
6. Select branch `main`.
7. Configure the build:
   - Build command: `npm run build:vinext`
   - Deploy command: `npx wrangler deploy`
   - Root directory: `/`
8. Save and deploy.

Cloudflare Workers Builds can automatically deploy every new commit pushed to the selected production branch.

## Environment variables

Configure these in the Worker dashboard. Do not commit real values to GitHub.

### Public application variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Secret

- `SUPABASE_SERVICE_ROLE_KEY`

The service-role key must never be exposed to client components or committed to the repository.

## Supabase Auth

After the Worker receives its `workers.dev` URL, add the production URL to Supabase Authentication URL configuration.

At minimum configure:

- Site URL: the final production domain
- Redirect URL for authentication callbacks
- Password reset redirect URL

When a custom domain is connected, use the custom domain as the canonical Site URL.

## First deployment

The first Cloudflare deployment should be treated as an infrastructure verification step.

Verify:

1. Worker build succeeds.
2. Home page returns HTTP 200.
3. Public nutritionist/program/article pages load.
4. Supabase environment variables are available.
5. Authentication can establish a session.
6. Protected dashboard routes reject unauthenticated users.
7. Database migrations are applied.
8. Booking transaction and RLS policies pass their tests.
9. Sitemap and robots endpoints return successfully.

## Custom domain

After the Worker is stable on `workers.dev`:

1. Open the Worker.
2. Go to **Settings / Domains & Routes**.
3. Add the production domain.
4. Set the custom domain as the canonical application URL.
5. Update `NEXT_PUBLIC_SITE_URL` and Supabase Auth redirect URLs.

## Important

Do not deploy the application as a static-only Pages site. The platform needs server rendering, authentication and server-side mutations, so the production target remains Workers.
