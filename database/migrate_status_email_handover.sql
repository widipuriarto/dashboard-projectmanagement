-- ==============================================================================
-- Migration: Convert status_email_handover from BOOLEAN to TEXT ('OK' / 'NOK')
-- Description: Standardizes status_email_handover column to store string values
--              directly, aligning database schema 1:1 with frontend UI.
-- ==============================================================================

BEGIN;

-- 1. Alter column type with explicit data conversion
ALTER TABLE public.projects 
  ALTER COLUMN status_email_handover TYPE TEXT 
  USING (
    CASE 
      WHEN status_email_handover = TRUE THEN 'OK'
      WHEN status_email_handover = FALSE THEN 'NOK'
      ELSE NULL 
    END
  );

-- 2. Add check constraint to ensure only 'OK', 'NOK', or NULL can be stored
ALTER TABLE public.projects 
  DROP CONSTRAINT IF EXISTS chk_status_email_handover;

ALTER TABLE public.projects 
  ADD CONSTRAINT chk_status_email_handover 
  CHECK (status_email_handover IS NULL OR status_email_handover IN ('OK', 'NOK'));

-- 3. Grant table permissions
GRANT ALL ON TABLE public.projects TO anon, authenticated, service_role;

COMMIT;

