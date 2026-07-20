-- =====================================================
-- FIX RLS POLICIES FOR DELETION
-- Run this in Supabase SQL Editor (https://app.supabase.com)
-- =====================================================

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Enable delete for all users" ON submissions;

-- Option 1: Disable RLS completely (for development/testing)
ALTER TABLE submissions DISABLE ROW LEVEL SECURITY;

-- Add permissive DELETE policy
CREATE POLICY "Enable delete for all users" ON submissions
  FOR DELETE USING (true);

-- Option 2: Also add permissive policies for INSERT/UPDATE
DROP POLICY IF EXISTS "Enable insert for all users" ON submissions;
CREATE POLICY "Enable insert for all users" ON submissions
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON submissions;
CREATE POLICY "Enable update for all users" ON submissions
  FOR UPDATE USING (true);

-- Verify
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'submissions';