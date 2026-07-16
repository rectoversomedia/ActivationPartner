-- ============================================
-- RECTOVERSO ACTIVATION PARTNER
-- Complete Schema Setup
-- Run this IN ORDER in Supabase SQL Editor
-- ============================================

-- 1. CREATE CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    fee_per_activation DECIMAL(12, 2) DEFAULT 5000,
    fraud_rules JSONB DEFAULT '{}',
    allowed_regions JSONB DEFAULT '[]',
    required_evidence JSONB DEFAULT '["download", "register", "rating"]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE SALES TABLE
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE PICS TABLE
CREATE TABLE IF NOT EXISTS pics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADD COLUMNS TO SUBMISSIONS (if not exists)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS campaign_id UUID;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS campaign_name VARCHAR(255);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS screenshot_download_url TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS screenshot_register_url TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS screenshot_rating_url TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 5. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_code ON campaigns(code);
CREATE INDEX IF NOT EXISTS idx_sales_active ON sales(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pics_active ON pics(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_submissions_campaign ON submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_ip ON submissions(ip_address);
CREATE INDEX IF NOT EXISTS idx_submissions_device ON submissions(device_info);

-- 6. SEED DATA - CAMPAIGNS
INSERT INTO campaigns (name, code, fee_per_activation, fraud_rules, required_evidence, is_active)
VALUES (
    'FIFGO Campaign',
    'FIFGO',
    5000,
    '{
        "require_screenshot_download": true,
        "require_screenshot_register": true,
        "require_screenshot_rating": true,
        "require_gps": true,
        "check_duplicate_phone": true,
        "check_duplicate_name": true,
        "check_duplicate_email": true,
        "check_duplicate_ip": true,
        "max_submissions_per_ip_per_hour": 5,
        "check_duplicate_device": true,
        "max_submissions_per_device_per_day": 20,
        "check_duplicate_location": true,
        "max_same_location_per_day": 10,
        "check_submission_velocity": true,
        "min_seconds_between_submissions": 30
    }'::jsonb,
    '["download", "register", "rating"]'::jsonb,
    true
),
(
    'Rectoverso Promo',
    'RECTO',
    3000,
    '{
        "require_screenshot_download": true,
        "require_screenshot_register": true,
        "require_screenshot_rating": false,
        "require_gps": false,
        "check_duplicate_phone": true,
        "check_duplicate_name": true,
        "check_duplicate_email": false,
        "check_duplicate_ip": false,
        "max_submissions_per_ip_per_hour": 0,
        "check_duplicate_device": false,
        "max_submissions_per_device_per_day": 0,
        "check_duplicate_location": false,
        "max_same_location_per_day": 0,
        "check_submission_velocity": false,
        "min_seconds_between_submissions": 0
    }'::jsonb,
    '["download", "register"]'::jsonb,
    true
)
ON CONFLICT (code) DO NOTHING;

-- 7. SEED DATA - SALES
INSERT INTO sales (name, phone, is_active)
VALUES
    ('Ahmad Fauzi', '081234567890', true),
    ('Budi Santoso', '081234567891', true),
    ('Citra Dewi', '081234567892', true),
    ('Dian Pratama', '081234567893', true),
    ('Eko Wijaya', '081234567894', true)
ON CONFLICT DO NOTHING;

-- 8. SEED DATA - PICS
INSERT INTO pics (name, phone, is_active)
VALUES
    ('Budi Santoso', '081298765432', true),
    ('Ani Wijaya', '081298765433', true),
    ('Dewi Lestari', '081298765434', true)
ON CONFLICT DO NOTHING;

-- 9. STORAGE SETUP (Manual di Dashboard)
-- Buka Supabase Dashboard > Storage > New Bucket > "screenshots" > Public: YES

-- 10. STORAGE POLICIES
DROP POLICY IF EXISTS "Allow public read screenshots" ON storage.objects;
CREATE POLICY "Allow public read screenshots" ON storage.objects
    FOR SELECT USING (bucket_id = 'screenshots');

DROP POLICY IF EXISTS "Allow uploads screenshots" ON storage.objects;
CREATE POLICY "Allow uploads screenshots" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'screenshots');

DROP POLICY IF EXISTS "Allow updates screenshots" ON storage.objects;
CREATE POLICY "Allow updates screenshots" ON storage.objects
    FOR UPDATE USING (bucket_id = 'screenshots');

-- ============================================
-- VERIFICATION - Run queries below to check:
-- SELECT * FROM campaigns;
-- SELECT * FROM sales;
-- SELECT * FROM pics;
