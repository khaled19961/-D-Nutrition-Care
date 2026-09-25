# Cloudflare Deployment Architecture

## Decision
D-Nutrition-Care will run as a full-stack application on Cloudflare Workers, not as a static-only Pages deployment.

Cloudflare recommends vinext for new Next.js applications on Workers; OpenNext remains a documented alternative for existing applications.

## Runtime
- Next.js App Router
- Cloudflare Workers
- vinext deployment path
- Supabase PostgreSQL/Auth/Storage

## Why Workers
The application needs authentication, server-side rendering, route handlers and server mutations. Cloudflare supports full-stack Next.js workloads on Workers.

## Database boundary
Supabase remains the source of truth for relational data. Use Supabase client APIs for normal authenticated application access and RLS. If high-volume server-side PostgreSQL access requires direct connections, Hyperdrive can be introduced without changing the domain model.

## Portability
Cloudflare-specific bindings remain optional integration infrastructure. Core business logic, validation and data models stay provider-neutral.
