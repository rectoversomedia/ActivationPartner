-- =====================================================
-- Migration: Add missing columns to submissions table
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/bsiuucvjhnbdblmvrqgf/sql
-- =====================================================

-- Add missing columns to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fraud_score INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fraud_decision VARCHAR(20);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fraud_reasons JSONB DEFAULT '[]'::jsonb;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fraud_remarks TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS device_fingerprint_hash VARCHAR(64);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS behavior_data JSONB DEFAULT '{}'::jsonb;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_submissions_fraud_score ON submissions(fraud_score);
CREATE INDEX IF NOT EXISTS idx_submissions_fraud_decision ON submissions(fraud_decision);

-- Grant permissions
GRANT ALL ON submissions TO anon;
GRANT ALL ON submissions TO authenticated;
GRANT ALL ON submissions TO service_role;

-- Update existing submissions with sample fraud scores based on status
UPDATE submissions SET fraud_score =
  CASE
    WHEN status = 'valid' THEN floor(random() * 20 + 5)::int
    WHEN status = 'pending' THEN floor(random() * 30 + 20)::int
    WHEN status = 'invalid' THEN floor(random() * 30 + 50)::int
    WHEN status = 'fraud' THEN floor(random() * 20 + 80)::int
    ELSE 0
  END
WHERE fraud_score = 0 OR fraud_score IS NULL;

UPDATE submissions SET fraud_decision =
  CASE
    WHEN fraud_score >= 75 THEN 'block'
    WHEN fraud_score >= 50 THEN 'flag'
    WHEN fraud_score >= 25 THEN 'review'
    ELSE 'allow'
  END
WHERE fraud_decision IS NULL;

-- Add RLS policies if not exists
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read submissions" ON submissions;
CREATE POLICY "Anyone can read submissions" ON submissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert submissions" ON submissions;
CREATE POLICY "Anyone can insert submissions" ON submissions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update submissions" ON submissions;
CREATE POLICY "Anyone can update submissions" ON submissions FOR UPDATE USING (true);
