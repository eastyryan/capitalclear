-- ===========================================================================
-- 20260725120000_security_hardening.sql
-- ===========================================================================
-- Closes the three "rob me" holes found in the audit, adapted to the Connor
-- (Vite) base. SAFE to run against the LIVE database (frsugygafnyvnrfctbbx):
-- every statement is idempotent or CREATE OR REPLACE, and nothing drops data.
--
--   #1  Partners self-approving / self-setting their Stripe payout destination
--   #2  Signup metadata setting privileged partner fields
--   #3  Homeowners setting their own price / status / payment on a request
--
-- HOW THE FIX WORKS: PostgreSQL checks COLUMN privileges independently of RLS,
-- so revoking write access to privileged columns holds no matter what a row's
-- RLS USING/WITH CHECK clause allows. That is the backbone of #1 and #3.
--
-- ASSUMPTIONS (schema is not in git — verify with `supabase db pull` first):
--   * Table/column names match supabase/SCHEMA-RECONSTRUCTED.sql.
--   * requests.price is whole DOLLARS (priceFor = round(base * mult)).
--   * All request status changes go through the accept/decline/complete RPCs.
-- If any column name differs in the pulled schema, adjust it here before running.
-- ===========================================================================

begin;

-- ===========================================================================
-- FIX #1 + #2 — Partners cannot grant themselves approval, payouts, or a
-- payout destination. Only company/phone/service_areas stay self-editable.
-- approved / payouts_enabled / stripe_account_id / email become writable ONLY
-- by service_role (admin actions + Stripe webhooks), which bypasses grants.
-- ===========================================================================

revoke insert, update on public.partners from anon, authenticated;
grant  update (company, phone, service_areas) on public.partners to authenticated;

-- Reference: a metadata-safe partner provisioning trigger. If you provision the
-- partners row from a SECURITY DEFINER trigger on signup, replace your function
-- body with this shape so client-supplied metadata can NEVER seed the
-- privileged fields. Binding is intentionally left commented — enable it ONLY
-- if every authenticated user is a partner (homeowners are anonymous in this
-- app), and drop any pre-existing unsafe trigger first.
create or replace function public.handle_new_partner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.partners (id, email, company, phone,
                               approved, payouts_enabled, stripe_account_id)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'company', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    false,   -- approved: NEVER from metadata
    false,   -- payouts_enabled: NEVER from metadata
    null     -- stripe_account_id: NEVER from metadata
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- drop trigger if exists on_auth_user_created_partner on auth.users;
-- create trigger on_auth_user_created_partner
--   after insert on auth.users
--   for each row execute function public.handle_new_partner();

-- ===========================================================================
-- FIX #3 — Homeowners cannot set their own price / status / payment. Requests
-- are created ONLY through a SECURITY DEFINER RPC that looks up the price
-- server-side. Direct INSERT/UPDATE on requests is revoked from clients; the
-- accept/decline/complete RPCs (already SECURITY DEFINER) remain the only way
-- to mutate a row.
-- ===========================================================================

-- Server-authoritative pricing. Values transcribed from src/lib/data.ts.
-- Stored in whole DOLLARS to match the existing requests.price column. (A later
-- migration should move money to integer cents; do that with the checkout edge
-- function in the same change so the unit never disagrees.)
create table if not exists public.service_pricing (
  service_id  text primary key,
  season      text    not null,
  name        text    not null,
  base_price  integer not null check (base_price >= 0)   -- whole dollars
);

insert into public.service_pricing (service_id, season, name, base_price) values
  ('driveway', 'winter', 'Driveway clearing',  52),
  ('snowblow', 'winter', 'Snow blowing',        60),
  ('walkway',  'winter', 'Walkway and salt',    38),
  ('mowing',   'summer', 'Lawn mowing',          48),
  ('hedge',    'summer', 'Hedge trimming',       65),
  ('edging',   'summer', 'Edging and cleanup',   55)
on conflict (service_id) do update
  set season = excluded.season, name = excluded.name, base_price = excluded.base_price;

create table if not exists public.scope_multipliers (
  scope text primary key,
  mult  numeric not null check (mult > 0)
);

insert into public.scope_multipliers (scope, mult) values
  ('small', 1.0), ('medium', 1.35), ('large', 1.8)
on conflict (scope) do update set mult = excluded.mult;

-- Anyone (even anonymous homeowners) may read the price book.
alter table public.service_pricing  enable row level security;
alter table public.scope_multipliers enable row level security;
drop policy if exists service_pricing_read  on public.service_pricing;
drop policy if exists scope_multipliers_read on public.scope_multipliers;
create policy service_pricing_read  on public.service_pricing  for select to anon, authenticated using (true);
create policy scope_multipliers_read on public.scope_multipliers for select to anon, authenticated using (true);

-- The ONLY way to create a request. Price + service_name are derived here, so
-- the client cannot dictate them; status/payment/assignment are forced.
create or replace function public.create_request(
  p_address    text,
  p_service_id text,
  p_scope      text,
  p_season     text,
  p_pin_x      numeric default null,
  p_pin_y      numeric default null,
  p_contact    text    default null,
  p_area       text    default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base  integer;
  v_name  text;
  v_mult  numeric;
  v_price integer;
  v_id    uuid := gen_random_uuid();
begin
  select base_price, name into v_base, v_name
    from public.service_pricing where service_id = p_service_id;
  if v_base is null then
    raise exception 'unknown service_id: %', p_service_id using errcode = '22023';
  end if;

  select mult into v_mult from public.scope_multipliers where scope = p_scope;
  if v_mult is null then
    raise exception 'unknown scope: %', p_scope using errcode = '22023';
  end if;

  v_price := round(v_base * v_mult);   -- whole dollars, matches priceFor()

  insert into public.requests (
    id, address, pin_x, pin_y, service_id, service_name, scope, price,
    season, status, contact, assigned_partner, area, payment_status, paid_amount
  ) values (
    v_id, p_address, p_pin_x, p_pin_y, p_service_id, v_name, p_scope, v_price,
    p_season, 'new', p_contact, null, p_area, 'unpaid', null
  );

  return v_id;
end;
$$;

grant execute on function public.create_request(text,text,text,text,numeric,numeric,text,text)
  to anon, authenticated;

-- Lock down the requests table itself: no direct writes from clients. All
-- creation goes through create_request(); all transitions through the existing
-- accept_request / decline_request / complete_request RPCs (SECURITY DEFINER,
-- so they do not need these grants).
revoke insert, update, delete on public.requests from anon, authenticated;

commit;

-- ===========================================================================
-- PRE-LAUNCH (payments are not enabled yet — VITE_STRIPE_ENABLED unset).
-- Before flipping Stripe on, the stripe-payout Edge Function MUST, server-side:
--   1. verify auth.uid() = requests.assigned_partner for req_id,
--   2. verify requests.status = 'done' AND requests.payment_status = 'paid',
--   3. be idempotent — refuse to pay a request that already paid out,
--   4. run with the service role and never trust an amount from the client.
-- Better: have complete_request() initiate the payout server-side so the
-- browser never calls stripe-payout at all (today PartnerDashboard.tsx:111
-- fires `void payout(id)` unguarded and unawaited).
-- ===========================================================================
