# Capital Clear — Launch Checklist

What stands between the current site and taking real orders. Items marked
**[owner]** need Easton's input, accounts, or a decision; the rest is build
work Claude can do once the owner items unblock it.

## 1. Take real bookings

- [ ] **[owner] Stripe account** — create one, share the publishable/secret
      keys as Vercel env vars. Unblocks the authorize-hold → capture-on-photo
      payment flow (`getPaymentProvider()` abstraction already exists).
- [ ] **[owner] Apply `supabase/migrations/0006_guest_bookings.sql`** — run
      `supabase db push` (or paste into the Supabase SQL editor). Enables
      account-free guest bookings + real columns for package/premium/waiver.
- [ ] Regenerate `src/types/database.types.ts`, update `createJob` to write
      the new columns, and point booking CTAs from `/demo/book` to `/book`
      (with the auth guard removed for guests).
- [ ] **[owner] Notifications provider** — pick one (Resend for email is the
      easy default; Twilio if SMS matters) and create an API key. Then:
      booking confirmation to the customer, new-job alert to pros.
- [ ] **[owner] Decide: re-enable login now or after first orders?** The real
      role-based login already works; it's just unlinked for review.

## 2. Supply side (pros)

- [ ] **[owner] Insurance requirement** — the liability waiver puts everything
      on the subcontractor, so pro onboarding MUST collect and verify proof of
      liability insurance. Decide minimum coverage ($2M is typical).
- [ ] Pro onboarding flow with document upload + admin verification queue.
- [ ] **[owner] Stripe Connect** for automatic pro payouts (85/15 split lives
      in the dashboard already).

## 3. Content the owner must supply

- [ ] **[owner] Real reviews** — `src/components/landing/Testimonials.tsx`
      ships with clearly-flagged SAMPLE quotes. Replace before marketing
      (fake reviews violate the Competition Act).
- [ ] **[owner] Business phone number** + expected response time for the site.
- [ ] **[owner] Real domain** (e.g. capitalclear.ca) — then set
      `NEXT_PUBLIC_SITE_URL` in Vercel and re-verify OG/sitemap URLs.
- [ ] **[owner] Lawyer review** of the Terms (liability + cancellations) and
      the booking waiver wording.
- [ ] **[owner] Before/after photos** from the first real jobs.

## 4. Nice-to-haves queued

- [ ] Seasonal auto-clear subscription (the real recurring-revenue product).
- [ ] Weather-triggered dispatch (storm banner exists; auto-opening jobs
      from forecast thresholds is the next step).
- [ ] OG image (branded card for link sharing).
- [ ] Turn off Vercel Deployment Protection when previews should be shareable.
