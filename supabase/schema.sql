-- ============================================
-- RECTOVERSO ACTIVATION MANAGEMENT SYSTEM
-- Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_status AS ENUM ('invited', 'active', 'suspended', 'inactive');
CREATE TYPE campaign_status AS ENUM ('draft', 'upcoming', 'active', 'paused', 'completed', 'archived');
CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'under_automated_check', 'pending_qc', 'need_revision', 'resubmitted', 'valid', 'non_valid', 'suspected_fraud', 'confirmed_fraud', 'duplicate', 'cancelled', 'included_in_batch', 'paid');
CREATE TYPE qc_decision AS ENUM ('valid', 'non_valid', 'need_revision', 'escalate_fraud', 'duplicate');
CREATE TYPE payment_batch_status AS ENUM ('draft', 'under_review', 'approved', 'processing', 'paid', 'partially_paid', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed');
CREATE TYPE fraud_risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE device_os AS ENUM ('android', 'ios');

-- ============================================
-- ORGANIZATIONS
-- ============================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFILES (Users)
-- ============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    city VARCHAR(100),
    province VARCHAR(100),
    address TEXT,
    national_id VARCHAR(50),
    profile_photo_url TEXT,
    organization_id UUID REFERENCES organizations(id),
    status user_status DEFAULT 'invited',
    last_active_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROLES
-- ============================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predefined roles
INSERT INTO roles (name, display_name, description, permissions) VALUES
('super_admin', 'Super Admin', 'Full system access', '["*"]'),
('campaign_manager', 'Campaign Manager', 'Manage campaigns and teams', '["campaigns:read", "campaigns:write", "users:read", "users:write", "submissions:read", "qc:write", "payments:write", "reports:read", "audit:read"]'),
('pic', 'PIC (Partner In Charge)', 'Manage assigned partners', '["partners:read", "partners:write", "submissions:read", "qc:write", "reports:read"]'),
('qc_reviewer', 'Quality Control', 'Review submissions', '["submissions:read", "qc:write"]'),
('partner', 'Activation Partner', 'Submit activations', '["submissions:read", "submissions:write", "earnings:read", "payments:read", "profile:write"]');

-- ============================================
-- USER ROLES
-- ============================================

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role_id, organization_id)
);

-- ============================================
-- CAMPAIGNS
-- ============================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    client_name VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    status campaign_status DEFAULT 'draft',
    fee_per_activation DECIMAL(12, 2) DEFAULT 0,
    payment_frequency VARCHAR(50) DEFAULT 'weekly',
    max_submissions_per_day INT,
    operating_hours JSONB,
    target_activations INT,
    required_evidence JSONB DEFAULT '[]',
    fraud_rules JSONB DEFAULT '{}',
    resubmission_policy JSONB DEFAULT '{"allowed": true, "max_attempts": 3}',
    qc_sla_hours INT DEFAULT 48,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGN MEMBERS
-- ============================================

CREATE TABLE campaign_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, user_id)
);

-- ============================================
-- PIC-PARTNER ASSIGNMENTS
-- ============================================

CREATE TABLE pic_partner_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pic_user_id UUID NOT NULL REFERENCES profiles(id),
    partner_user_id UUID NOT NULL REFERENCES profiles(id),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pic_user_id, partner_user_id, campaign_id)
);

-- ============================================
-- CAMPAIGN FORM FIELDS
-- ============================================

CREATE TABLE campaign_form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    label VARCHAR(255) NOT NULL,
    placeholder VARCHAR(255),
    required BOOLEAN DEFAULT false,
    options JSONB,
    validation JSONB,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGN SOPS
-- ============================================

CREATE TABLE campaign_sops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SOP ACCEPTANCES
-- ============================================

CREATE TABLE sop_acceptances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sop_id UUID NOT NULL REFERENCES campaign_sops(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    UNIQUE(sop_id, user_id)
);

-- ============================================
-- ACTIVATION SUBMISSIONS
-- ============================================

