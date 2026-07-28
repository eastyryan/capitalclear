# Supabase — schema & migrations

The live database (project ref `frsugygafnyvnrfctbbx`, **Connor's project**) was
built in the Supabase dashboard. Its 12 migrations (`init_requests` →
`waitlist_insert_both_roles`, July 16–18 2026) live in Supabase's own migration
history, not in this repo.

The three migrations here were **reconciled against the real schema** on
2026-07-28 by introspecting the live database — `information_schema.columns`,
`pg_policies`, `pg_get_functiondef`. An earlier draft written against a guessed
schema had three defects, all fixed and documented inline:

| Defect | Consequence had it run |
|---|---|
| `create_request()` only knew `small`/`medium`/`large` scopes | Every booking would fail with `unknown scope: single` |
| `accept_request()` redefined with a new return type | `cannot change return type of existing function` — migration aborts |
| `handle_new_partner()` replaced with a metadata-reading version | Would have *added* attack surface; the live one is already safe |

## Apply order — this matters

The phases are numbered because running them out of order breaks live bookings
in one direction or the other.

### Phase 1 — `20260728130000_pricing_and_create_request.sql`

Purely **additive**. Creates the price book (`service_pricing`,
`scope_multipliers`, `service_scope_price`, `service_addons`), adds
`requests.postal_code` and `requests.addons`, and creates the
server-authoritative `create_request()` RPC.

Safe to run while the **old** frontend is still live — it keeps inserting into
`requests` directly and is unaffected.

### Deploy the frontend

Push to `main` on `connorshibley/capitalclear`; the GitHub Action builds and
deploys to Netlify. Confirm a real booking lands in `requests` before moving on.

### Phase 2 — `20260728140000_lockdown_client_writes.sql`

All **restrictions**: revokes direct `INSERT`/`UPDATE`/`DELETE` on `requests`,
revokes partner self-writes except `company`/`phone`/`service_areas`, drops the
now-dead anon INSERT policy.

**Do not run this before the frontend is live.** The deployed-today client
inserts directly; the moment INSERT is revoked it can no longer book. Phase 1 →
deploy → Phase 2 gives a zero-downtime cutover.

The live hole this actually closes: `guard_partner_payment_fields` already pins
`stripe_account_id` and `payouts_enabled`, but **nothing protects `approved`** —
a partner can currently self-approve via the "partner updates own row" policy.

### Phase 3 — `20260728150000_territory_model.sql` — **not ready**

Companies, crew membership, FSA coverage, postal-code routing. The additive part
is safe, but the enforcement section (bottom of the file, commented out) drops
the legacy `requests` SELECT policy. With `companies` empty, every partner would
see an empty queue. Onboard company data first; the file documents the order.

## Pricing model

Client `quoteFor()` in `src/lib/data.ts` and `create_request()` must stay in
agreement. The database is authoritative and rejects unknown scopes and add-on
ids rather than silently pricing them at zero.

| | Price |
|---|---|
| Driveway — Single | $45 |
| Driveway — Double | $55 |
| Walkway add-on | +$25 flat, never scaled by size |
| Priority Premium add-on | +$10 flat |
| HST | 13%, added at checkout |
| Revenue share | Pro keeps 85%, CapitalClear 15% |

Money is whole CAD dollars, matching the existing `requests.price integer`
column. A later migration should move to integer cents — do it together with
the checkout edge function so the unit never disagrees.

## Still only in the dashboard

Edge Functions (`notify-request`, `stripe-payout`, the weather cron) are not in
git. `supabase functions download` will bring them in.

Before enabling Stripe, `stripe-payout` must verify server-side that the caller
is the request's `assigned_partner`, that `status = 'done'` and
`payment_status = 'paid'`, be idempotent, and never trust a client amount.
Better: have `complete_request()` initiate the payout so the browser never calls
it directly — today `PartnerDashboard.tsx:111` fires it unguarded and unawaited.
