-- ===========================================================================
-- PHASE 1 — Live pricing + server-authoritative create_request()
-- ===========================================================================
-- Reconciled against the REAL schema of frsugygafnyvnrfctbbx (introspected
-- 2026-07-28), not the earlier guess in SCHEMA-RECONSTRUCTED.sql.
--
-- Everything here is ADDITIVE and backward-compatible: the currently deployed
-- client still inserts into `requests` directly and keeps working. Nothing is
-- revoked and no policy is dropped — that is Phase 2, which must run only
-- AFTER the new frontend is live, or bookings break in the gap between the two.
--
-- Real schema facts this relies on:
--   * requests.price is `integer` (whole dollars) — pricing stays in dollars.
--   * requests.scope is plain `text` with NO check constraint, so the new
--     'single'/'double' values insert cleanly alongside historical
--     'small'/'medium'/'large' rows.
--   * requests has no postal_code and no addons column yet; both added here.
--   * The on_new_request trigger fires on INSERT into requests, so bookings
--     created through this RPC still send the notify-request webhook.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- Price book. Whole CAD dollars, matching the existing requests.price column.
-- ---------------------------------------------------------------------------
create table if not exists public.service_pricing (
  service_id text primary key,
  season     text    not null,
  name       text    not null,
  base_price integer not null check (base_price >= 0),
  flat_rate  boolean not null default false
);

insert into public.service_pricing (service_id, season, name, base_price, flat_rate) values
  ('driveway', 'winter', 'Driveway clearing', 45, false),
  ('walkway',  'winter', 'Walkway',           25, true),
  ('premium',  'winter', 'Priority Premium',  10, true),
  ('mowing',   'summer', 'Lawn mowing',       48, false),
  ('hedge',    'summer', 'Hedge trimming',    65, false),
  ('edging',   'summer', 'Edging and cleanup',55, false)
on conflict (service_id) do update
  set season = excluded.season, name = excluded.name,
      base_price = excluded.base_price, flat_rate = excluded.flat_rate;

create table if not exists public.scope_multipliers (
  scope text primary key,
  mult  numeric not null check (mult > 0)
);

insert into public.scope_multipliers (scope, mult) values
  ('single', 1.0),
  ('double', 55.0 / 45.0)
on conflict (scope) do update set mult = excluded.mult;

-- Explicit per-size prices. Takes precedence over base * multiplier so Single
-- and Double are exactly the published numbers, not a rounded product.
create table if not exists public.service_scope_price (
  service_id text    not null references public.service_pricing(service_id) on delete cascade,
  scope      text    not null references public.scope_multipliers(scope)    on delete cascade,
  price      integer not null check (price >= 0),
  primary key (service_id, scope)
);

insert into public.service_scope_price (service_id, scope, price) values
  ('driveway', 'single', 45),
  ('driveway', 'double', 55)
on conflict (service_id, scope) do update set price = excluded.price;

-- Stacking add-ons: flat, never scaled by driveway size. Mirrors ADDONS in
-- src/lib/data.ts. Priced here so the client cannot invent a free extra.
create table if not exists public.service_addons (
  addon_id text    primary key,
  season   text    not null,
  name     text    not null,
  price    integer not null check (price >= 0)
);

insert into public.service_addons (addon_id, season, name, price) values
  ('walkway', 'winter', 'Walkway',          25),
  ('premium', 'winter', 'Priority Premium', 10)
on conflict (addon_id) do update
  set season = excluded.season, name = excluded.name, price = excluded.price;

-- The price book is public knowledge — anyone may read it.
alter table public.service_pricing     enable row level security;
alter table public.scope_multipliers   enable row level security;
alter table public.service_scope_price enable row level security;
alter table public.service_addons      enable row level security;

drop policy if exists service_pricing_read     on public.service_pricing;
drop policy if exists scope_multipliers_read   on public.scope_multipliers;
drop policy if exists service_scope_price_read on public.service_scope_price;
drop policy if exists service_addons_read      on public.service_addons;

