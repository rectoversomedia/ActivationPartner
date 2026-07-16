-- =====================================================
-- ActivationPartner - Fraud Detection System v2
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- EXISTING TABLES (if not exists)
-- =====================================================

-- campaigns
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- sales
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- pics
CREATE TABLE IF NOT EXISTS pics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_code VARCHAR(20) UNIQUE NOT NULL,
  sales_id VARCHAR(50) NOT NULL,
  sales_name VARCHAR(255) NOT NULL,
  pic_id VARCHAR(50) NOT NULL,
  pic_name VARCHAR(255) NOT NULL,
  campaign_id VARCHAR(50) NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  customer_phone_masked VARCHAR(20),
  device_info VARCHAR(255),
  ip_address VARCHAR(50),
  gps_lat DECIMAL(10, 6),
  gps_lng DECIMAL(10, 6),
  screenshot_download BOOLEAN DEFAULT FALSE,
  screenshot_register BOOLEAN DEFAULT FALSE,
  screenshot_rating BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending',
  fraud_flags JSONB DEFAULT '[]',
  fraud_score INTEGER DEFAULT 0,
  fraud_decision VARCHAR(20) DEFAULT 'allow',
  fraud_reasons JSONB DEFAULT '[]',
  qc_notes TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- NEW: SCREENSHOT EVIDENCE TABLE (with fingerprinting)
-- =====================================================

CREATE TABLE IF NOT EXISTS screenshot_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50) NOT NULL,  -- 'download', 'register', 'rating', 'custom'
  storage_url TEXT,
  image_hash VARCHAR(64),  -- pHash for similarity detection
  dhash VARCHAR(64),  -- difference hash
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  aspect_ratio DECIMAL(5,4),
  exif_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NEW: FRAUD PATTERNS TABLE (for ML training)
-- =====================================================

CREATE TABLE IF NOT EXISTS fraud_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_type VARCHAR(50) NOT NULL,  -- 'device_farm', 'screenshot_fabrication', 'bot', 'velocity', 'location'
  pattern_hash TEXT,
  severity VARCHAR(20) DEFAULT 'medium',  -- 'low', 'medium', 'high', 'critical'
  pattern_data JSONB DEFAULT '{}',  -- stores the actual pattern (device fingerprints, etc)
  occurrences INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NEW: SUBMISSION BEHAVIOR DATA
-- =====================================================

CREATE TABLE IF NOT EXISTS submission_behavior (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  -- Timing data
  time_on_page_ms INTEGER,  -- Total time on form page
  time_to_first_input_ms INTEGER,
  time_between_fields JSONB DEFAULT '[]',  -- Array of ms between each field
  -- Typing patterns
  typing_speeds JSONB DEFAULT '[]',  -- chars per second per field
  typing_std_dev DECIMAL,
  -- Mouse patterns
  mouse_movements INTEGER DEFAULT 0,
  mouse_clicks INTEGER DEFAULT 0,
  -- Device signals
  screen_width INTEGER,
  screen_height INTEGER,
  color_depth INTEGER,
  timezone VARCHAR(50),
  language VARCHAR(10),
  platform VARCHAR(50),
  -- Bot indicators
  has_webgl BOOLEAN DEFAULT true,
  has_canvas BOOLEAN DEFAULT true,
  has_webgl_renderer VARCHAR(255),
  canvas_fingerprint VARCHAR(64),
  webgl_vendor VARCHAR(255),
  webgl_renderer VARCHAR(255),
  -- Session data
  session_id VARCHAR(64),
  referrer TEXT,
  utm_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NEW: DEVICE FINGERPRINT TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS device_fingerprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fingerprint_hash VARCHAR(64) NOT NULL,  -- Combined hash
  device_info VARCHAR(255),
  canvas_fingerprint VARCHAR(64),
  webgl_fingerprint VARCHAR(255),
  user_agent TEXT,
  screen_resolution VARCHAR(20),
  timezone VARCHAR(50),
  language VARCHAR(10),
  platform VARCHAR(50),
  ip_addresses JSONB DEFAULT '[]',  -- All IPs used by this device
  linked_phones JSONB DEFAULT '[]',  -- All phones associated
  submission_count INTEGER DEFAULT 1,
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_suspicious BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0
);

-- =====================================================
-- ADD COLUMNS TO EXISTING SUBMISSIONS (if not exists)
-- =====================================================

DO $$
BEGIN
  -- Submissions enhancements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'device_fingerprint_hash') THEN
    ALTER TABLE submissions ADD COLUMN device_fingerprint_hash VARCHAR(64);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'screenshot_hashes') THEN
    ALTER TABLE submissions ADD COLUMN screenshot_hashes JSONB DEFAULT '[]';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'evidence_metadata') THEN
    ALTER TABLE submissions ADD COLUMN evidence_metadata JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'behavior_data') THEN
    ALTER TABLE submissions ADD COLUMN behavior_data JSONB DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'fraud_score') THEN
    ALTER TABLE submissions ADD COLUMN fraud_score INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'fraud_decision') THEN
    ALTER TABLE submissions ADD COLUMN fraud_decision VARCHAR(20) DEFAULT 'allow';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'submissions' AND column_name = 'fraud_reasons') THEN
    ALTER TABLE submissions ADD COLUMN fraud_reasons JSONB DEFAULT '[]';
  END IF;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================

