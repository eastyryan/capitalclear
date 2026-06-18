# Capital Clear

A bilingual (EN/FR) two-sided services marketplace connecting **Ottawa, Ontario**
homeowners with independent contractors for **snow removal, lawn mowing, and seasonal
property maintenance**.

**Status: all phases (0–6) built.** Landing page, auth, booking, dashboards, job
lifecycle, payments abstraction, and admin are implemented and typecheck/build clean.

## Stack

- **Next.js 16** (App Router, TypeScript strict, Turbopack) — root middleware is `src/proxy.ts`
- **Tailwind CSS v4** + **shadcn/ui**, warm-red cinematic dark design system
- **next-intl** — bilingual EN/FR with `/[locale]/` routing (`/en`, `/fr`)
- **Supabase** (`@supabase/ssr`) — Auth, Postgres + RLS on every table, Storage, Realtime
- **Payments** — swappable `PaymentProvider`; `PAYMENTS_MODE=simulated` for the MVP,
  Stripe Connect Express drops in with no schema/UI change
- PWA-ready (manifest + installable); CAD currency (integer cents); `America/Toronto`; GSAP + Lenis motion

## Quick start (front end, no backend needed)

```bash
pnpm install
cp .env.example .env.local
pnpm dev   # http://localhost:3000  (redirects to /en; French at /fr)
```

The **landing page runs with no backend**. Auth/booking/dashboard routes require Supabase
(below); without it, those routes gracefully redirect to `/login`.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

## Backend setup (Supabase) — required for the end-to-end flow

Pick **one** of these. The app reads `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`.

### Option A — Local stack (free, needs Docker)

```bash
supabase start                              # boots Postgres/Auth/Storage in Docker
supabase db reset                           # applies migrations 0001–0005 + seed.sql
supabase gen types typescript --local \
  > src/types/database.types.ts             # regenerate types from the live schema
```
Copy the `API URL`, `anon key`, and `service_role key` that `supabase start` prints into
`.env.local`. In `supabase/config.toml` set `auth.email.enable_confirmations = false` so
signup returns a session immediately.

### Option B — Cloud project (no Docker)

Create a Supabase project, then push the SQL and seed:
```bash
supabase link --project-ref <ref>
supabase db push                            # applies supabase/migrations/*
psql "$DATABASE_URL" -f supabase/seed.sql   # demo users/jobs (optional)
supabase gen types typescript --project-id <ref> > src/types/database.types.ts
```
Put the project URL + keys in `.env.local`. In **Auth → Providers → Email**, turn
**Confirm email OFF** for the demo. Create the private **`job-photos`** storage bucket
(migration `0005_storage.sql` does this if run).

> Demo logins after seeding (password `password123`): `admin@capitalclear.ca` (admin),
> the seeded homeowners, and 3 verified pros covering all three services. Admin role is
> granted only via SQL, never self-selectable.

## Database

`supabase/migrations/`: `0001_init` (enums, `is_ottawa_postal()`, tables, indexes) ·
`0002_rls` (RLS on all 7 tables) · `0003_triggers` (`handle_new_user`, `touch_updated_at`,
`recompute_pro_stats`) · `0004_seed_fsa` (Ottawa FSA allowlist) · `0005_storage`
(`job-photos` bucket + policies). `supabase/seed.sql` adds demo data.

Geo-fencing is enforced at three layers: client (FSA allowlist before submit), server
actions (`assertOttawaPostal`), and DB (`is_ottawa_postal()` CHECK + RLS feed policies).

## Payments — simulated now, Stripe-ready

`PAYMENTS_MODE=simulated` writes to a `payments` ledger and updates `jobs.payment_status`
with a 15% platform fee; intent ids look like `sim_<uuid>`. To go live with Stripe Connect
Express — **no schema or UI changes**:

1. Set `PAYMENTS_MODE=stripe` + add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PLATFORM_FEE_BPS`.
2. Add Connect Express onboarding in the pro dashboard.
3. Point the Stripe webhook at `/api/stripe/webhook`.

The `stripe-connect.ts` provider documents the destination-charge flow (manual-capture
PaymentIntent → capture → cancel → refund, `application_fee_amount` + `transfer_data.destination`).

## Architecture

```
src/
├─ proxy.ts                      # next-intl routing + Supabase session refresh + auth gate
├─ i18n/{routing,navigation,request}.ts
├─ messages/{en,fr}.json         # 14 namespaces, full EN/FR parity
├─ types/database.types.ts
├─ lib/
│  ├─ supabase/{client,server,admin}.ts
│  ├─ payments/{provider,simulated,stripe-connect}.ts
│  ├─ pricing/quote.ts · geo/ottawa.ts · jobs/status.ts · format/money.ts · auth/guards.ts
├─ components/{landing,site,jobs,ui}/...
└─ app/
   ├─ manifest.ts
   ├─ actions/{auth,jobs,photos,reviews,pros,payments,admin}.ts   # 'use server'
   └─ [locale]/
      ├─ page.tsx (landing) · login · register
      ├─ (homeowner)/{dashboard,book}        # requireRole('homeowner')
      ├─ (pro)/pro                           # requireRole('pro')
      ├─ (admin)/admin                       # requireRole('admin')
      └─ (protected)/jobs/[id]               # requireUser()
```

## Acceptance flow (with `PAYMENTS_MODE=simulated` + a backend)

Homeowner signs up → creates a snow-removal job (valid Ottawa postal; out-of-area rejected;
hold authorized) → Pro signs up offering snow_removal, sees it in realtime → accepts
(atomic) → uploads before photo → starts work → uploads after photo → marks complete →
Homeowner approves → payment released → leaves a review → pro rating recomputes.

## Notes

- Money is integer cents CAD throughout; formatted with `Intl` en-CA/fr-CA.
- Illegal job-status transitions are impossible (server-side transition map + checks).
- Service-role key is server-only; all mutations are validated + authorized in server actions.