create policy service_pricing_read     on public.service_pricing     for select to anon, authenticated using (true);
create policy scope_multipliers_read   on public.scope_multipliers   for select to anon, authenticated using (true);
create policy service_scope_price_read on public.service_scope_price for select to anon, authenticated using (true);
create policy service_addons_read      on public.service_addons      for select to anon, authenticated using (true);

-- Explicit, rather than relying on Supabase's default-privilege config for
-- newly created tables. Read-only: these tables are written by service_role.
grant select on public.service_pricing     to anon, authenticated;
grant select on public.scope_multipliers   to anon, authenticated;
grant select on public.service_scope_price to anon, authenticated;
grant select on public.service_addons      to anon, authenticated;

-- ---------------------------------------------------------------------------
-- New columns on requests. Both additive; existing rows get the defaults.
-- ---------------------------------------------------------------------------
alter table public.requests add column if not exists postal_code text;
alter table public.requests add column if not exists addons      text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- create_request() — the server derives price and service_name, and forces
-- status / payment / assignment. Price resolution mirrors quoteFor() in
-- src/lib/data.ts exactly:
--   1. explicit (service_id, scope) price   e.g. driveway single/double
--   2. flat_rate service                    e.g. a walkway-only booking
--   3. base_price * scope multiplier        everything else (summer)
--   + every selected add-on's flat price on top
--
-- SECURITY DEFINER, so it works in Phase 1 while clients still hold direct
-- INSERT, and keeps working in Phase 2 once that is revoked.
-- ---------------------------------------------------------------------------
create or replace function public.create_request(
  p_address     text,
  p_service_id  text,
  p_scope       text,
  p_season      text,
  p_addons      text[]  default '{}',
  p_postal_code text    default null,
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
  v_base    integer;
  v_name    text;
  v_flat    boolean;
  v_mult    numeric;
  v_price   integer;
  v_addons  text[] := coalesce(p_addons, '{}');
  v_extras  integer;
  v_unknown text;
  v_id      uuid := gen_random_uuid();
begin
  select base_price, name, flat_rate into v_base, v_name, v_flat
    from public.service_pricing where service_id = p_service_id;
  if v_base is null then
    raise exception 'unknown service_id: %', p_service_id using errcode = '22023';
  end if;

  select mult into v_mult from public.scope_multipliers where scope = p_scope;
  if v_mult is null then
    raise exception 'unknown scope: %', p_scope using errcode = '22023';
  end if;

  -- Tier 1: an explicit price for this service at this size.
  select price into v_price
    from public.service_scope_price
   where service_id = p_service_id and scope = p_scope;

  -- Tier 2/3: flat-rate service, or scale the base by the size multiplier.
  if v_price is null then
    v_price := case when v_flat then v_base else round(v_base * v_mult) end;
  end if;

  -- Reject an unknown add-on rather than silently pricing it at zero.
  select a into v_unknown
    from unnest(v_addons) as a
   where not exists (select 1 from public.service_addons sa where sa.addon_id = a)
   limit 1;
  if v_unknown is not null then
    raise exception 'unknown addon: %', v_unknown using errcode = '22023';
  end if;

  select coalesce(sum(price), 0) into v_extras
    from public.service_addons where addon_id = any (v_addons);

  v_price := v_price + v_extras;

  insert into public.requests (
    id, address, postal_code, pin_x, pin_y, service_id, service_name, scope,
    addons, price, season, status, contact, assigned_partner, area,
    payment_status, paid_amount
  ) values (
    v_id, p_address, p_postal_code, p_pin_x, p_pin_y, p_service_id, v_name,
    p_scope, v_addons, v_price, p_season, 'new', p_contact, null, p_area,
    'unpaid', null
  );

  return v_id;
end;
$$;

grant execute on function
  public.create_request(text,text,text,text,text[],text,numeric,numeric,text,text)
  to anon, authenticated;

commit;
