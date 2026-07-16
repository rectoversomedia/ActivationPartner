-- =====================================================
-- ActivationPartner - Ultra Safe Schema
-- Run once only!
-- =====================================================

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  fee_per_activation INTEGER DEFAULT 5000,
  fraud_rules JSONB DEFAULT '{}',
  allowed_regions JSONB DEFAULT '[]',
  required_evidence JSONB DEFAULT '[]',
  form_fields JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add column to submissions if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'fraud_flags') THEN
    ALTER TABLE submissions ADD COLUMN fraud_flags JSONB DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'qc_notes') THEN
    ALTER TABLE submissions ADD COLUMN qc_notes TEXT;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_sales_name ON submissions(sales_name);
CREATE INDEX IF NOT EXISTS idx_submissions_campaign_id ON submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_customer_phone ON submissions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);

-- SEED DATA - Skip if exists
INSERT INTO campaigns (name, code, fee_per_activation, fraud_rules, required_evidence, form_fields, is_active)
SELECT 'FIFGO Campaign', 'FIFGO', 5000,
 '{"check_duplicate_phone":true,"check_duplicate_name":true,"check_duplicate_email":true,"check_duplicate_ip":true,"max_submissions_per_ip_per_hour":5,"check_duplicate_device":true,"max_submissions_per_device_per_day":20,"check_duplicate_location":true,"max_same_location_per_day":10,"check_submission_velocity":true,"min_seconds_between_submissions":30,"require_gps":true,"require_screenshot_download":true,"require_screenshot_register":true,"require_screenshot_rating":true}',
 '[{"id":"download","label":"Screenshot Download","required":true},{"id":"register","label":"Screenshot Registrasi","required":true},{"id":"rating","label":"Screenshot Rating/Review","required":true}]',
 '[{"id":"sales","name":"sales_id","label":"Sales","type":"select","required":true,"source":"sales","placeholder":"Pilih Sales"},{"id":"pic","name":"pic_id","label":"PIC","type":"select","required":true,"source":"pics","placeholder":"Pilih PIC"},{"id":"customer_name","name":"customer_name","label":"Nama Customer","type":"text","required":true,"placeholder":"Nama lengkap"},{"id":"customer_email","name":"customer_email","label":"Email Customer","type":"email","required":false,"placeholder":"email@domain.com"},{"id":"customer_phone","name":"customer_phone","label":"No. Telepon","type":"tel","required":true,"placeholder":"08xxxxxxxxxx"}]',
 true
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE code = 'FIFGO');

INSERT INTO sales (name, phone, is_active)
SELECT 'Budi Santoso', '081234567890', true
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE name = 'Budi Santoso');

INSERT INTO sales (name, phone, is_active)
SELECT 'Siti Rahayu', '081234567891', true
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE name = 'Siti Rahayu');

INSERT INTO sales (name, phone, is_active)
SELECT 'Ahmad Fauzi', '081234567892', true
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE name = 'Ahmad Fauzi');

INSERT INTO sales (name, phone, is_active)
SELECT 'Dewi Lestari', '081234567893', true
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE name = 'Dewi Lestari');

INSERT INTO sales (name, phone, is_active)
SELECT 'Rudi Hermawan', '081234567894', true
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE name = 'Rudi Hermawan');

INSERT INTO pics (name, phone, is_active)
SELECT 'Hendra Wijaya', '087654321098', true
WHERE NOT EXISTS (SELECT 1 FROM pics WHERE name = 'Hendra Wijaya');

INSERT INTO pics (name, phone, is_active)
SELECT 'Maya Putri', '087654321099', true
WHERE NOT EXISTS (SELECT 1 FROM pics WHERE name = 'Maya Putri');

INSERT INTO pics (name, phone, is_active)
SELECT 'Fajar Nugroho', '087654321100', true
WHERE NOT EXISTS (SELECT 1 FROM pics WHERE name = 'Fajar Nugroho');

-- Final check
SELECT
  'Setup Complete!' as message,
  (SELECT COUNT(*) FROM campaigns) as campaigns_count,
  (SELECT COUNT(*) FROM sales) as sales_count,
  (SELECT COUNT(*) FROM pics) as pics_count;
