-- ===========================================================================
-- PHASE 2 — Lock down direct client writes
-- ===========================================================================
-- RUN THIS ONLY AFTER THE NEW FRONTEND IS LIVE AND VERIFIED.
--
-- Every statement here is a RESTRICTION. The client deployed before this point
-- inserts into `requests` directly; the moment INSERT is revoked, that client
-- stops being able to book. Run Phase 1, deploy the frontend, confirm a real
-- booking lands, and only then run this.
--
-- Why column privileges: PostgreSQL checks them independently of RLS, so they
-- hold regardless of what a row policy's USING/WITH CHECK clause allows.
--
-- Two holes from the audit, re-checked against the live schema:
--
--   #1 PARTNER SELF-APPROVAL — real, and NOT covered by what is already there.
--      The existing guard_partner_payment_fields trigger pins stripe_account_id
--      and payouts_enabled on update, but says nothing about `approved`. With
--      the "partner updates own row" policy, a partner can today set
--      approved = true on themselves. The column grant below closes it.
--
--   #2 SIGNUP METADATA — NOT a real hole here. The live handle_new_partner()
--      inserts only (id, email) and never reads raw_user_meta_data, so there is
--      nothing to exploit. An earlier draft of this migration replaced that
--      function with one that DOES read metadata — strictly more attack surface
--      for no benefit. Connor's version is left exactly as it is.
--
--   #3 CLIENT-SET PRICE — real. create_request() (Phase 1) is the only way in
--      once direct INSERT is gone.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- #1 — Partners may edit only their own contact details. approved,
-- payouts_enabled, stripe_account_id and email become service-role only
-- (admin actions and Stripe webhooks bypass grants).
-- ---------------------------------------------------------------------------
revoke insert, update on public.partners from anon, authenticated;
grant  update (company, phone, service_areas) on public.partners to authenticated;

-- ---------------------------------------------------------------------------
-- #3 — create_request() is now the only creation path. The accept / decline /
-- complete RPCs are already SECURITY DEFINER, so they remain the only way to
-- mutate a row after creation.
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.requests from anon, authenticated;

-- Dead once INSERT is revoked, but drop it so the policy list reflects reality.
drop policy if exists "anon can create new requests" on public.requests;

commit;
