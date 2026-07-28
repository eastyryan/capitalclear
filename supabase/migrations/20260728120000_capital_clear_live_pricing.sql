-- ===========================================================================
-- Capital Clear live pricing — align the server price book with the real rates
-- ===========================================================================
-- The two earlier migrations seeded Connor's demo price book (driveway $52,
-- snowblow $60, walkway-and-salt $38) and small/medium/large scopes. The live
-- business sells:
--
--   Driveway clearing   Single $45 / Double $55   (priced by driveway size)
--   Walkway             $25 flat add-on
--   Priority Premium    $10 flat add-on
--
-- Both changes matter for correctness, not just cosmetics:
--
--   1. The client now sends scope 'single' | 'double'. `scope_multipliers` only
--      knew small/medium/large, so create_request() would raise
--      'unknown scope: single' and EVERY booking would fail.
--   2. A pure multiplier can't express a flat add-on — the walkway would get
--      scaled by driveway size. This adds an explicit per-scope price table and
--      a flat_rate flag so the server mirrors priceFor() in src/lib/data.ts
--      exactly.
--
-- Idempotent and safe to re-run. Depends on 20260725120000 (service_pricing,
-- scope_multipliers) and 20260725130000 (FSA routing, assigned_company).
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- Flat add-ons ignore the scope multiplier entirely.
-- ---------------------------------------------------------------------------
alter table public.service_pricing
  add column if not exists flat_rate boolean not null default false;

-- ---------------------------------------------------------------------------
-- Explicit per-scope prices. Takes precedence over base_price * multiplier, so
-- Single/Double are the exact published numbers rather than a rounded product.
-- ---------------------------------------------------------------------------
create table if not exists public.service_scope_price (
  service_id text    not null references public.service_pricing(service_id) on delete cascade,
  scope      text    not null references public.scope_multipliers(scope)    on delete cascade,
  price      integer not null check (price >= 0),   -- whole dollars
  primary key (service_id, scope)
);

-- ---------------------------------------------------------------------------
-- Scopes: Single / Double. The old small/medium/large rows are removed so a
-- stale client can't book at a price the business doesn't offer.
-- ---------------------------------------------------------------------------
insert into public.scope_multipliers (scope, mult) values
  ('single', 1.0),
  ('double', 55.0 / 45.0)
on conflict (scope) do update set mult = excluded.mult;

delete from public.service_scope_price where scope in ('small', 'medium', 'large');
delete from public.scope_multipliers   where scope in ('small', 'medium', 'large');

-- ---------------------------------------------------------------------------
-- Winter price book: the live Capital Clear rates. Walkway and Priority
-- Premium are ADD-ONS that stack on the driveway, not standalone services —
-- they stay in service_pricing (flat_rate) so a walkway-only job is still
-- bookable, and are also listed in service_addons below.
-- ---------------------------------------------------------------------------
insert into public.service_pricing (service_id, season, name, base_price, flat_rate) values
  ('driveway', 'winter', 'Driveway clearing', 45, false),
  ('walkway',  'winter', 'Walkway',           25, true),
  ('premium',  'winter', 'Priority Premium',  10, true)
on conflict (service_id) do update
  set season     = excluded.season,
      name       = excluded.name,
      base_price = excluded.base_price,
      flat_rate  = excluded.flat_rate;

-- ---------------------------------------------------------------------------
-- Stacking add-ons. Flat, never scaled by driveway size — mirrors ADDONS in
-- src/lib/data.ts and WALKWAY_ADDON_CENTS / PREMIUM_FLAT_CENTS on the Next.js
-- side. Priced here so the client cannot dictate an add-on's price.
-- ---------------------------------------------------------------------------
create table if not exists public.service_addons (
  addon_id text    primary key,
  season   text    not null,
  name     text    not null,
  price    integer not null check (price >= 0)   -- whole dollars
);

insert into public.service_addons (addon_id, season, name, price) values
  ('walkway', 'winter', 'Walkway',          25),
  ('premium', 'winter', 'Priority Premium', 10)
on conflict (addon_id) do update
  set season = excluded.season, name = excluded.name, price = excluded.price;

alter table public.service_addons enable row level security;
drop policy if exists service_addons_read on public.service_addons;
create policy service_addons_read on public.service_addons
  for select to anon, authenticated using (true);

-- Record which add-ons a request was booked with.
alter table public.requests
  add column if not exists addons text[] not null default '{}';

-- 'Snow blowing' is not a service we sell. Drop it only if nothing references it.
delete from public.service_pricing
 where service_id = 'snowblow'
   and not exists (select 1 from public.requests where service_id = 'snowblow');

insert into public.service_scope_price (service_id, scope, price) values
  ('driveway', 'single', 45),
  ('driveway', 'double', 55)
on conflict (service_id, scope) do update set price = excluded.price;

-- Anyone may read the scope price table (same as the rest of the price book).
alter table public.service_scope_price enable row level security;
drop policy if exists service_scope_price_read on public.service_scope_price;
create policy service_scope_price_read on public.service_scope_price
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- create_request() — same territory logic as 20260725130000, plus add-ons.
-- The base is resolved in three tiers so it matches priceFor() exactly:
--   1. an explicit (service_id, scope) price   e.g. driveway single/double
--   2. flat_rate services                      e.g. walkway, premium
--   3. base_price * scope multiplier           everything else (summer)
-- then every valid add-on's flat price is added on top — matching quoteFor().
--
-- Gains a p_addons argument, so the 9-arg version from the territory migration
-- is dropped first rather than left behind as an unpriced overload.
-- ---------------------------------------------------------------------------
drop function if exists public.create_request(text,text,text,text,text,numeric,numeric,text,text);

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
  v_fsa     text;
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

  -- Serviceability: derive the FSA and require coverage. Kept non-fatal when no
  -- postal is supplied so any legacy caller still works; when one IS supplied it
  -- must be an area we service.
  if p_postal_code is not null and length(trim(p_postal_code)) > 0 then
    v_fsa := upper(substr(regexp_replace(p_postal_code, '\s', '', 'g'), 1, 3));
    if not exists (select 1 from public.service_fsa where fsa = v_fsa) then
      raise exception 'OUT_OF_AREA: %', v_fsa using errcode = 'P0001';
    end if;
  end if;

  -- Tier 1: an explicit price for this service at this scope.
  select price into v_price
    from public.service_scope_price
   where service_id = p_service_id and scope = p_scope;

  if v_price is null then
    -- Tier 2/3: flat-rate service, or scale the base by the scope multiplier.
    v_price := case when v_flat then v_base else round(v_base * v_mult) end;
  end if;

  -- Add-ons: reject anything not in the book rather than silently pricing it
  -- at zero, then add every selected add-on's flat price on top.
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
    addons, price, season, status, contact, assigned_partner, assigned_company,
    area, payment_status, paid_amount
  ) values (
    v_id, p_address, p_postal_code, p_pin_x, p_pin_y, p_service_id, v_name,
    p_scope, v_addons, v_price, p_season, 'new', p_contact, null, null, p_area,
    'unpaid', null
  );

  return v_id;
end;
$$;

grant execute on function
  public.create_request(text,text,text,text,text[],text,numeric,numeric,text,text)
  to anon, authenticated;

-- Direct writes to `requests` stay revoked (20260725120000): create_request()
-- remains the only creation path, and it is now the only thing that can set
-- `addons` — so an add-on can never be recorded without being paid for.
revoke insert, update, delete on public.requests from anon, authenticated;

commit;
