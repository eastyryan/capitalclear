-- 0004_seed_fsa.sql — Ottawa FSA allowlist.
-- Forward Sortation Areas (first 3 chars of a postal code) that Capital Clear
-- serves. is_ottawa_postal() and the jobs_ottawa_postal CHECK constraint both
-- read from this table, so it must be populated for jobs to be insertable.
-- area_name is drawn from {Ottawa, Kanata, Barrhaven, Orleans, Nepean,
-- Gloucester, Stittsville}. ON CONFLICT DO NOTHING keeps this idempotent.

insert into public.ottawa_fsa (fsa, area_name) values
  ('K1A', 'Ottawa'),       -- Government of Canada
  ('K1B', 'Gloucester'),   -- Blackburn Hamlet / Orleans area
  ('K1C', 'Orleans'),
  ('K1G', 'Gloucester'),
  ('K1H', 'Ottawa'),       -- Alta Vista
  ('K1J', 'Gloucester'),
  ('K1K', 'Ottawa'),       -- Vanier / Manor Park
  ('K1L', 'Ottawa'),       -- Rockcliffe / Overbrook
  ('K1M', 'Ottawa'),       -- Rockcliffe Park
  ('K1N', 'Ottawa'),       -- Lowertown / Byward Market
  ('K1P', 'Ottawa'),       -- Downtown core
  ('K1R', 'Ottawa'),       -- Centretown West
  ('K1S', 'Ottawa'),       -- Old Ottawa South / Glebe
  ('K1T', 'Gloucester'),
  ('K1V', 'Ottawa'),       -- Riverside / Hunt Club
  ('K1W', 'Orleans'),
  ('K1X', 'Gloucester'),
  ('K1Y', 'Ottawa'),       -- Hintonburg / Wellington West
  ('K1Z', 'Ottawa'),       -- Westboro
  ('K2A', 'Ottawa'),       -- Highland Park / McKellar
  ('K2B', 'Nepean'),       -- Britannia / Bayshore
  ('K2C', 'Nepean'),       -- City View / Carleton Heights
  ('K2E', 'Nepean'),
  ('K2G', 'Nepean'),       -- Tanglewood / Merivale
  ('K2H', 'Nepean'),       -- Bells Corners
  ('K2J', 'Barrhaven'),
  ('K2K', 'Kanata'),       -- Kanata North / Morgan's Grant
  ('K2L', 'Kanata'),       -- Beaverbrook
  ('K2M', 'Kanata'),       -- Bridlewood
  ('K2P', 'Ottawa'),       -- Centretown
  ('K2R', 'Nepean'),
  ('K2S', 'Stittsville'),
  ('K2T', 'Kanata'),
  ('K2V', 'Kanata'),
  ('K2W', 'Kanata'),
  ('K4A', 'Orleans'),      -- Fallingbrook / Avalon
  ('K4B', 'Gloucester'),   -- Navan area
  ('K4C', 'Gloucester'),   -- Cumberland area
  ('K0A', 'Ottawa'),       -- Rural west / Dunrobin
  ('K4M', 'Ottawa'),       -- Manotick
  ('K4P', 'Ottawa'),       -- Greely
  ('K4R', 'Ottawa')        -- Vars / rural east
on conflict (fsa) do nothing;
