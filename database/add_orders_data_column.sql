-- ==============================================================================
-- Migration: Add orders_data JSONB column to public.projects
-- Description: Supports hierarchical 1:N Order ID to SID tree structure.
-- ==============================================================================

BEGIN;

-- 1. Add orders_data column to store structured hierarchical Order & SID tree
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS orders_data JSONB DEFAULT NULL;

-- 2. Create GIN index on orders_data for fast JSON querying and filtering
CREATE INDEX IF NOT EXISTS idx_projects_orders_data 
  ON public.projects USING gin (orders_data);

-- 3. Ensure permissions for all roles
GRANT ALL ON TABLE public.projects TO anon, authenticated, service_role;

COMMIT;

