-- ==============================================================================
-- Migration: Add deleted_at column to public.projects for Soft Delete (Trash)
-- Description: Supports enterprise soft deletion, recycle bin, and instant restore.
-- ==============================================================================

BEGIN;

-- 1. Add deleted_at column to mark deleted projects without destroying records
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Create index on deleted_at for high-performance query filtering (active vs trash)
CREATE INDEX IF NOT EXISTS idx_projects_deleted_at 
  ON public.projects (deleted_at);

-- 3. Ensure permissions for all roles
GRANT ALL ON TABLE public.projects TO anon, authenticated, service_role;

COMMIT;

