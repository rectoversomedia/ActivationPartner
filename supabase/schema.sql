-- =====================================================
-- ActivationPartner - Full Schema v2
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: campaigns
-- Campaign configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  fee_per_activation INTEGER DEFAULT 5000,
  brand_logo_url TEXT,

  -- Flexible URLs (JSON array)
  flexible_urls JSONB DEFAULT '[]'::jsonb,

  -- Fraud Detection Rules (JSON object)
  fraud_rules JSONB DEFAULT '{
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

  -- Allowed Regions
  allowed_regions JSONB DEFAULT '[]'::jsonb,

  -- Required Evidence (JSON array)
  required_evidence JSONB DEFAULT '[
    {"id": "download", "label": "Screenshot Download", "required": true},
    {"id": "register", "label": "Screenshot Registrasi", "required": true},
    {"id": "rating", "label": "Screenshot Rating/Review", "required": true}
  ]'::jsonb,

  -- Form Fields Configuration (JSON array)
  form_fields JSONB DEFAULT '[]'::jsonb,

  -- Settings
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_code ON campaigns(code);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active);

-- =====================================================
-- TABLE: sales
-- Sales personnel
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sales_active ON sales(is_active);

-- =====================================================
-- TABLE: pics
-- PIC (Partner In Charge) personnel
-- =====================================================
CREATE TABLE IF NOT EXISTS pics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_pics_active ON pics(is_active);

-- =====================================================
-- TABLE: submissions
-- Main table for tracking sales activations
-- =====================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_code VARCHAR(20) UNIQUE NOT NULL,

  -- Sales Info
  sales_id VARCHAR(50),
  sales_name VARCHAR(255),
  pic_id VARCHAR(50),
  pic_name VARCHAR(255),
  campaign_id VARCHAR(50),
  campaign_name VARCHAR(255),

  -- Customer Info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  customer_phone_masked VARCHAR(20),

  -- Device & Location
  device_info VARCHAR(255),
  device_fingerprint_hash VARCHAR(64),
  ip_address VARCHAR(50),
  gps_lat DECIMAL(10, 6),
  gps_lng DECIMAL(10, 6),

  -- Screenshots (marked as uploaded)
  screenshot_download BOOLEAN DEFAULT FALSE,
  screenshot_register BOOLEAN DEFAULT FALSE,
  screenshot_rating BOOLEAN DEFAULT FALSE,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',

  -- Fraud Detection
  fraud_flags JSONB DEFAULT '[]'::jsonb,
  fraud_score INTEGER DEFAULT 0,
  fraud_decision VARCHAR(20),
  fraud_reasons JSONB DEFAULT '[]'::jsonb,
  fraud_remarks TEXT,

  -- QC Notes
  qc_notes TEXT,

  -- Behavior Data
  behavior_data JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_sales_name ON submissions(sales_name);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_customer_phone ON submissions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_submissions_device_info ON submissions(device_info);
CREATE INDEX IF NOT EXISTS idx_submissions_campaign_id ON submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_ip ON submissions(ip_address);
CREATE INDEX IF NOT EXISTS idx_submissions_fraud_decision ON submissions(fraud_decision);

-- =====================================================
-- TABLE: screenshot_evidence
-- Store uploaded screenshot metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS screenshot_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50) NOT NULL,
  storage_url TEXT NOT NULL,
  image_hash VARCHAR(64),
  dhash VARCHAR(64),
  file_size INTEGER,
  aspect_ratio DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screenshot_submission ON screenshot_evidence(submission_id);

-- =====================================================
-- TABLE: device_fingerprints
-- Track device fingerprints
-- =====================================================
CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint_hash VARCHAR(64) UNIQUE NOT NULL,
  device_info VARCHAR(255),
  ip_addresses JSONB DEFAULT '[]'::jsonb,
  linked_phones JSONB DEFAULT '[]'::jsonb,
  submission_count INTEGER DEFAULT 0,
  user_agent TEXT,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_fingerprint_hash ON device_fingerprints(fingerprint_hash);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE pics ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshot_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_fingerprints ENABLE ROW LEVEL SECURITY;

-- Campaign policies
CREATE POLICY "Anyone can read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Anyone can insert campaigns" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update campaigns" ON campaigns FOR UPDATE USING (true);

-- Sales policies
CREATE POLICY "Anyone can read sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sales" ON sales FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sales" ON sales FOR DELETE USING (true);

-- PICs policies
CREATE POLICY "Anyone can read pics" ON pics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pics" ON pics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update pics" ON pics FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete pics" ON pics FOR DELETE USING (true);

-- Submissions policies
CREATE POLICY "Anyone can read submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update submissions" ON submissions FOR UPDATE USING (true);

-- Screenshot evidence policies
CREATE POLICY "Anyone can read screenshots" ON screenshot_evidence FOR SELECT USING (true);
CREATE POLICY "Anyone can insert screenshots" ON screenshot_evidence FOR INSERT WITH CHECK (true);

-- Device fingerprints policies
CREATE POLICY "Anyone can read fingerprints" ON device_fingerprints FOR SELECT USING (true);
CREATE POLICY "Anyone can insert fingerprints" ON device_fingerprints FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update fingerprints" ON device_fingerprints FOR UPDATE USING (true);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pics_updated_at ON pics;
CREATE TRIGGER update_pics_updated_at
  BEFORE UPDATE ON pics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_submissions_updated_at ON submissions;
CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- =====================================================
-- SEED DATA - Sample Campaign & Sales
-- =====================================================

-- Insert sample campaign
INSERT INTO campaigns (name, code, fee_per_activation, is_active)
VALUES ('FIFGO Campaign', 'FIFGO', 5000, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample sales
INSERT INTO sales (name, phone, is_active) VALUES
('Budi Santoso', '081234567890', true),
('Siti Rahayu', '081234567891', true),
('Joko Wijaya', '081234567892', true),
('Rina Permata', '081234567893', true),
('Andi Prasetyo', '081234567894', true)
ON CONFLICT DO NOTHING;

-- Insert sample PICs
INSERT INTO pics (name, phone, is_active) VALUES
('Dewi Lestari', '089876543210', true),
('Rudi Hermawan', '089876543211', true),
('Ani Wijayanti', '089876543212', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload screenshots" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Anyone can view screenshots" ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots');

CREATE POLICY "Anyone can upload logos" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-logos');

CREATE POLICY "Anyone can view logos" ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');