CREATE TABLE activation_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_code VARCHAR(50) UNIQUE NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    partner_id UUID NOT NULL REFERENCES profiles(id),

    -- User/Customer Info
    customer_name VARCHAR(100),
    customer_phone_normalized VARCHAR(20),
    customer_phone_masked VARCHAR(20),
    customer_reference VARCHAR(100),

    -- Activation Details
    activation_date DATE NOT NULL,
    activation_time TIME,
    activation_city VARCHAR(100),
    activation_location VARCHAR(255),
    device_os device_os,
    device_model VARCHAR(100),

    -- FIFGO Specific
    fifgo_downloaded BOOLEAN,
    fifgo_registered BOOLEAN,
    user_tried_app BOOLEAN,
    rating_submitted BOOLEAN,
    rating_value INT CHECK (rating_value >= 1 AND rating_value <= 5),
    review_submitted BOOLEAN,
    review_text TEXT,

    -- Additional
    additional_notes TEXT,

    -- Declaration
    declaration_accepted BOOLEAN DEFAULT false,
    declaration_timestamp TIMESTAMPTZ,
    declaration_ip INET,
    declaration_user_agent TEXT,
    sop_version VARCHAR(20),

    -- Submission Metadata
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    client_ip INET,
    client_user_agent TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Status
    status submission_status DEFAULT 'submitted',
    version INT DEFAULT 1,
    parent_submission_id UUID REFERENCES activation_submissions(id),

    -- QC & Fraud
    fraud_risk_score INT DEFAULT 0,
    fraud_risk_level fraud_risk_level DEFAULT 'low',
    qc_reviewed_by UUID REFERENCES profiles(id),
    qc_reviewed_at TIMESTAMPTZ,
    rejection_reason_code VARCHAR(100),
    rejection_reason_visible TEXT,
    internal_qc_notes TEXT,

    -- Payment
    eligible_for_payment BOOLEAN DEFAULT false,
    payment_amount DECIMAL(12, 2) DEFAULT 0,
    payment_batch_item_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBMISSION EVIDENCE
-- ============================================

CREATE TABLE submission_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES activation_submissions(id) ON DELETE CASCADE,
    evidence_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size INT,
    mime_type VARCHAR(100),
    file_hash_sha256 VARCHAR(64),
    perceptual_hash VARCHAR(64),
    storage_bucket VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBMISSION VERSIONS (Revision History)
-- ============================================

CREATE TABLE submission_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES activation_submissions(id) ON DELETE CASCADE,
    version INT NOT NULL,
    changes JSONB NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QC REVIEWS
-- ============================================

CREATE TABLE qc_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES activation_submissions(id),
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    decision qc_decision NOT NULL,
    reason_code VARCHAR(100),
    reason_visible TEXT,
    internal_notes TEXT,
    evidence_viewed JSONB DEFAULT '[]',
    previous_status submission_status,
    new_status submission_status,
    is_override BOOLEAN DEFAULT false,
    override_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QC REASON CODES
-- ============================================

CREATE TABLE qc_reason_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    label_id VARCHAR(255),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predefined reason codes
INSERT INTO qc_reason_codes (code, label, label_id, category) VALUES
('incomplete_evidence', 'Incomplete Evidence', 'Bukti tidak lengkap', 'evidence'),
('blurry_evidence', 'Blurry or Unreadable Evidence', 'Bukti buram/tidak jelas', 'evidence'),
('incorrect_evidence', 'Incorrect Evidence', 'Bukti salah', 'evidence'),
('registration_incomplete', 'Registration Not Completed', 'Registrasi belum selesai', 'activation'),
('app_usage_not_demonstrated', 'App Usage Not Demonstrated', 'Penggunaan app tidak ditunjukkan', 'activation'),
('rating_not_completed', 'Rating/Review Not Completed', 'Rating/review belum selesai', 'activation'),
('customer_data_incomplete', 'Customer Data Incomplete', 'Data pelanggan tidak lengkap', 'data'),
('duplicate_phone', 'Duplicate Phone Number', 'Nomor telepon duplikat', 'duplicate'),
('duplicate_evidence', 'Duplicate Evidence', 'Bukti duplikat', 'duplicate'),
('duplicate_customer', 'Duplicate Customer', 'Pelanggan duplikat', 'duplicate'),
('outside_campaign_period', 'Outside Campaign Period', 'Di luar periode kampanye', 'timing'),
('sop_violation', 'Activity Does Not Follow SOP', 'Aktivitas tidak sesuai SOP', 'sop'),
('manipulated_evidence', 'Manipulated Evidence', 'Bukti dimanipulasi', 'fraud'),
('suspicious_pattern', 'Suspicious Submission Pattern', 'Pola submissi mencurigakan', 'fraud'),
('fraud_indication', 'Fraud Indication', 'Indikasi kecurangan', 'fraud'),
('other', 'Other', 'Lainnya', 'other');

-- ============================================
-- FRAUD RULES
-- ============================================

