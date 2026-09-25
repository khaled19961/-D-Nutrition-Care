# Deployment

## Environment
Required variables will be documented in .env.example.

Public:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Server-only:
- SUPABASE_SERVICE_ROLE_KEY
- payment provider secrets
- other integration secrets

## Development
1. Install dependencies.
2. Configure Supabase.
3. Apply migrations.
4. Seed development data if desired.
5. Run lint/typecheck/build.
6. Start local development server.

## Production
- Configure production environment variables.
- Apply database migrations.
- Deploy application.
- Configure domain and HTTPS.
- Verify auth redirects and storage policies.
- Verify sitemap and robots.
