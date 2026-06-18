-- 0005_storage.sql — Private storage bucket for job photos + RLS on objects.
-- Best-effort: Supabase's `storage` schema (buckets, objects, foldername())
-- already exists in any Supabase project. We only create our bucket and the
-- policies that gate access to it. All policy logic keys off the first path
-- segment of the object name, which we treat as the job id:
--
--     <jobId>/<before|after>-<uuid>.jpg
--
-- (storage.foldername(name))[1] returns that first folder (the jobId).

-- Bucket -------------------------------------------------------------------
-- Private (public = false): objects are never served anonymously; the app
-- issues short-lived signed URLs for reads and signed upload URLs for writes.
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', false)
on conflict (id) do nothing;

-- RLS on storage.objects ---------------------------------------------------
-- storage.objects already has RLS enabled by Supabase. We add policies scoped
-- to bucket_id = 'job-photos'. They are permissive (OR-ed with each other and
-- with any platform defaults), so we keep each one tight.

-- INSERT: only the assigned pro of the job may upload an object whose first
-- path folder is that job's id. The folder must resolve to a real job row
-- where pro_id = auth.uid().
drop policy if exists "job_photos_objects_insert_assigned_pro" on storage.objects;
create policy "job_photos_objects_insert_assigned_pro"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'job-photos'
    and exists (
      select 1
      from public.jobs j
      where j.id = ((storage.foldername(name))[1])::uuid
        and j.pro_id = auth.uid()
    )
  );

-- SELECT: job participants (homeowner or assigned pro) and admins may read.
-- Used by the app to mint signed read URLs (RLS is checked when the row is
-- read through the anon/authenticated client).
drop policy if exists "job_photos_objects_select_participant" on storage.objects;
create policy "job_photos_objects_select_participant"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'job-photos'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.jobs j
        where j.id = ((storage.foldername(name))[1])::uuid
          and (j.homeowner_id = auth.uid() or j.pro_id = auth.uid())
      )
    )
  );

-- Note: server-side signed-upload-URL creation and signed-read-URL minting in
-- the app go through the SSR (authenticated) client, so these policies apply.
-- The service-role admin client bypasses RLS entirely if ever needed.
