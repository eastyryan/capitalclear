# Supabase — schema & migrations

The live database (project ref `frsugygafnyvnrfctbbx`) was built entirely in the
Supabase dashboard and has **never been in version control**. This folder starts
fixing that. There are two kinds of file here:

- `SCHEMA-RECONSTRUCTED.sql` — a **reference-only** reconstruction of the current
  tables, inferred from the app. Do **not** run it against the live DB.
- `migrations/*.sql` — **applyable** corrective migrations. Each is idempotent
  and safe to run against the live database.

## Step 0 — get the real schema into git (do this first)

Whoever holds the database password:

```bash
supabase link --project-ref frsugygafnyvnrfctbbx
supabase db pull                 # writes the TRUE baseline as a migration
```

Then open `migrations/20260725120000_security_hardening.sql` and confirm every
table/column name it references matches the pulled baseline. The hardening
migration was written against `SCHEMA-RECONSTRUCTED.sql`; if `db pull` shows a
different column name, fix it in the migration before applying. Once the real
baseline lands, delete `SCHEMA-RECONSTRUCTED.sql`.

## Step 1 — apply the security hardening

```bash
supabase db push                 # applies migrations/ in order
```

`20260725120000_security_hardening.sql` closes three holes from the audit:

| # | Hole | Fix |
|---|------|-----|
| 1 | A partner could set their own `approved` / `payouts_enabled` / `stripe_account_id` by updating their own row | Column-level `REVOKE`/`GRANT`: partners may write only `company`, `phone`, `service_areas`. The rest is service-role-only. |
| 2 | Signup metadata could seed privileged partner fields | Metadata-safe `handle_new_partner()` reference function (hardcodes the privileged fields to safe values). |
| 3 | A homeowner set their own `price` (and could set `status`/`payment_status`) on a request | Requests are created only via the `create_request()` RPC, which derives price server-side from a price book. Direct `INSERT`/`UPDATE`/`DELETE` on `requests` is revoked from clients. |

Column privileges are enforced independently of RLS, so these hold regardless of
what the row policies allow.

## Step 2 — deploy ordering (important)

The client change in `src/lib/supabase.ts` now calls `create_request()` instead
of inserting into `requests`. **Apply the SQL before deploying the branch**, or
new bookings will fail against a database that doesn't have the RPC yet.

## Pre-launch — before enabling Stripe

Payments are off today (`VITE_STRIPE_ENABLED` unset), so hole #3's payout path
isn't reachable yet. Before flipping Stripe on, the `stripe-payout` Edge Function
must, server-side: verify the caller is the request's `assigned_partner`; verify
`status = 'done'` and `payment_status = 'paid'`; be idempotent; and never trust a
client amount. Better still, have `complete_request()` initiate the payout so the
browser never calls `stripe-payout` directly (today `PartnerDashboard.tsx:111`
fires it unguarded and unawaited).

## What's not in git yet

The `accept_request` / `decline_request` / `complete_request` RPC bodies and all
Edge Functions still live only in the dashboard. `supabase db pull` +
`supabase functions download` will bring them in — do that before editing them.
