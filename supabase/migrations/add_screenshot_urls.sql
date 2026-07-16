-- ============================================
-- RECTOVERSO ACTIVATION PARTNER
-- Schema Update for Screenshot Upload
-- Run this in Supabase SQL Editor
-- ============================================

-- Add columns for screenshot URLs in submissions table
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS screenshot_download_url TEXT,
ADD COLUMN IF NOT EXISTS screenshot_register_url TEXT,
ADD COLUMN IF NOT EXISTS screenshot_rating_url TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_submissions_screenshot_urls
ON submissions(screenshot_download_url, screenshot_register_url, screenshot_rating_url);

-- ============================================
-- STORAGE SETUP (Run in Storage section)
-- ============================================
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create new bucket named "screenshots"
-- 3. Set Public bucket: YES
-- 4. Policy: Allow public read access
-- ============================================

-- Example storage policy (run in SQL Editor):
DROP POLICY IF EXISTS "Allow public read access to screenshots" ON storage.objects;
CREATE POLICY "Allow public read access to screenshots" ON storage.objects
  FOR SELECT USING (bucket_id = 'screenshots');

DROP POLICY IF EXISTS "Allow authenticated uploads to screenshots" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to screenshots" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'screenshots'
    AND auth.role() IN ('authenticated', 'service_role')
  );

DROP POLICY IF EXISTS "Allow authenticated updates to screenshots" ON storage.objects;
CREATE POLICY "Allow authenticated updates to screenshots" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'screenshots'
    AND auth.role() IN ('authenticated', 'service_role')
  );

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify columns were added:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'submissions' AND column_name LIKE '%screenshot%';
