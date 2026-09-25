# Architecture

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Zod + React Hook Form
- next-intl for localization

## Layers
Presentation -> Application services -> Data access -> PostgreSQL/Supabase.

## Roles
- visitor
- patient
- nutritionist
- admin
- super_admin

## Rules
- Public content is separated from private patient data.
- Business rules are enforced server-side.
- Database RLS is the final authorization boundary.
- Service-role credentials are server-only.
- Provider-specific integrations stay behind adapters.

## Deployment
Frontend is designed for Cloudflare-compatible deployment during development and can later move to another Node/edge-capable host without changing the domain model.
