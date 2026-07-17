-- Safe, additive migration for flock-level counts and age metadata.
-- Run in Supabase SQL editor before deploying the app changes.

DO $$
DECLARE
  has_flocks BOOLEAN;
  has_barn_size BOOLEAN;
  has_barn_age BOOLEAN;
  has_barn_arrival BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'flocks'
  ) INTO has_flocks;

  IF NOT has_flocks THEN
    RAISE NOTICE 'Table public.flocks does not exist. Migration skipped.';
    RETURN;
  END IF;

  ALTER TABLE public.flocks ADD COLUMN IF NOT EXISTS age_at_arrival_weeks INTEGER;
  ALTER TABLE public.flocks ADD COLUMN IF NOT EXISTS initial_count INTEGER;
  ALTER TABLE public.flocks ADD COLUMN IF NOT EXISTS current_count INTEGER;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'flocks_initial_count_nonneg'
  ) THEN
    ALTER TABLE public.flocks
      ADD CONSTRAINT flocks_initial_count_nonneg
      CHECK (initial_count IS NULL OR initial_count >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'flocks_current_count_nonneg'
  ) THEN
    ALTER TABLE public.flocks
      ADD CONSTRAINT flocks_current_count_nonneg
      CHECK (current_count IS NULL OR current_count >= 0);
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'barns' AND column_name = 'flock_size'
  ) INTO has_barn_size;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'barns' AND column_name = 'flock_age_at_arrival_weeks'
  ) INTO has_barn_age;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'barns' AND column_name = 'flock_arrival_date'
  ) INTO has_barn_arrival;

  IF has_barn_size THEN
    EXECUTE '
      UPDATE public.flocks f
      SET
        initial_count = COALESCE(f.initial_count, b.flock_size),
        current_count = COALESCE(f.current_count, f.initial_count, b.flock_size)
      FROM public.barns b
      WHERE b.current_flock_id = f.id
    ';

    EXECUTE '
      UPDATE public.flocks f
      SET
        initial_count = COALESCE(f.initial_count, b.flock_size),
        current_count = COALESCE(f.current_count, f.initial_count, b.flock_size)
      FROM public.barns b
      WHERE b.id = f.barn_id
    ';
  END IF;

  IF has_barn_age THEN
    EXECUTE '
      UPDATE public.flocks f
      SET age_at_arrival_weeks = COALESCE(f.age_at_arrival_weeks, b.flock_age_at_arrival_weeks)
      FROM public.barns b
      WHERE b.current_flock_id = f.id
    ';

    EXECUTE '
      UPDATE public.flocks f
      SET age_at_arrival_weeks = COALESCE(f.age_at_arrival_weeks, b.flock_age_at_arrival_weeks)
      FROM public.barns b
      WHERE b.id = f.barn_id
    ';
  END IF;

  IF has_barn_arrival THEN
    EXECUTE '
      UPDATE public.flocks f
      SET arrival_date = COALESCE(f.arrival_date, b.flock_arrival_date)
      FROM public.barns b
      WHERE b.current_flock_id = f.id
    ';

    EXECUTE '
      UPDATE public.flocks f
      SET arrival_date = COALESCE(f.arrival_date, b.flock_arrival_date)
      FROM public.barns b
      WHERE b.id = f.barn_id
    ';
  END IF;

  UPDATE public.flocks
  SET current_count = initial_count
  WHERE current_count IS NULL AND initial_count IS NOT NULL;
END $$;