-- Screenshot indexes
CREATE INDEX IF NOT EXISTS idx_screenshot_submission ON screenshot_evidence(submission_id);
CREATE INDEX IF NOT EXISTS idx_screenshot_hash ON screenshot_evidence(image_hash);
CREATE INDEX IF NOT EXISTS idx_screenshot_dhash ON screenshot_evidence(dhash);

-- Fraud patterns indexes
CREATE INDEX IF NOT EXISTS idx_fraud_pattern_type ON fraud_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_fraud_pattern_hash ON fraud_patterns(pattern_hash);
CREATE INDEX IF NOT EXISTS idx_fraud_pattern_active ON fraud_patterns(is_active) WHERE is_active = true;

-- Behavior indexes
CREATE INDEX IF NOT EXISTS idx_behavior_submission ON submission_behavior(submission_id);

-- Device fingerprint indexes
CREATE INDEX IF NOT EXISTS idx_device_fingerprint_hash ON device_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_device_fingerprint_suspicious ON device_fingerprints(is_suspicious) WHERE is_suspicious = true;
CREATE INDEX IF NOT EXISTS idx_device_ip ON device_fingerprints USING GIN(ip_addresses);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_fraud_score ON submissions(fraud_score);
CREATE INDEX IF NOT EXISTS idx_submissions_fraud_decision ON submissions(fraud_decision);
CREATE INDEX IF NOT EXISTS idx_submissions_device_hash ON submissions(device_fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_submissions_ip ON submissions(ip_address);

-- =====================================================
-- SEED: Sample fraud patterns for detection
-- =====================================================

INSERT INTO fraud_patterns (pattern_type, severity, pattern_data) VALUES
-- Device farm patterns
('device_farm', 'high', '{"threshold_phones": 3, "threshold_time_hours": 24, "description": "Same device used for 3+ different phone numbers in 24h"}'),
('device_farm', 'high', '{"threshold_phones": 5, "threshold_time_hours": 72, "description": "Same device used for 5+ different phone numbers in 72h"}'),
-- Screenshot fabrication patterns
('screenshot_similarity', 'critical', '{"similarity_threshold": 0.9, "description": "Screenshot >90% similar to another submission"}'),
('screenshot_batch', 'high', '{"batch_size": 3, "time_window_ms": 5000, "description": "3+ screenshots created within 5 seconds"}'),
-- Bot patterns
('bot_typing_speed', 'medium', '{"min_cps": 20, "description": "Typing speed >20 chars/sec is bot-like"}'),
('bot_time_on_page', 'medium', '{"max_time_ms": 3000, "description": "Time on page <3 seconds is suspicious"}'),
-- Velocity patterns
('velocity_ip', 'high', '{"max_per_hour": 5, "description": "5+ submissions from same IP in 1 hour"}'),
('velocity_device', 'high', '{"max_per_day": 10, "description": "10+ submissions from same device in 1 day"}'),
('velocity_location', 'high', '{"max_same_location": 10, "radius_degrees": 0.001, "description": "10+ submissions from same GPS location"}')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTION: Update fraud score calculation
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_fraud_score(
  p_submission_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_reasons JSONB := '[]';
  v_decision VARCHAR(20) := 'allow';
BEGIN
  -- Count fraud flags (existing logic)
  SELECT
    COALESCE(SUM(
      CASE
        WHEN f.severity = 'critical' THEN 30
        WHEN f.severity = 'high' THEN 20
        WHEN f.severity = 'medium' THEN 10
        WHEN f.severity = 'low' THEN 5
        ELSE 0
      END
    ), 0)
  INTO v_score
  FROM submissions s,
       jsonb_array_elements(s.fraud_flags) WITH ORDINALITY arr(f, idx)
  WHERE s.id = p_submission_id;

  -- Add score for screenshot similarity (placeholder - done in app)
  -- This would be: SELECT COUNT(*) * 10 FROM screenshot_evidence WHERE image_hash IN (...)

  -- Add score for device farm (placeholder - done in app)
  -- This would be: SELECT COUNT(*) * 15 FROM submissions WHERE device_fingerprint_hash = ...

  -- Determine decision
  IF v_score >= 80 THEN
    v_decision := 'block';
  ELSIF v_score >= 60 THEN
    v_decision := 'flag';
  ELSIF v_score >= 30 THEN
    v_decision := 'review';
  ELSE
    v_decision := 'allow';
  END IF;

  -- Update submission
  UPDATE submissions
  SET fraud_score = v_score,
      fraud_decision = v_decision,
      updated_at = NOW()
  WHERE id = p_submission_id;

  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- =====================================================
-- VERIFY
-- =====================================================

SELECT 'Fraud Detection v2 Schema Complete!' as status;

SELECT
  'Tables: ' ||
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') ||
  ' | Patterns: ' ||
  (SELECT COUNT(*) FROM fraud_patterns) as schema_info;
