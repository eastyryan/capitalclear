-- ===========================================================================
-- 20260725130000_territory_model.sql
-- ===========================================================================
-- Postal-code territories with a real company + crew layer, on top of the
-- Connor (Vite) base. Routing model = BROADCAST WITHIN THE AREA: any company
-- that covers a request's FSA sees it, and the first crew member to accept wins
-- via an atomic claim.
--
-- SAFE to run against the LIVE database: additive tables/columns are guarded,
-- functions are CREATE OR REPLACE. Two items need reconciliation AFTER
-- `supabase db pull` (they touch objects whose current form isn't in git) —
-- they are called out inline with  >>> RECONCILE <<<.
--
-- Depends on 20260725120000_security_hardening.sql (create_request, price book).
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
--   companies            — the org you onboard; owns FSAs + the Stripe account.
--   company_members      — links an existing partner login (a person) to a
--                          company as owner or crew.
--   company_service_areas— which FSAs a company covers. BROADCAST model: no
--                          unique constraint on fsa alone, so multiple
--                          companies may cover the same FSA and race to accept.
-- ===========================================================================
create table if not exists public.companies (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  legal_name        text,
  hst_number        text,
  email             text,
  phone             text,
  approved          boolean not null default false,   -- gate for territory + payouts
  stripe_account_id text,                             -- Connect payout destination
  payouts_enabled   boolean not null default false,
  created_at        timestamptz not null default now()
);

create table if not exists public.company_members (
  company_id uuid not null references public.companies(id) on delete cascade,
  partner_id uuid not null references public.partners(id)  on delete cascade,
  role       text not null default 'crew' check (role in ('owner','crew')),
  created_at timestamptz not null default now(),
  primary key (company_id, partner_id)
);
create index if not exists company_members_partner_idx on public.company_members(partner_id);

create table if not exists public.company_service_areas (
  company_id uuid not null references public.companies(id)  on delete cascade,
  fsa        text not null references public.service_fsa(fsa),
  created_at timestamptz not null default now(),
  primary key (company_id, fsa)
);
create index if not exists company_service_areas_fsa_idx on public.company_service_areas(fsa);

-- ===========================================================================
-- Requests gain a postal code (the routing input), a derived FSA (the routing
-- key, as a STORED generated column so there is exactly one derivation), and
-- the winning company alongside the winning crew member.
-- ===========================================================================
alter table public.requests add column if not exists postal_code text;
alter table public.requests add column if not exists fsa text
  generated always as (upper(substr(regexp_replace(coalesce(postal_code,''), '\s', '', 'g'), 1, 3))) stored;
alter table public.requests add column if not exists assigned_company uuid references public.companies(id);
create index if not exists requests_status_fsa_idx on public.requests(status, fsa);

-- ===========================================================================
-- create_request() v2 — now takes a postal code, validates it against the
-- serviceable list, and stores it so the row is routable. Supersedes the
-- 8-arg version from the security migration.
-- ===========================================================================
drop function if exists public.create_request(text,text,text,text,numeric,numeric,text,text);

create or replace function public.create_request(
  p_address     text,
  p_service_id  text,
  p_scope       text,
  p_season      text,
  p_postal_code text default null,
  p_pin_x       numeric default null,
  p_pin_y       numeric default null,
  p_contact     text    default null,
  p_area        text    default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_base   integer;
  v_name   text;
  v_mult   numeric;
  v_price  integer;
  v_fsa    text;
  v_id     uuid := gen_random_uuid();
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

  -- Serviceability: derive the FSA and require coverage. Kept non-fatal when no
  -- postal is supplied so any legacy caller still works; when one IS supplied it
  -- must be an area we service.
  if p_postal_code is not null and length(trim(p_postal_code)) > 0 then
    v_fsa := upper(substr(regexp_replace(p_postal_code, '\s', '', 'g'), 1, 3));
    if not exists (select 1 from public.service_fsa where fsa = v_fsa) then
      raise exception 'OUT_OF_AREA: %', v_fsa using errcode = 'P0001';
    end if;
  end if;

  v_price := round(v_base * v_mult);   -- whole dollars, matches priceFor()

  insert into public.requests (
    id, address, postal_code, pin_x, pin_y, service_id, service_name, scope,
    price, season, status, contact, assigned_partner, assigned_company, area,
    payment_status, paid_amount
  ) values (
    v_id, p_address, p_postal_code, p_pin_x, p_pin_y, p_service_id, v_name,
    p_scope, v_price, p_season, 'new', p_contact, null, null, p_area,
    'unpaid', null
  );

  return v_id;
end;
$$;

grant execute on function
  public.create_request(text,text,text,text,text,numeric,numeric,text,text)
  to anon, authenticated;

-- ===========================================================================
-- accept_request() — territory-scoped atomic claim. A crew member may accept a
-- 'new' request ONLY if they belong to an APPROVED company that covers the
-- request's FSA. The single conditional UPDATE (status = 'new') guarantees
-- exactly one winner under the broadcast race.
--
-- >>> RECONCILE <<< Connor's existing accept_request(req_id uuid) body is not
-- in git. This CREATE OR REPLACE assumes that signature. After `supabase db
-- pull`, confirm the signature/return type match, then keep THIS body.
-- ===========================================================================
create or replace function public.accept_request(req_id uuid)
returns public.requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row     public.requests;
  v_company uuid;
  v_fsa     text;
begin
  select fsa into v_fsa from public.requests where id = req_id;
  if v_fsa is null then
    raise exception 'request % is not routable (no FSA)', req_id using errcode = 'P0001';
  end if;

  -- The caller's approved company that covers this FSA (if any).
  select c.id into v_company
    from public.company_members cm
    join public.company_service_areas csa on csa.company_id = cm.company_id
    join public.companies c on c.id = cm.company_id
   where cm.partner_id = auth.uid()
     and csa.fsa = v_fsa
     and c.approved
   limit 1;

  if v_company is null then
    raise exception 'not authorized to accept requests in %', v_fsa using errcode = '42501';
  end if;

  update public.requests
     set status           = 'accepted',
         assigned_partner = auth.uid(),
         assigned_company = v_company
   where id = req_id
     and status = 'new'
  returning * into v_row;

  if v_row.id is null then
    raise exception 'request % already taken', req_id using errcode = '55000';
  end if;

  return v_row;
end;
$$;

-- ===========================================================================
-- RLS: crew see only 'new' requests in their company's covered FSAs, plus any
-- request already assigned to them. Replaces citywide/service-type visibility.
--
-- >>> RECONCILE <<< The current requests SELECT policy is in the dashboard, not
-- git. RLS policies are OR'd, so leaving a broad existing policy in place would
-- defeat this scoping. After `supabase db pull`, DROP the old broad requests
-- SELECT policy so only `requests_member_select` remains.
-- ===========================================================================
alter table public.requests enable row level security;
drop policy if exists requests_member_select on public.requests;
create policy requests_member_select on public.requests
  for select to authenticated
  using (
    assigned_partner = auth.uid()
    or (
      status = 'new'
      and fsa in (
        select csa.fsa
          from public.company_members cm
          join public.company_service_areas csa on csa.company_id = cm.company_id
         where cm.partner_id = auth.uid()
      )
    )
  );

-- Read policies for the new supporting tables.
alter table public.service_fsa            enable row level security;
alter table public.companies              enable row level security;
alter table public.company_members        enable row level security;
alter table public.company_service_areas  enable row level security;

drop policy if exists service_fsa_read on public.service_fsa;
create policy service_fsa_read on public.service_fsa
  for select to anon, authenticated using (true);

-- A member can see their own companies and coverage; nothing writable by
-- clients (companies, membership, and coverage are managed by admin/service
-- role — an owner UI can be layered on later through definer RPCs).
drop policy if exists companies_member_read on public.companies;
create policy companies_member_read on public.companies
  for select to authenticated
  using (id in (select company_id from public.company_members where partner_id = auth.uid()));

drop policy if exists company_members_self_read on public.company_members;
create policy company_members_self_read on public.company_members
  for select to authenticated
  using (partner_id = auth.uid()
         or company_id in (select company_id from public.company_members where partner_id = auth.uid()));

drop policy if exists company_service_areas_member_read on public.company_service_areas;
create policy company_service_areas_member_read on public.company_service_areas
  for select to authenticated
  using (company_id in (select company_id from public.company_members where partner_id = auth.uid()));

revoke insert, update, delete on
  public.companies, public.company_members, public.company_service_areas, public.service_fsa
  from anon, authenticated;

commit;

-- ===========================================================================
-- Migrating existing partners → companies (run once, after review):
--   For each current partner, create a company, add the partner as 'owner',
--   and translate their service_areas name-strings into company_service_areas
--   FSAs. Left as a manual step because the name-string → FSA mapping needs a
--   human eye. Example scaffold:
--
--   insert into public.companies (name, email, phone, approved, stripe_account_id, payouts_enabled)
--     select coalesce(company, email), email, phone, approved, stripe_account_id, payouts_enabled
--       from public.partners;
--   -- then wire company_members(owner) and company_service_areas per partner.
-- ===========================================================================
