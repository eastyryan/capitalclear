-- 0003_triggers.sql — Trigger functions and triggers for Capital Clear.
-- Column references match 0001_init.sql exactly.

-- handle_new_user() --------------------------------------------------------
-- Fires after a row is inserted into auth.users. Creates the matching public
-- profile from the user's raw_user_meta_data. SECURITY DEFINER so it can write
-- to public.profiles regardless of the inserting role / RLS.
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, role, full_name, email, preferred_language)
  values (
    new.id,
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'homeowner'
    ),
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'preferred_language', 'en')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- touch_updated_at() -------------------------------------------------------
-- Generic BEFORE UPDATE trigger that bumps updated_at to now().
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_updated_at();

drop trigger if exists touch_pros_updated_at on public.pros;
create trigger touch_pros_updated_at
  before update on public.pros
  for each row
  execute function public.touch_updated_at();

drop trigger if exists touch_jobs_updated_at on public.jobs;
create trigger touch_jobs_updated_at
  before update on public.jobs
  for each row
  execute function public.touch_updated_at();

-- recompute_pro_stats() ----------------------------------------------------
-- Fires after a review is inserted. Recomputes the affected pro's average
-- rating (across all their reviews) and their completed-job count.
-- SECURITY DEFINER so it can update public.pros under RLS.
create or replace function public.recompute_pro_stats()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  update public.pros p
  set
    rating_avg = coalesce((
      select avg(r.rating)::numeric(2,1)
      from public.reviews r
      where r.pro_id = new.pro_id
    ), 0),
    total_jobs_completed = (
      select count(*)
      from public.jobs j
      where j.pro_id = new.pro_id
        and j.status = 'completed'
    )
  where p.user_id = new.pro_id;

  return new;
end;
$$;

drop trigger if exists on_review_created on public.reviews;
create trigger on_review_created
  after insert on public.reviews
  for each row
  execute function public.recompute_pro_stats();
