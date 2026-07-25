-- ===========================================================================
-- SCHEMA-RECONSTRUCTED.sql  —  REFERENCE ONLY. DO NOT RUN AGAINST THE LIVE DB.
-- ===========================================================================
-- CapitalClear's real schema lives only in the Supabase dashboard (project
-- ref: frsugygafnyvnrfctbbx) and has never been in version control. This file
-- is a best-effort reconstruction from the deployed client bundle and the
-- TypeScript interfaces in src/lib/supabase.ts + src/lib/auth.tsx, so that
-- reviewers can read the migrations in this folder with the table shapes in
-- front of them.
--
-- The authoritative baseline should be produced by whoever holds the DB
-- password, with:
--     supabase link --project-ref frsugygafnyvnrfctbbx
--     supabase db pull            # writes the TRUE schema as a migration
-- Once that lands, delete this file and trust the pulled migration.
--
-- Column TYPES below are inferred; names are taken verbatim from the app.
-- ===========================================================================

-- partners — one row per authenticated partner company (id = auth.users.id).
-- Source: PartnerProfile interface, src/lib/auth.tsx:11-20.
create table if not exists public.partners (
  id                uuid primary key references auth.users (id) on delete cascade,
  company           text,
  email             text,
  phone             text,
  service_areas     text[] not null default '{}',   -- neighbourhood NAME strings today
  approved          boolean not null default false,  -- gate: can see/accept real jobs
  stripe_account_id text,                            -- Connect payout destination
  payouts_enabled   boolean not null default false
);

-- requests — one row per homeowner service request (the "jobs" of this app).
-- Source: RequestRow interface, src/lib/supabase.ts:22-40. NOTE: price and
-- paid_amount are whole DOLLARS (priceFor() = Math.round(base * mult)), not
-- cents. There is currently NO postal_code column — the territory work adds it.
create table if not exists public.requests (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  address          text,
  pin_x            numeric,
  pin_y            numeric,
  service_id       text,
  service_name     text,
  scope            text,
  price            numeric,   -- whole dollars
  season           text,
  status           text not null default 'new',      -- new | accepted | declined | done
  contact          text,
  assigned_partner uuid references public.partners (id),
  area             text,                              -- neighbourhood NAME string, nullable
  payment_status   text not null default 'unpaid',   -- unpaid | paid | refunded
  paid_amount      numeric
);

-- waitlist — homeowner email capture. Source: src/lib/waitlist.ts:11-12.
create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email      text not null,
  town       text
);

-- Status transitions run through SECURITY DEFINER RPCs called as
-- supabase.rpc(name, { req_id }) — src/routes/PartnerDashboard.tsx:107:
--     accept_request(req_id uuid)
--     decline_request(req_id uuid)
--     complete_request(req_id uuid)
-- Their bodies are NOT in git. Pull them before editing.
