-- 0006_guest_bookings.sql
--
-- ⚠️ NOT YET APPLIED. This migration is committed for review but has not been
-- run against the live database. To apply: `supabase db push` (or paste into
-- the Supabase SQL editor), then regenerate src/types/database.types.ts
-- (`supabase gen types typescript`) and update createJob to write these
-- columns instead of packing them into `notes`.
--
-- Purpose: support account-free ("guest") bookings and first-class columns
-- for the snow package, replacing the current workaround where the package
-- and guest contact are appended to the job's notes text.

-- 1. A job no longer requires a registered homeowner. Guest jobs are created
--    server-side (service role) with contact details instead.
alter table public.jobs
  alter column homeowner_id drop not null;

-- 2. Guest contact details (used when homeowner_id is null; also handy as a
--    booking-time snapshot for registered users).
alter table public.jobs
  add column if not exists contact_name  text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

-- 3. Snow package as real columns (currently encoded in notes).
alter table public.jobs
  add column if not exists driveway_size text
    check (driveway_size in ('single', 'double')),
  add column if not exists walkway boolean not null default false,
  add column if not exists premium boolean not null default false;

-- 4. Liability-waiver acceptance timestamp (proof of agreement at booking).
alter table public.jobs
  add column if not exists agreed_terms_at timestamptz;

-- 5. Every job must be reachable: a registered homeowner OR a guest email.
alter table public.jobs
  add constraint jobs_owner_or_contact
  check (homeowner_id is not null or contact_email is not null);

-- RLS notes (no policy changes made here — review when applying):
--   * Guest jobs are inserted by the server action using the service-role
--     client, which bypasses RLS, so no anon INSERT policy is needed.
--   * The existing pro SELECT policy exposes 'posted' jobs to pros regardless
--     of homeowner_id, so guest jobs flow into the pro feed unchanged.
--   * Guests have no authenticated session, so job read-back happens through
--     signed links or email — do NOT add an anon SELECT policy.

comment on column public.jobs.contact_email is
  'Guest booking contact (required when homeowner_id is null).';
comment on column public.jobs.premium is
  'Priority Premium: flat-fee priority dispatch for this booking.';
