# Security

## Authentication
Supabase Auth handles identity. Application tables reference auth.users through profiles.

## Authorization
RLS is mandatory for private data. Application authorization is complementary, not a replacement for RLS.

## Patient privacy
Patients can access only their own private records. Nutritionists can access only records connected to authorized appointments/programs. Admin access is role-controlled.

## Secrets
- Browser: only public Supabase URL and anon key.
- Server: service-role and payment secrets only through environment variables.
- Never commit .env files.

## Input security
Validate all external input. Sanitize rendered rich content. Restrict uploads by type/size.

## Operational security
Use HTTPS, secure cookies, rate limiting where needed, dependency updates and audit logs for sensitive admin actions.