CREATE TABLE fraud_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id),
    rule_key VARCHAR(100) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    risk_weight INT DEFAULT 0,
    threshold JSONB,
    auto_hold_threshold INT,
    auto_escalate_threshold INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FRAUD CHECKS
-- ============================================

CREATE TABLE fraud_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES activation_submissions(id),
    rule_id UUID REFERENCES fraud_rules(id),
    rule_key VARCHAR(100) NOT NULL,
    passed BOOLEAN NOT NULL,
    risk_score_added INT DEFAULT 0,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FRAUD FLAGS
-- ============================================

CREATE TABLE fraud_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES activation_submissions(id),
    flag_type VARCHAR(100) NOT NULL,
    flag_description TEXT,
    risk_score INT DEFAULT 0,
    related_submission_ids UUID[],
    reviewed BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    resolution TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FRAUD REVIEWS
-- ============================================

CREATE TABLE fraud_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES activation_submissions(id),
    reviewer_id UUID NOT NULL REFERENCES profiles(id),
    decision VARCHAR(50) NOT NULL,
    notes TEXT,
    related_submission_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RELATED SUBMISSIONS
-- ============================================

CREATE TABLE related_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES activation_submissions(id),
    related_submission_id UUID NOT NULL REFERENCES activation_submissions(id),
    relationship_type VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT BATCHES
-- ============================================

