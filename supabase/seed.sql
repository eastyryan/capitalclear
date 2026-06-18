-- seed.sql — Best-effort demo data for Capital Clear.
--
-- IMPORTANT: This requires a database with ALL migrations applied
-- (0001 -> 0004). In particular it relies on:
--   * the handle_new_user() trigger (0003) to create public.profiles rows
--     automatically when we insert into auth.users;
--   * the ottawa_fsa allowlist (0004) so the jobs_ottawa_postal CHECK passes.
--
-- It writes directly to auth.users (which a normal client cannot do); run it
-- with the service role / as the postgres superuser, e.g. via `supabase db
-- reset` which applies migrations then this file. Everything is guarded with
-- DO blocks / ON CONFLICT so re-running is safe.
--
-- Demo password for every account: 'password123'.

-- pgcrypto provides crypt()/gen_salt() for hashing the demo passwords and
-- gen_random_uuid() for ids. (0001 already installs it into the extensions
-- schema; ensure it is reachable here as well.)
create extension if not exists pgcrypto with schema extensions;

-- ottawa_fsa is fully covered by migration 0004_seed_fsa.sql, so it is NOT
-- re-seeded here.

-- ---------------------------------------------------------------------------
-- Demo users.
-- We insert into auth.users with stable, deterministic UUIDs so the rest of
-- the seed can reference them without lookups. The on_auth_user_created
-- trigger turns each of these into a public.profiles row using the role /
-- full_name / preferred_language packed into raw_user_meta_data.
-- ---------------------------------------------------------------------------
do $$
declare
  v_admin       uuid := '00000000-0000-0000-0000-000000000001';
  v_home1       uuid := '00000000-0000-0000-0000-000000000011';
  v_home2       uuid := '00000000-0000-0000-0000-000000000012';
  v_pro1        uuid := '00000000-0000-0000-0000-000000000021';
  v_pro2        uuid := '00000000-0000-0000-0000-000000000022';
  v_pro3        uuid := '00000000-0000-0000-0000-000000000023';
  v_instance    uuid := '00000000-0000-0000-0000-000000000000';
  v_hashed      text := crypt('password123', gen_salt('bf'));
begin
  -- One row per demo account. raw_user_meta_data carries the fields
  -- handle_new_user() reads.
  insert into auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  values
    (v_instance, v_admin, 'authenticated', 'authenticated', 'admin@capitalclear.ca',
     v_hashed, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"admin","full_name":"Capital Clear Admin","preferred_language":"en"}'::jsonb,
     now(), now()),

    (v_instance, v_home1, 'authenticated', 'authenticated', 'sophie.tremblay@example.ca',
     v_hashed, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"homeowner","full_name":"Sophie Tremblay","preferred_language":"fr"}'::jsonb,
     now(), now()),

    (v_instance, v_home2, 'authenticated', 'authenticated', 'james.okafor@example.ca',
     v_hashed, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"homeowner","full_name":"James Okafor","preferred_language":"en"}'::jsonb,
     now(), now()),

    (v_instance, v_pro1, 'authenticated', 'authenticated', 'marc.belanger@example.ca',
     v_hashed, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"pro","full_name":"Marc Belanger","preferred_language":"fr"}'::jsonb,
     now(), now()),

    (v_instance, v_pro2, 'authenticated', 'authenticated', 'priya.nair@example.ca',
     v_hashed, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"pro","full_name":"Priya Nair","preferred_language":"en"}'::jsonb,
     now(), now()),

    (v_instance, v_pro3, 'authenticated', 'authenticated', 'liam.gallagher@example.ca',
     v_hashed, now(),
     '{"provider":"email","providers":["email"]}'::jsonb,
     '{"role":"pro","full_name":"Liam Gallagher","preferred_language":"en"}'::jsonb,
     now(), now())
  on conflict (id) do nothing;

  -- Some auth.users setups also require an identity row for email login. Guard
  -- it so the seed still succeeds if the identities shape differs.
  begin
    insert into auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    )
    values
      (v_admin::text, v_admin,
       jsonb_build_object('sub', v_admin::text, 'email', 'admin@capitalclear.ca'),
       'email', now(), now(), now()),
      (v_home1::text, v_home1,
       jsonb_build_object('sub', v_home1::text, 'email', 'sophie.tremblay@example.ca'),
       'email', now(), now(), now()),
      (v_home2::text, v_home2,
       jsonb_build_object('sub', v_home2::text, 'email', 'james.okafor@example.ca'),
       'email', now(), now(), now()),
      (v_pro1::text, v_pro1,
       jsonb_build_object('sub', v_pro1::text, 'email', 'marc.belanger@example.ca'),
       'email', now(), now(), now()),
      (v_pro2::text, v_pro2,
       jsonb_build_object('sub', v_pro2::text, 'email', 'priya.nair@example.ca'),
       'email', now(), now(), now()),
      (v_pro3::text, v_pro3,
       jsonb_build_object('sub', v_pro3::text, 'email', 'liam.gallagher@example.ca'),
       'email', now(), now(), now())
    on conflict do nothing;
  exception when others then
    raise notice 'Skipping auth.identities seed: %', sqlerrm;
  end;
