-- 0001_init.sql — Capital Clear schema (enums, tables, functions, indexes).
-- RLS is enabled separately in 0002_rls.sql. Triggers live in 0003_triggers.sql.

-- Extensions ---------------------------------------------------------------
-- gen_random_uuid() ships with pgcrypto; on Supabase it is available by default,
-- but we ensure it explicitly so this migration is portable.
create extension if not exists pgcrypto with schema extensions;

-- Enums --------------------------------------------------------------------
create type user_role as enum ('homeowner', 'pro', 'admin');

create type service_type as enum ('snow_removal', 'lawn_mowing', 'seasonal_maintenance');

create type job_status as enum (
  'draft',
  'posted',
  'accepted',
  'en_route',
  'in_progress',
  'awaiting_approval',
  'completed',
  'cancelled'
);

create type photo_type as enum ('before', 'after');

create type payment_status as enum (
  'none',
  'authorized',
  'released',
  'cancelled',
  'refunded',
  'failed'
);

-- Ottawa FSA allowlist -----------------------------------------------------
-- Created before is_ottawa_postal() because the function reads from it.
create table public.ottawa_fsa (
  fsa text primary key,
  area_name text
);

-- is_ottawa_postal(text) ---------------------------------------------------
-- Normalizes a postal code (uppercase, strip whitespace), takes the first
-- three characters (the FSA / forward sortation area) and checks membership
-- in the ottawa_fsa allowlist. Returns false for null/short input.
-- STABLE: result depends only on the argument + table contents within a txn.
create or replace function public.is_ottawa_postal(p_postal text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.ottawa_fsa f
    where f.fsa = substr(upper(regexp_replace(coalesce(p_postal, ''), '\s', '', 'g')), 1, 3)
  );
$$;

-- profiles -----------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text,
  email text,
  phone text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'fr')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- pros ---------------------------------------------------------------------
create table public.pros (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  services service_type[] not null default '{}',
  base_price_cents bigint not null default 0,
  service_radius_km numeric default 15,
  bio text,
  city text default 'Ottawa',
  verified boolean not null default false,
  rating_avg numeric(2,1) default 0,
  total_jobs_completed int not null default 0,
  stripe_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- jobs ---------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  homeowner_id uuid not null references public.profiles(id),
  pro_id uuid references public.profiles(id),
  service_type service_type not null,
  status job_status not null default 'draft',
  address text,
  postal_code text not null,
  lat double precision,
  lng double precision,
  scheduled_for timestamptz,
  notes text,
  quoted_price_cents bigint,
  final_price_cents bigint,
  currency text not null default 'CAD' check (currency = 'CAD'),
  payment_status payment_status not null default 'none',
  payment_intent_id text,
  platform_fee_cents bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_ottawa_postal check (public.is_ottawa_postal(postal_code))
);

-- job_photos ---------------------------------------------------------------
create table public.job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  storage_path text not null,
  type photo_type not null,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- reviews ------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null unique references public.jobs(id),
  reviewer_id uuid not null references public.profiles(id),
  pro_id uuid not null references public.profiles(id),
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- payments -----------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id),
  provider text not null,
  intent_id text,
  amount_cents bigint not null,
  platform_fee_cents bigint,
  currency text not null default 'CAD' check (currency = 'CAD'),
  status payment_status not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes ------------------------------------------------------------------
create index jobs_status_idx on public.jobs (status);
create index jobs_homeowner_id_idx on public.jobs (homeowner_id);
create index jobs_pro_id_idx on public.jobs (pro_id);
create index jobs_scheduled_for_idx on public.jobs (scheduled_for);
create index jobs_status_service_scheduled_idx
  on public.jobs (status, service_type, scheduled_for);
-- Expression index mirroring the FSA derivation used by is_ottawa_postal.
create index jobs_fsa_idx
  on public.jobs (upper(substring(postal_code from 1 for 3)));

create index job_photos_job_id_idx on public.job_photos (job_id);
create index reviews_pro_id_idx on public.reviews (pro_id);
create index payments_job_id_idx on public.payments (job_id);
