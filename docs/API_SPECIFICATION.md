# API Specification

## Principles
Use typed server actions/route handlers with shared validation. Supabase is the persistence layer, not a reason to expose privileged credentials to the browser.

## Domains
- /auth
- /profiles
- /nutritionists
- /specialties
- /services
- /availability
- /appointments
- /programs
- /progress
- /goals
- /reviews
- /articles
- /favorites
- /notifications
- /payments
- /subscriptions
- /admin

## Validation
Zod schemas are shared between form handling and server boundaries where practical.

## Errors
Return stable application error codes with user-safe messages. Never expose SQL errors, secrets or provider credentials.
