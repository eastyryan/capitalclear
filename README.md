# Capital Clear

A bilingual (EN/FR) two-sided services marketplace connecting **Ottawa, Ontario**
homeowners with independent contractors for **snow removal, lawn mowing, and seasonal
property maintenance**.

Built phase by phase. **PHASE 0 (this commit): scaffold only** — a bootable Next.js 16
app with the full toolchain wired. Product features land in later phases.

## Stack

- **Next.js 16** (App Router, TypeScript strict, Turbopack)
- **Tailwind CSS v4** + **shadcn/ui**
- **next-intl** — bilingual EN/FR with `/[locale]/` routing (`/en`, `/fr`)
- **Supabase** (`@supabase/ssr`) — Auth, Postgres + RLS, Storage, Realtime *(wired in PHASE 2)*
- **Payments** — swappable `PaymentProvider`; `PAYMENTS_MODE=simulated` for the MVP,
  Stripe Connect Express drops in later with no schema/UI change
- PWA-ready (web manifest + installable); CAD currency (integer cents); `America/Toronto`

## Getting started

```bash
pnpm install
cp .env.example .env.local   # PHASE 0 boots with blank Supabase/Stripe values
pnpm dev
```

Open <http://localhost:3000> — it redirects to `/en`. French is at `/fr`.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | ESLint |

## Project layout (PHASE 0)

```
src/
├─ proxy.ts                 # Next 16 root middleware (next-intl locale routing)
├─ i18n/{routing,navigation,request}.ts
├─ messages/{en,fr}.json
├─ lib/supabase/{client,server,admin}.ts
└─ app/
   ├─ manifest.ts           # PWA manifest
   └─ [locale]/{layout,page}.tsx
```

> **Note:** In Next.js 16 the root middleware file is `proxy.ts` (renamed from
> `middleware.ts`). The `next-intl/middleware` import is unchanged.

## Switching payments to Stripe later

The MVP runs `PAYMENTS_MODE=simulated`. To go live with Stripe Connect Express — **no
schema or UI changes required**:

1. Set `PAYMENTS_MODE=stripe` and add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PLATFORM_FEE_BPS` to `.env.local`.
2. Add Connect Express onboarding in the pro dashboard.
3. Point the Stripe webhook at `/api/stripe/webhook`.

## Roadmap

- **PHASE 0** ✅ Scaffold (this commit)
- **PHASE 1** Landing page (warm-red cinematic design system, snow-removal scroll motion)
- **PHASE 2** Supabase migrations (schema + RLS + triggers + FSA seed) + auth
- **PHASE 3** Booking wizard + `createJob` (Ottawa FSA gate, payment hold) + homeowner dashboard
- **PHASE 4** Pro dashboard (realtime available feed, atomic accept)
- **PHASE 5** Job detail (status flow, before/after photos, approval → payment release, reviews)
- **PHASE 6** Admin dashboard