CREATE TABLE payment_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    campaign_id UUID NOT NULL REFERENCES campaigns(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status payment_batch_status DEFAULT 'draft',
    total_partners INT DEFAULT 0,
    total_activations INT DEFAULT 0,
    total_amount DECIMAL(14, 2) DEFAULT 0,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    payment_date DATE,
    reconciliation_status VARCHAR(50),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT BATCH ITEMS
-- ============================================

CREATE TABLE payment_batch_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES payment_batches(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES profiles(id),
    valid_activations INT DEFAULT 0,
    fee_per_activation DECIMAL(12, 2) DEFAULT 0,
    gross_amount DECIMAL(14, 2) DEFAULT 0,
    adjustment_amount DECIMAL(14, 2) DEFAULT 0,
    adjustment_reason TEXT,
    final_amount DECIMAL(14, 2) DEFAULT 0,
    status payment_status DEFAULT 'pending',
    payment_reference VARCHAR(100),
    payment_date DATE,
    payment_proof_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT ADJUSTMENTS
-- ============================================

CREATE TABLE payment_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_item_id UUID NOT NULL REFERENCES payment_batch_items(id) ON DELETE CASCADE,
    amount DECIMAL(14, 2) NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENT PROOFS
-- ============================================

CREATE TABLE payment_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES payment_batches(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTNER BANK ACCOUNTS
-- ============================================

CREATE TABLE partner_bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES profiles(id),
    bank_name VARCHAR(100) NOT NULL,
    account_number_encrypted TEXT NOT NULL,
    account_number_masked VARCHAR(50),
    account_holder_name VARCHAR(255) NOT NULL,
    branch VARCHAR(100),
    is_primary BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    tax_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDIT LOGS
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    previous_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    reason TEXT,
    campaign_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_organization ON profiles(organization_id);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_code ON campaigns(code);

CREATE INDEX idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX idx_campaign_members_user ON campaign_members(user_id);

CREATE INDEX idx_pic_assignments_pic ON pic_partner_assignments(pic_user_id);
CREATE INDEX idx_pic_assignments_partner ON pic_partner_assignments(partner_user_id);

CREATE INDEX idx_submissions_campaign ON activation_submissions(campaign_id);
CREATE INDEX idx_submissions_partner ON activation_submissions(partner_id);
CREATE INDEX idx_submissions_status ON activation_submissions(status);
CREATE INDEX idx_submissions_date ON activation_submissions(activation_date);
CREATE INDEX idx_submissions_phone ON activation_submissions(customer_phone_normalized);
CREATE INDEX idx_submissions_fraud ON activation_submissions(fraud_risk_score);

CREATE INDEX idx_evidence_submission ON submission_evidence(submission_id);
CREATE INDEX idx_evidence_hash ON submission_evidence(file_hash_sha256);
CREATE INDEX idx_evidence_perceptual ON submission_evidence(perceptual_hash);

CREATE INDEX idx_qc_reviews_submission ON qc_reviews(submission_id);
CREATE INDEX idx_qc_reviews_reviewer ON qc_reviews(reviewer_id);

CREATE INDEX idx_fraud_flags_submission ON fraud_flags(submission_id);
CREATE INDEX idx_fraud_flags_reviewed ON fraud_flags(reviewed);

CREATE INDEX idx_payment_batches_campaign ON payment_batches(campaign_id);
CREATE INDEX idx_payment_batches_status ON payment_batches(status);

CREATE INDEX idx_payment_items_batch ON payment_batch_items(batch_id);
CREATE INDEX idx_payment_items_partner ON payment_batch_items(partner_id);
CREATE INDEX idx_payment_items_status ON payment_batch_items(status);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_time ON audit_logs(created_at);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON activation_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_batches_updated_at BEFORE UPDATE ON payment_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_items_updated_at BEFORE UPDATE ON payment_batch_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate submission code
CREATE OR REPLACE FUNCTION generate_submission_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.submission_code IS NULL THEN
        NEW.submission_code = 'SUB-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_submission_code_trigger
    BEFORE INSERT ON activation_submissions
    FOR EACH ROW EXECUTE FUNCTION generate_submission_code();

-- Generate batch code
CREATE OR REPLACE FUNCTION generate_batch_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.batch_code IS NULL THEN
        NEW.batch_code = 'BATCH-' || TO_CHAR(NOW(), 'YYMM') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_batch_code_trigger
    BEFORE INSERT ON payment_batches
    FOR EACH ROW EXECUTE FUNCTION generate_batch_code();

-- Normalize phone number
CREATE OR REPLACE FUNCTION normalize_phone(phone VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    IF phone IS NULL THEN RETURN NULL; END IF;

    phone := REGEXP_REPLACE(phone, '[^\d+]', '', 'g');

    IF LEFT(phone, 1) = '0' THEN
        phone := '+62' || SUBSTRING(phone, 2);
    END IF;

    IF LEFT(phone, 3) != '+62' AND LEFT(phone, 1) != '+' THEN
        phone := '+62' || phone;
    END IF;

    RETURN phone;
END;
$$ LANGUAGE plpgsql;

-- Mask phone number
CREATE OR REPLACE FUNCTION mask_phone(phone VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    IF phone IS NULL THEN RETURN NULL; END IF;

    phone := REGEXP_REPLACE(phone, '[^\d]', '', 'g');

    IF LENGTH(phone) >= 10 THEN
        RETURN LEFT(phone, 4) || '****' || RIGHT(phone, 4);
    END IF;

    RETURN phone;
END;
$$ LANGUAGE plpgsql;

-- Calculate fraud risk level
CREATE OR REPLACE FUNCTION calculate_fraud_risk_level(score INT)
RETURNS fraud_risk_level AS $$
BEGIN
    IF score < 30 THEN RETURN 'low';
    ELSIF score < 60 THEN RETURN 'medium';
    ELSIF score < 80 THEN RETURN 'high';
    ELSE RETURN 'critical';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update submission fraud risk on insert
CREATE OR REPLACE FUNCTION update_submission_fraud_risk()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.fraud_risk_level = calculate_fraud_risk_level(NEW.fraud_risk_score);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.fraud_risk_level = calculate_fraud_risk_level(NEW.fraud_risk_score);
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_submission_fraud_risk_trigger
    BEFORE INSERT OR UPDATE ON activation_submissions
    FOR EACH ROW EXECUTE FUNCTION update_submission_fraud_risk();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE qc_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see their own, admins can see all
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Submissions: Partners see own, PICs see assigned, Managers see campaign
CREATE POLICY "Partners view own submissions" ON activation_submissions
    FOR SELECT USING (
        auth.uid() = partner_id OR
        EXISTS (SELECT 1 FROM campaign_members WHERE user_id = auth.uid() AND campaign_id = activation_submissions.campaign_id)
    );

CREATE POLICY "Partners create own submissions" ON activation_submissions
    FOR INSERT WITH CHECK (auth.uid() = partner_id);

-- Evidence: Only submission owner or reviewers
CREATE POLICY "View evidence" ON submission_evidence
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM activation_submissions WHERE id = submission_id AND partner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM campaign_members WHERE user_id = auth.uid() AND campaign_id IN (SELECT campaign_id FROM activation_submissions WHERE id = submission_id))
    );

-- Notifications: Users see own
CREATE POLICY "View own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Bank accounts: Only own
CREATE POLICY "View own bank accounts" ON partner_bank_accounts
    FOR SELECT USING (auth.uid() = partner_id);

CREATE POLICY "Manage own bank accounts" ON partner_bank_accounts
    FOR ALL USING (auth.uid() = partner_id);
