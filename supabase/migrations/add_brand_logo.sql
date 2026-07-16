-- ============================================
-- RECTOVERSO ACTIVATION PARTNER
-- Migration: Brand Logo & Flexible URL Fields
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADD BRAND LOGO & FLEXIBLE URLS TO CAMPAIGNS
-- ============================================
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS form_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS assets_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS redirect_url TEXT;

-- ============================================
-- 2. CREATE STORAGE BUCKET FOR BRAND LOGOS
-- ============================================
-- Note: Create bucket manually in Supabase Dashboard > Storage
-- Bucket name: brand-logos
-- Make it Public: YES

-- Storage policies for brand-logos
DROP POLICY IF EXISTS "Allow public read brand-logos" ON storage.objects;
CREATE POLICY "Allow public read brand-logos" ON storage.objects
    FOR SELECT USING (bucket_id = 'brand-logos');

DROP POLICY IF EXISTS "Allow uploads brand-logos" ON storage.objects;
CREATE POLICY "Allow uploads brand-logos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'brand-logos'
        AND auth.role() IN ('authenticated', 'service_role', 'anon')
    );

DROP POLICY IF EXISTS "Allow updates brand-logos" ON storage.objects;
CREATE POLICY "Allow updates brand-logos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'brand-logos'
        AND auth.role() IN ('authenticated', 'service_role', 'anon')
    );

-- ============================================
-- 3. GRANT PERMISSIONS
-- ============================================
GRANT ALL ON campaigns TO anon;
GRANT ALL ON campaigns TO authenticated;
GRANT ALL ON campaigns TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Migration completed!' as status;

-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'campaigns'
AND column_name IN ('brand_logo_url', 'download_url', 'form_url', 'assets_url', 'redirect_url')
ORDER BY column_name;
