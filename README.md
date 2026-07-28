# CapitalClear — redesigned site

Cinematic redesign of the CapitalClear snow-clearing marketplace demo.
Same locked brand (winter Pristine Light palette, Outfit + IBM Plex Mono,
neighborly copy), rebuilt from scratch as a scroll-driven experience.

**Live: https://capitalclear-redesign.netlify.app**

## Pages

| Route | What it is |
|---|---|
| `/` | Scroll-driven marketing landing: hero, pinned "clearing scene" (the truck plows the aerial plate as you scroll), how-it-works, live estimate widget with odometer pricing, 90/10 partner band, crew cards, final CTA. |
| `/request` | The customer app: tap the map to drop a pin, pick a service and driveway size, radar crew match, live truck tracking with status timeline, receipt. |
| `/partners` | Partner dashboard: accept/decline incoming requests, today's route, weekly earnings with the 90/10 split. |

`/about` 301-redirects to `/` (the landing is the homepage now).

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4, GSAP ScrollTrigger for scroll
choreography, Lenis for smooth scrolling, hand-rolled canvas snowfall.
All motion is `prefers-reduced-motion` gated. Demo data (services, prices,
crews, timings) is transcribed verbatim from the original build in
`src/lib/data.ts`.

## Develop

```bash
bun install
bun run dev        # http://localhost:5173
bun run build      # typecheck + production build to dist/
```

## Booking queue (Supabase)

Customer requests from `/request` (with an optional contact field) are
real rows in the `capitalclear` Supabase project (`requests` table). The
partner dashboard at `/partners` shows a **live queue** with the full
lifecycle: new requests stream in over realtime, Accept moves a job onto
Today's route (persisted across reloads), "Mark done" completes it, and
all open dashboards stay in sync via realtime UPDATE events.
Accept/Decline/Mark done call constrained `security definer` RPCs
(`accept_request` / `decline_request` / `complete_request`) that only
allow legal status transitions — direct updates are blocked by RLS.
Configure via `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (see
`.env.example`); without them the whole product falls back to the fully
simulated demo.

### Partner accounts (auth)

- `/partners` is the public **demo** (sample data, for cold outreach) with
  a "Partner sign in" link.
- `/partners/login` — passwordless email magic-link sign in (Supabase Auth),
  with a "Sign in with a password" option (used for seeded test accounts).
- `/partners/dashboard` — the real, per-partner live queue. Row-level
  security means an **approved** partner sees only unclaimed jobs plus their
  own; anonymous visitors can no longer read the queue at all (homeowners
  can still submit). New partners land in a "pending approval" state until
  `partners.approved` is set true.
- Accept is an **atomic claim** — two partners can't grab the same job.
- **Geographic matching**: homeowners pick a neighborhood (`src/lib/areas.ts`);
  partners set their service areas on the dashboard. RLS only shows a partner
  new jobs in their areas (plus area-less requests, and everything until they
  set any areas), and accept is area-guarded. Matching is enforced in the
  database, not just the UI.

### Payments (Stripe Connect)

Pay-to-book via Stripe Connect Express (**separate charges and transfers**):
the homeowner pays the platform at "Confirm crew" through hosted Stripe
Checkout; when the assigned partner marks the job done, 90% transfers to
their connected account and the platform keeps 10%. Everything is gated
behind `VITE_STRIPE_ENABLED` — unset, the site runs the fully simulated
demo (receipt still says "no payment was made"). Partners connect a payout
account from a "Payouts" card on their dashboard; RLS + a guard trigger
mean a partner can never self-enable their own payout status (only the
Stripe webhook can).

Edge functions: `stripe-onboard`, `stripe-checkout`, `stripe-webhook`,
`stripe-payout` (each no-ops with a clean response until keys are set).

**To activate (test mode):** create a Stripe account, enable Connect, then:
Supabase secrets `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`; Netlify env
`VITE_STRIPE_ENABLED=true`; add a Stripe webhook endpoint pointing at
`…/functions/v1/stripe-webhook` for `checkout.session.completed` and
`account.updated`. Not built yet: auto-refund if a paid job is never
accepted; payout statements.

New-booking notifications: a Postgres trigger calls the `notify-request`
edge function (Resend email to the admin). It no-ops until these Supabase
secrets are set: `RESEND_API_KEY`, `NOTIFY_SECRET` (`cc-notify-2026-frsugy`),
optionally `ADMIN_EMAIL` / `NOTIFY_FROM`. Magic-link email uses Supabase's
default SMTP (a few sends/hour) until custom SMTP is configured.

## Weather-triggered demand

A daily `pg_cron` job (11:00 UTC) calls the `weather-check` edge function,
which reads the Ottawa snow forecast from the keyless Open-Meteo API. If
≥2cm is forecast (and it hasn't already alerted that day), it emails the
waitlist "storm's coming, book now" via Resend, each with a one-click
unsubscribe link (`unsubscribe` edge function). Probe it with
`weather-check?test=1` (returns the live forecast + decision) or
`?force=1` (exercises the send path).

The waitlist is dual-written: `WaitlistBand` posts to Netlify Forms **and**
inserts into a Supabase `waitlist` table (`src/lib/waitlist.ts`) — the
owned, unsubscribable list the storm alerts are sent from. Anon can insert
but not read it (RLS). Emails only send once `RESEND_API_KEY` is set as a
Supabase secret; the forecast check and dedup run regardless.

## Season mode

The header toggle switches winter/summer site-wide: palette tokens
(`[data-season]` CSS vars), services, prices, crews, map plates, partner
data, and copy — all verbatim from the original build's dormant summer
set. The landing's cinematic plow scene stays winter by design. Choice is
persisted in `localStorage` (`cc-season`), default winter.

## Lead capture and analytics

- **Waitlist** (landing) and **partner application** (`/partners#apply`) are
  real Netlify Forms — submissions land in the Netlify dashboard under
  Forms (`waitlist` and `partner-application`). The hidden registration
  forms live in `public/__forms.html`; the AJAX helper is `src/lib/forms.ts`.
- **Analytics**: set `VITE_GA_ID` (see `.env.example`) to enable GA4
  pageviews plus `waitlist_submit`, `partner_apply_submit`,
  `estimate_interact`, and `request_flow_complete` events. Without the env
  var all tracking calls no-op.
- SEO: `public/robots.txt`, `public/sitemap.xml`, OG/Twitter/JSON-LD tags
  in `index.html`.

## Deploy

**Automatic**: every push to `main` on GitHub triggers
`.github/workflows/deploy.yml`, which builds and deploys to Netlify
production. Build-time env (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_GA_ID`) and the Netlify token/site id are stored as GitHub Actions
secrets.

**Manual** (bypass CI):

```bash
netlify deploy --prod --dir dist   # linked to capitalclear-redesign
```

Brand assets in `public/assets/` come from the original repo
(github.com/connorshibley/capitalclear); all imagery was generated with
Higgsfield as part of that build. Demo only: sample providers, simulated
dispatch, no payments.
