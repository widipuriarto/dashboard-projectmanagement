-- ==============================================================================
-- Migration: Add Generated Column for waktu_penyelesaian_bast
-- Description: Computes duration in days between tanggal_close_dr and tanggal_request_dr
--              guaranteeing zero data inconsistency at PostgreSQL engine level.
-- ==============================================================================

BEGIN;

-- 1. Drop existing static/calculated column if it exists
ALTER TABLE public.projects 
  DROP COLUMN IF EXISTS waktu_penyelesaian_bast;

-- 2. Add waktu_penyelesaian_bast as a GENERATED ALWAYS STORED column
-- Note: Date subtraction in PostgreSQL (date - date) naturally returns an integer representing days.
ALTER TABLE public.projects 
  ADD COLUMN waktu_penyelesaian_bast INT 
  GENERATED ALWAYS AS (
    CASE 
      WHEN tanggal_request_dr IS NOT NULL AND tanggal_close_dr IS NOT NULL 
      THEN (tanggal_close_dr - tanggal_request_dr)
      ELSE NULL 
    END
  ) STORED;

-- 3. Grant access permissions to Supabase service roles
GRANT ALL ON TABLE public.projects TO anon, authenticated, service_role;

COMMIT;

