-- ==============================================================================
-- Migration: Fix Row Level Security (RLS) Policies on projects Table
-- Description: Grants INSERT, SELECT, UPDATE, and DELETE policies to both 
--              'anon' and 'authenticated' roles so client operations succeed.
-- ==============================================================================

BEGIN;

-- 1. Ensure RLS is enabled on public.projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive or duplicate policies if any
DROP POLICY IF EXISTS "Allow anon and authenticated select" ON public.projects;
DROP POLICY IF EXISTS "Allow anon and authenticated insert" ON public.projects;
DROP POLICY IF EXISTS "Allow anon and authenticated update" ON public.projects;
DROP POLICY IF EXISTS "Allow anon and authenticated delete" ON public.projects;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Allow select for all" ON public.projects;
DROP POLICY IF EXISTS "Allow insert for all" ON public.projects;

-- 3. Create SELECT policy (allows viewing projects)
CREATE POLICY "Allow anon and authenticated select"
ON public.projects
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Create INSERT policy (allows saving new projects)
CREATE POLICY "Allow anon and authenticated insert"
ON public.projects
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Create UPDATE policy (for edit project feature)
CREATE POLICY "Allow anon and authenticated update"
ON public.projects
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 6. Create DELETE policy (for delete project feature)
CREATE POLICY "Allow anon and authenticated delete"
ON public.projects
FOR DELETE
TO anon, authenticated
USING (true);

-- 7. Grant standard schema and sequence privileges
GRANT ALL ON TABLE public.projects TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

COMMIT;

