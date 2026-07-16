-- ============================================
-- RECTOVERSO ACTIVATION PARTNER
-- Complete Schema Update v2
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================
-- 2. SALES TABLE (Master Data)
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PICS TABLE (Master Data)
-- ============================================
CREATE TABLE IF NOT EXISTS pics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. SUBMISSIONS TABLE (Enhanced)
-- ============================================
-- Add columns for screenshot URLs if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'screenshot_download_url') THEN
        ALTER TABLE submissions
        ADD COLUMN screenshot_download_url TEXT,
        ADD COLUMN screenshot_register_url TEXT,
        ADD COLUMN screenshot_rating_url TEXT;
    END IF;
END $$;

-- Add campaign_id column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'campaign_id') THEN
        ALTER TABLE submissions ADD COLUMN campaign_id UUID;
    END IF;
END $$;

-- Add campaign_name column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'campaign_name') THEN
        ALTER TABLE submissions ADD COLUMN campaign_name VARCHAR(255);
    END IF;
END $$;

-- ============================================
-- 5. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_campaigns_code ON campaigns(code);
CREATE INDEX IF NOT EXISTS idx_sales_active ON sales(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pics_active ON pics(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_submissions_campaign ON submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_customer_phone ON submissions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_submissions_customer_email ON submissions(customer_email);
CREATE INDEX IF NOT EXISTS idx_submissions_customer_name ON submissions(customer_name);

-- ============================================
-- 6. SEED DATA
-- ============================================

-- Insert sample campaigns
INSERT INTO campaigns (name, code, fee_per_activation, fraud_rules, required_evidence, is_active)
VALUES
    ('FIFGO Campaign', 'FIFGO', 5000,
     '{"require_screenshot_download": true, "require_screenshot_register": true, "require_screenshot_rating": true, "require_gps": true, "check_duplicate_phone": true, "check_duplicate_name": true, "check_duplicate_email": true, "check_gps_location": false}',
     '["download", "register", "rating"]',
     true),
    ('Rectoverso Promo', 'RECTO', 3000,
     '{"require_screenshot_download": true, "require_screenshot_register": true, "require_screenshot_rating": false, "require_gps": false, "check_duplicate_phone": true, "check_duplicate_name": true, "check_duplicate_email": false, "check_gps_location": false}',
     '["download", "register"]',
     true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample sales
INSERT INTO sales (name, phone, is_active) VALUES
    ('Ahmad Fauzi', '081234567890', true),
    ('Budi Santoso', '081234567891', true),
    ('Citra Dewi', '081234567892', true),
    ('Dian Pratama', '081234567893', true),
    ('Eko Wijaya', '081234567894', true)
ON CONFLICT DO NOTHING;

-- Insert sample PICs
INSERT INTO pics (name, phone, is_active) VALUES
    ('Budi Santoso', '081298765432', true),
    ('Ani Wijaya', '081298765433', true),
    ('Dewi Lestari', '081298765434', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. STORAGE SETUP
-- ============================================
-- Go to Supabase Dashboard > Storage
-- 1. Create bucket named "screenshots"
-- 2. Set Public: YES

-- Storage policies
DROP POLICY IF EXISTS "Allow public read screenshots" ON storage.objects;
CREATE POLICY "Allow public read screenshots" ON storage.objects
    FOR SELECT USING (bucket_id = 'screenshots');

DROP POLICY IF EXISTS "Allow authenticated uploads screenshots" ON storage.objects;
CREATE POLICY "Allow authenticated uploads screenshots" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'screenshots'
        AND auth.role() IN ('authenticated', 'service_role', 'anon')
    );

DROP POLICY IF EXISTS "Allow authenticated updates screenshots" ON storage.objects;
CREATE POLICY "Allow authenticated updates screenshots" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'screenshots'
        AND auth.role() IN ('authenticated', 'service_role', 'anon')
    );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT * FROM campaigns;
-- SELECT * FROM sales;
-- SELECT * FROM pics;
