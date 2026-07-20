-- =====================================================
-- FIX RLS POLICIES FOR DELETION
-- Run this in Supabase SQL Editor (https://app.supabase.com)
-- =====================================================

-- Option 1: Disable RLS completely (for development/testing)
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE screenshot_evidence DISABLE ROW LEVEL SECURITY;

-- Option 2: OR add specific DELETE policies (for production)
-- DROP POLICY IF EXISTS "Enable delete for all users" ON submissions;
-- CREATE POLICY "Enable delete for all users" ON submissions
--   FOR DELETE USING (true);
--
-- DROP POLICY IF EXISTS "Enable delete for all users" ON screenshot_evidence;
-- CREATE POLICY "Enable delete for all users" ON screenshot_evidence
--   FOR DELETE USING (true);

-- Verify
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('submissions', 'screenshot_evidence');