end $$;

-- ---------------------------------------------------------------------------
-- Pro details.
-- The profiles rows already exist (via trigger). The pros rows, however, are
-- NOT auto-created, so we insert them here and mark them verified. Between the
-- three pros every service_type is covered:
--   pro1 -> snow_removal + seasonal_maintenance
--   pro2 -> lawn_mowing + seasonal_maintenance
--   pro3 -> snow_removal + lawn_mowing
-- ---------------------------------------------------------------------------
insert into public.pros (
  user_id, services, base_price_cents, service_radius_km, bio, city, verified
)
values
  ('00000000-0000-0000-0000-000000000021',
   array['snow_removal','seasonal_maintenance']::service_type[],
   8500, 20, 'Driveway and walkway snow clearing across the east end.', 'Orleans', true),
  ('00000000-0000-0000-0000-000000000022',
   array['lawn_mowing','seasonal_maintenance']::service_type[],
   6000, 15, 'Reliable lawn care and seasonal yard cleanups.', 'Nepean', true),
  ('00000000-0000-0000-0000-000000000023',
   array['snow_removal','lawn_mowing']::service_type[],
   7000, 25, 'Year-round property maintenance in Kanata and the west end.', 'Kanata', true)
on conflict (user_id) do update set
  services         = excluded.services,
  base_price_cents = excluded.base_price_cents,
  service_radius_km= excluded.service_radius_km,
  bio              = excluded.bio,
  city             = excluded.city,
  verified         = excluded.verified;

-- ---------------------------------------------------------------------------
-- Demo jobs across the status lifecycle.
-- All postal codes use FSAs present in ottawa_fsa so the jobs_ottawa_postal
-- CHECK passes. Stable ids let this be idempotent.
-- ---------------------------------------------------------------------------
insert into public.jobs (
  id, homeowner_id, pro_id, service_type, status,
  address, postal_code, scheduled_for, notes,
  quoted_price_cents, final_price_cents, payment_status, platform_fee_cents
)
values
  -- posted: no pro yet, awaiting bids.
  ('10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000011', null,
   'snow_removal', 'posted',
   '120 Holland Ave', 'K1Y 0X8', now() + interval '1 day',
   'Single driveway, please clear before 7am.',
   8500, null, 'none', null),

  -- accepted: pro assigned, payment authorized.
  ('10000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000023',
   'lawn_mowing', 'accepted',
   '45 Castlefrank Rd', 'K2L 1A2', now() + interval '2 days',
   'Front and back lawn, gate code 4421.',
   6000, null, 'authorized', 600),

  -- in_progress: pro currently on site.
  ('10000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000022',
   'lawn_mowing', 'in_progress',
   '300 Greenbank Rd', 'K2J 4H3', now(),
   'Watch for the sprinkler heads near the patio.',
   6500, null, 'authorized', 650),

  -- awaiting_approval: work done, homeowner to confirm.
  ('10000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000021',
   'seasonal_maintenance', 'awaiting_approval',
   '88 Centrepointe Dr', 'K2G 6B1', now() - interval '2 hours',
   'Fall cleanup and gutter clearing.',
   12000, 12000, 'authorized', 1200),

  -- completed: finished and paid out.
  ('10000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000021',
   'snow_removal', 'completed',
   '210 Jeanne d''Arc Blvd', 'K1C 4P9', now() - interval '5 days',
   'Big storm cleanup, did a great job.',
   9500, 9500, 'released', 950),

  -- cancelled: called off by homeowner.
  ('10000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000012', null,
   'snow_removal', 'cancelled',
   '15 Stittsville Main St', 'K2S 1A1', now() - interval '1 day',
   'No longer needed, snow melted.',
   8500, null, 'cancelled', null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- A review for the completed job. Inserting this fires recompute_pro_stats(),
-- which updates pro1's rating_avg and total_jobs_completed.
-- ---------------------------------------------------------------------------
insert into public.reviews (id, job_id, reviewer_id, pro_id, rating, comment)
values
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000021',
   5, 'Showed up early and cleared everything perfectly. Highly recommend.')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- A payment record for the completed job (service-role write; RLS bypassed).
-- ---------------------------------------------------------------------------
insert into public.payments (
  id, job_id, provider, intent_id, amount_cents, platform_fee_cents, status
)
values
  ('30000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000005',
   'stripe', 'pi_demo_completed_0001', 9500, 950, 'released')
on conflict (id) do nothing;
