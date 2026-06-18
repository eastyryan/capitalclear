-- 0002_rls.sql — Row Level Security for Capital Clear.
-- Enables RLS on all 7 tables and defines policies. All policies target the
-- 'authenticated' role. Column references match 0001_init.sql exactly.

-- is_admin() helper --------------------------------------------------------
-- SECURITY DEFINER so it can read profiles.role without recursing through the
-- profiles RLS policies. search_path pinned to public to avoid hijacking.
create or replace function public.is_admin()
returns boolean
security definer
set search_path = public
language sql
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Enable RLS ---------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.pros       enable row level security;
alter table public.jobs       enable row level security;
alter table public.job_photos enable row level security;
alter table public.reviews    enable row level security;
alter table public.payments   enable row level security;
alter table public.ottawa_fsa enable row level security;

-- profiles -----------------------------------------------------------------
-- Any authenticated user may read profiles (e.g. to render a pro's name).
create policy profiles_select_authenticated
  on public.profiles
  for select
  to authenticated
  using (true);

-- A user may insert their own profile row (id must equal auth.uid()).
create policy profiles_insert_self
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- A user may update their own profile row.
create policy profiles_update_self
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Admin bypass (permissive: OR-ed with the policies above).
create policy profiles_admin_all
  on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- pros ---------------------------------------------------------------------
-- Anyone authenticated may browse pros.
create policy pros_select_authenticated
  on public.pros
  for select
  to authenticated
  using (true);

-- A pro may insert their own row.
create policy pros_insert_self
  on public.pros
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- A pro may update their own row.
create policy pros_update_self
  on public.pros
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admin bypass.
create policy pros_admin_all
  on public.pros
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- jobs ---------------------------------------------------------------------
-- Homeowner: full CRUD over their own jobs.
create policy jobs_homeowner_select
  on public.jobs
  for select
  to authenticated
  using (homeowner_id = auth.uid());

create policy jobs_homeowner_insert
  on public.jobs
  for insert
  to authenticated
  with check (
    homeowner_id = auth.uid()
    and public.is_ottawa_postal(postal_code)
  );

create policy jobs_homeowner_update
  on public.jobs
  for update
  to authenticated
  using (homeowner_id = auth.uid())
  with check (homeowner_id = auth.uid());

create policy jobs_homeowner_delete
  on public.jobs
  for delete
  to authenticated
  using (homeowner_id = auth.uid());

-- Pro: may read jobs assigned to them, or any 'posted' job whose service_type
-- is one they offer.
create policy jobs_pro_select
  on public.jobs
  for select
  to authenticated
  using (
    pro_id = auth.uid()
    or (
      status = 'posted'
      and service_type = any (
        select unnest(p.services)
        from public.pros p
        where p.user_id = auth.uid()
      )
    )
  );

-- Pro: may update jobs assigned to them (accept, en_route, in_progress, etc.).
create policy jobs_pro_update
  on public.jobs
  for update
  to authenticated
  using (pro_id = auth.uid())
  with check (pro_id = auth.uid());

-- Admin bypass.
create policy jobs_admin_all
  on public.jobs
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- job_photos ---------------------------------------------------------------
-- Select: the job's homeowner or assigned pro, or an admin.
create policy job_photos_select_participant
  on public.job_photos
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.jobs j
      where j.id = job_photos.job_id
        and (j.homeowner_id = auth.uid() or j.pro_id = auth.uid())
    )
  );

-- Insert: only the assigned pro may upload, and uploaded_by must be themselves.
create policy job_photos_insert_pro
  on public.job_photos
  for insert
  to authenticated
  with check (
    uploaded_by = auth.uid()
    and auth.uid() = (
      select j.pro_id
      from public.jobs j
      where j.id = job_photos.job_id
    )
  );

-- Admin bypass.
create policy job_photos_admin_all
  on public.job_photos
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- reviews ------------------------------------------------------------------
-- Reviews are public to authenticated users.
create policy reviews_select_authenticated
  on public.reviews
  for select
  to authenticated
  using (true);

-- Insert: only the homeowner of a completed job may review it.
create policy reviews_insert_homeowner
  on public.reviews
  for insert
  to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1
      from public.jobs j
      where j.id = reviews.job_id
        and j.homeowner_id = auth.uid()
        and j.status = 'completed'
    )
  );

-- Admin bypass.
create policy reviews_admin_all
  on public.reviews
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- payments -----------------------------------------------------------------
-- Select: participants of the job (homeowner or pro) or an admin.
-- No insert/update/delete policy — payments are written by the service role,
-- which bypasses RLS entirely.
create policy payments_select_participant
  on public.payments
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.jobs j
      where j.id = payments.job_id
        and (j.homeowner_id = auth.uid() or j.pro_id = auth.uid())
    )
  );

-- ottawa_fsa ---------------------------------------------------------------
-- Read-only reference table; readable by any authenticated user. Writes are
-- service-role only (seeded via migration), so no write policy is defined.
create policy ottawa_fsa_select_authenticated
  on public.ottawa_fsa
  for select
  to authenticated
  using (true);
