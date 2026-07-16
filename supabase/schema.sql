-- =====================================================
-- ActivationPartner - Simplified Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: submissions
-- Main table for tracking sales activations
-- =====================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_code VARCHAR(20) UNIQUE NOT NULL,

  -- Sales Info
  sales_id VARCHAR(50) NOT NULL,
  sales_name VARCHAR(255) NOT NULL,
  pic_id VARCHAR(50) NOT NULL,
  pic_name VARCHAR(255) NOT NULL,
  campaign_id VARCHAR(50) NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,

  -- Customer Info
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  customer_phone_masked VARCHAR(20),

  -- Device & Location
  device_info VARCHAR(255),
  gps_lat DECIMAL(10, 6),
  gps_lng DECIMAL(10, 6),

  -- Screenshots (marked as uploaded)
  screenshot_download BOOLEAN DEFAULT FALSE,
  screenshot_register BOOLEAN DEFAULT FALSE,
  screenshot_rating BOOLEAN DEFAULT FALSE,

  -- Status
  status VARCHAR(20) DEFAULT 'pending',

  -- Fraud Detection (JSON array)
  fraud_flags JSONB DEFAULT '[]'::jsonb,
  qc_notes TEXT,

  -- Metadata
  ip_address VARCHAR(50),
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

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read submissions
CREATE POLICY "Anyone can read submissions" ON submissions FOR SELECT USING (true);

-- Policy: Anyone can insert submissions
CREATE POLICY "Anyone can insert submissions" ON submissions FOR INSERT WITH CHECK (true);

-- Policy: Anyone can update submissions (for QC)
CREATE POLICY "Anyone can update submissions" ON submissions FOR UPDATE USING (true);

-- =====================================================
-- FUNCTION: Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON submissions TO anon;
GRANT ALL ON submissions TO authenticated;
GRANT ALL ON submissions TO service_role;
