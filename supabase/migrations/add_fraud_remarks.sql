-- ============================================
-- RECTOVERSO ACTIVATION PARTNER
-- Migration: Add Fraud Remarks & Enhanced Fraud Rules
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add fraud_remarks column to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fraud_remarks TEXT;

-- 2. Add fraud_score, fraud_decision, fraud_reasons columns if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'fraud_score') THEN
        ALTER TABLE submissions ADD COLUMN fraud_score INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'fraud_decision') THEN
        ALTER TABLE submissions ADD COLUMN fraud_decision VARCHAR(20) DEFAULT 'allow';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'fraud_reasons') THEN
        ALTER TABLE submissions ADD COLUMN fraud_reasons TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'device_fingerprint_hash') THEN
        ALTER TABLE submissions ADD COLUMN device_fingerprint_hash VARCHAR(64);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'behavior_data') THEN
        ALTER TABLE submissions ADD COLUMN behavior_data JSONB DEFAULT '{}';
    END IF;
END $$;

-- 3. Create indexes for fraud-related columns
CREATE INDEX IF NOT EXISTS idx_submissions_fraud_score ON submissions(fraud_score);
CREATE INDEX IF NOT EXISTS idx_submissions_fraud_decision ON submissions(fraud_decision);
CREATE INDEX IF NOT EXISTS idx_submissions_fraud_remarks ON submissions(fraud_remarks) WHERE fraud_remarks IS NOT NULL;

-- 4. Create screenshot_evidence table for storing image metadata
CREATE TABLE IF NOT EXISTS screenshot_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL,
    storage_url TEXT,
    image_hash VARCHAR(64),
    dhash VARCHAR(64),
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screenshot_submission ON screenshot_evidence(submission_id);
CREATE INDEX IF NOT EXISTS idx_screenshot_hash ON screenshot_evidence(image_hash);

-- 5. Create device_fingerprints table for tracking
CREATE TABLE IF NOT EXISTS device_fingerprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fingerprint_hash VARCHAR(64) NOT NULL,
    device_info VARCHAR(255),
    ip_addresses JSONB DEFAULT '[]',
    linked_phones JSONB DEFAULT '[]',
    submission_count INTEGER DEFAULT 1,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_device_fingerprint_hash ON device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_suspicious ON device_fingerprints(is_suspicious) WHERE is_suspicious = true;

-- 6. Grant permissions
GRANT ALL ON submissions TO anon;
GRANT ALL ON submissions TO authenticated;
GRANT ALL ON submissions TO service_role;

GRANT ALL ON screenshot_evidence TO anon;
GRANT ALL ON screenshot_evidence TO authenticated;
GRANT ALL ON screenshot_evidence TO service_role;

GRANT ALL ON device_fingerprints TO anon;
GRANT ALL ON device_fingerprints TO authenticated;
GRANT ALL ON device_fingerprints TO service_role;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Migration completed successfully!' as status;

-- Check columns exist
SELECT
    'submissions columns: ' ||
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'submissions') as result;
