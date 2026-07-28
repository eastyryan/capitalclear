-- ===========================================================================
-- PHASE 3 — Territory model: postal-code routing with a company + crew layer
-- ===========================================================================
-- >>> DO NOT APPLY YET. <<<
--
-- This is ready and reconciled against the real schema, but applying it before
-- company data exists would BREAK THE PARTNER DASHBOARD. The scoped SELECT
-- policy only shows a crew member requests in FSAs their company covers, so
-- with `companies` / `company_members` / `company_service_areas` empty, every
-- partner would see an empty queue.
--
-- Apply only once onboarding is done, in this order:
--   1. Run the additive part (everything above the ENFORCEMENT section).
--   2. Create a company row per real partner outfit, add each partner login to
--      it via company_members, and list their FSAs in company_service_areas.
--   3. Verify: a partner sees their expected jobs through the NEW policy while
--      the old one is still in place.
--   4. Only then run the ENFORCEMENT section, which drops the legacy policy.
--
-- Two bugs from the first draft, caught by introspecting the live database:
--
--   * accept_request is really `(req_id uuid) RETURNS void, LANGUAGE sql`. The
--     draft used CREATE OR REPLACE with `returns public.requests`, which
--     PostgreSQL rejects outright — "cannot change return type of existing
--     function". It now keeps `returns void` and the same signature, so no DROP
--     is needed and PartnerDashboard.tsx (which ignores the return value and
--     re-fetches the row) needs no change.
--   * The draft also silently dropped `accepted_at = now()`, which the live
--     function sets. Restored.
-- ===========================================================================

begin;

-- ===========================================================================
-- Serviceable postal areas. Neutral name (not "ottawa_*") so a second city is
-- a data change, not a rename. FSA = first three chars of a postal code.
-- Seed transcribed from the Next.js repo's 0004_seed_fsa.sql (42 Ottawa FSAs).
-- ===========================================================================
create table if not exists public.service_fsa (
  fsa       text primary key check (fsa ~ '^[A-Z]\d[A-Z]$'),
  area_name text not null
);

insert into public.service_fsa (fsa, area_name) values
  ('K1A','Ottawa'),('K1B','Gloucester'),('K1C','Orleans'),('K1G','Gloucester'),
  ('K1H','Ottawa'),('K1J','Gloucester'),('K1K','Ottawa'),('K1L','Ottawa'),
  ('K1M','Ottawa'),('K1N','Ottawa'),('K1P','Ottawa'),('K1R','Ottawa'),
  ('K1S','Ottawa'),('K1T','Gloucester'),('K1V','Ottawa'),('K1W','Orleans'),
  ('K1X','Gloucester'),('K1Y','Ottawa'),('K1Z','Ottawa'),('K2A','Ottawa'),
  ('K2B','Nepean'),('K2C','Nepean'),('K2E','Nepean'),('K2G','Nepean'),
  ('K2H','Nepean'),('K2J','Barrhaven'),('K2K','Kanata'),('K2L','Kanata'),
  ('K2M','Kanata'),('K2P','Ottawa'),('K2R','Nepean'),('K2S','Stittsville'),
  ('K2T','Kanata'),('K2V','Kanata'),('K2W','Kanata'),('K4A','Orleans'),
  ('K4B','Gloucester'),('K4C','Gloucester'),('K0A','Ottawa'),('K4M','Ottawa'),
  ('K4P','Ottawa'),('K4R','Ottawa')
on conflict (fsa) do update set area_name = excluded.area_name;

-- ===========================================================================
-- Companies, crew membership, and coverage.
--   companies             — the org you onboard; owns FSAs + the Stripe account
--   company_members       — links an existing partner login to a company
--   company_service_areas — which FSAs a company covers. BROADCAST model: no
--                           unique constraint on fsa alone, so several
--                           companies may cover one FSA and race to accept.
-- ===========================================================================
create table if not exists public.companies (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  approved          boolean not null default false,
  stripe_account_id text,
  payouts_enabled   boolean not null default false,
  created_at        timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  partner_id uuid not null references public.partners(id)  on delete cascade,
  role       text not null default 'crew' check (role in ('owner','crew')),
  primary key (company_id, partner_id)
);

create table if not exists public.company_service_areas (
  company_id uuid not null references public.companies(id) on delete cascade,
  fsa        text not null references public.service_fsa(fsa) on delete cascade,
  primary key (company_id, fsa)
);

-- ---------------------------------------------------------------------------
-- Routing columns. `fsa` is a STORED generated column so there is exactly one
-- derivation of the territory key. postal_code already exists from Phase 1.
-- ---------------------------------------------------------------------------
alter table public.requests add column if not exists fsa text
  generated always as (upper(substr(regexp_replace(coalesce(postal_code,''), '\s', '', 'g'), 1, 3))) stored;
alter table public.requests add column if not exists assigned_company uuid references public.companies(id);
create index if not exists requests_status_fsa_idx on public.requests(status, fsa);

alter table public.service_fsa            enable row level security;
alter table public.companies              enable row level security;
alter table public.company_members        enable row level security;
alter table public.company_service_areas  enable row level security;

drop policy if exists service_fsa_read               on public.service_fsa;
drop policy if exists companies_member_read          on public.companies;
drop policy if exists company_members_self_read      on public.company_members;
drop policy if exists company_service_areas_member_read on public.company_service_areas;

create policy service_fsa_read on public.service_fsa
  for select to anon, authenticated using (true);

create policy companies_member_read on public.companies
  for select to authenticated using (
    exists (select 1 from public.company_members cm
             where cm.company_id = companies.id and cm.partner_id = auth.uid())
  );

create policy company_members_self_read on public.company_members
  for select to authenticated using (partner_id = auth.uid());

create policy company_service_areas_member_read on public.company_service_areas
  for select to authenticated using (
    exists (select 1 from public.company_members cm
             where cm.company_id = company_service_areas.company_id
               and cm.partner_id = auth.uid())
  );

commit;

-- ===========================================================================
-- ENFORCEMENT — run separately, only after step 2 above is done.
-- ===========================================================================
-- begin;
--
-- -- Territory-scoped claim. Same signature and return type as the live
-- -- function, so no DROP and no client change. The single conditional UPDATE
-- -- (status = 'new') still guarantees exactly one winner under the race.
-- create or replace function public.accept_request(req_id uuid)
-- returns void
-- language sql
-- security definer
-- set search_path = ''
-- as $$
--   update public.requests r
--      set status           = 'accepted',
--          accepted_at      = now(),
--          assigned_partner = auth.uid(),
--          assigned_company = cm.company_id
--     from public.company_members cm
--     join public.company_service_areas csa on csa.company_id = cm.company_id
--     join public.companies c on c.id = cm.company_id
--    where r.id = req_id
--      and r.status = 'new'
--      and cm.partner_id = auth.uid()
--      and c.approved
--      and csa.fsa = r.fsa;
-- $$;
--
-- -- Crew see only 'new' requests in their company's FSAs, plus their own jobs.
-- create policy requests_member_select on public.requests
--   for select to authenticated using (
--     assigned_partner = auth.uid()
--     or (status = 'new' and exists (
--           select 1 from public.company_members cm
--             join public.company_service_areas csa on csa.company_id = cm.company_id
--             join public.companies c on c.id = cm.company_id
--            where cm.partner_id = auth.uid() and c.approved and csa.fsa = requests.fsa))
--   );
--
-- -- CRITICAL: policies are OR'd. The legacy policy lets a partner see any 'new'
-- -- request whose area IS NULL, which would defeat the scoping above entirely.
-- drop policy if exists "partners read matched and own jobs" on public.requests;
--
-- commit;
