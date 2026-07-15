// ============================================
// RECTOVERSO ACTIVATION MANAGEMENT SYSTEM
// TypeScript Types
// ============================================

// Enums
export type UserStatus = 'invited' | 'active' | 'suspended' | 'inactive';
export type CampaignStatus = 'draft' | 'upcoming' | 'active' | 'paused' | 'completed' | 'archived';
export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_automated_check'
  | 'pending_qc'
  | 'need_revision'
  | 'resubmitted'
  | 'valid'
  | 'non_valid'
  | 'suspected_fraud'
  | 'confirmed_fraud'
  | 'duplicate'
  | 'cancelled'
  | 'included_in_batch'
  | 'paid';

export type QcDecision = 'valid' | 'non_valid' | 'need_revision' | 'escalate_fraud' | 'duplicate';
export type PaymentBatchStatus = 'draft' | 'under_review' | 'approved' | 'processing' | 'paid' | 'partially_paid' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';
export type FraudRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DeviceOS = 'android' | 'ios';
export type RoleName = 'super_admin' | 'campaign_manager' | 'pic' | 'qc_reviewer' | 'partner';

// Database Entities
export interface Organization {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
  province?: string;
  address?: string;
  national_id?: string;
  profile_photo_url?: string;
  organization_id?: string;
  status: UserStatus;
  last_active_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: RoleName;
  display_name: string;
  description?: string;
  permissions: string[];
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  organization_id?: string;
  created_at: string;
  role?: Role;
  profile?: Profile;
}

export interface Campaign {
  id: string;
  organization_id?: string;
  name: string;
  code: string;
  client_name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: CampaignStatus;
  fee_per_activation: number;
  payment_frequency: string;
  max_submissions_per_day?: number;
  operating_hours?: { start: string; end: string };
  target_activations?: number;
  required_evidence?: string[];
  fraud_rules?: Record<string, unknown>;
  resubmission_policy?: { allowed: boolean; max_attempts: number };
  qc_sla_hours?: number;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CampaignMember {
  id: string;
  campaign_id: string;
  user_id: string;
  role: string;
  assigned_at: string;
  campaign?: Campaign;
  user?: Profile;
}

export interface PicPartnerAssignment {
  id: string;
  pic_user_id: string;
  partner_user_id: string;
  campaign_id: string;
  assigned_at: string;
  pic?: Profile;
  partner?: Profile;
}

export interface CampaignFormField {
  id: string;
  campaign_id: string;
  field_key: string;
  field_type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { label: string; value: string }[];
  validation?: Record<string, unknown>;
  order_index: number;
  created_at: string;
}

export interface CampaignSOP {
  id: string;
  campaign_id: string;
  version: string;
  content: string;
  effective_date: string;
  created_at: string;
}

export interface SopAcceptance {
  id: string;
  sop_id: string;
  user_id: string;
  accepted_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ActivationSubmission {
  id: string;
  submission_code: string;
  campaign_id: string;
  partner_id: string;
  customer_name?: string;
  customer_phone_normalized?: string;
  customer_phone_masked?: string;
  customer_reference?: string;
  activation_date: string;
  activation_time?: string;
  activation_city?: string;
  activation_location?: string;
  device_os?: DeviceOS;
  device_model?: string;
  fifgo_downloaded?: boolean;
  fifgo_registered?: boolean;
  user_tried_app?: boolean;
  rating_submitted?: boolean;
  rating_value?: number;
  review_submitted?: boolean;
  review_text?: string;
  additional_notes?: string;
  declaration_accepted: boolean;
  declaration_timestamp?: string;
  declaration_ip?: string;
  declaration_user_agent?: string;
  sop_version?: string;
  submitted_at: string;
  client_ip?: string;
  client_user_agent?: string;
  latitude?: number;
  longitude?: number;
  status: SubmissionStatus;
  version: number;
  parent_submission_id?: string;
  fraud_risk_score: number;
  fraud_risk_level: FraudRiskLevel;
  qc_reviewed_by?: string;
  qc_reviewed_at?: string;
  rejection_reason_code?: string;
  rejection_reason_visible?: string;
  internal_qc_notes?: string;
  eligible_for_payment: boolean;
  payment_amount: number;
  payment_batch_item_id?: string;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
  partner?: Profile;
  evidence?: SubmissionEvidence[];
  qc_reviews?: QcReview[];
}

export interface SubmissionEvidence {
  id: string;
  submission_id: string;
  evidence_type: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  file_hash_sha256?: string;
  perceptual_hash?: string;
  storage_bucket?: string;
  is_primary: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface SubmissionVersion {
  id: string;
  submission_id: string;
  version: number;
  changes: Record<string, { old: unknown; new: unknown }>;
  changed_by?: string;
  change_reason?: string;
  created_at: string;
}

export interface QcReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  decision: QcDecision;
  reason_code?: string;
  reason_visible?: string;
  internal_notes?: string;
  evidence_viewed?: string[];
  previous_status?: SubmissionStatus;
  new_status?: SubmissionStatus;
  is_override: boolean;
  override_reason?: string;
  created_at: string;
  reviewer?: Profile;
}

export interface QcReasonCode {
  id: string;
  code: string;
  label: string;
  label_id?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
}

export interface FraudRule {
  id: string;
  campaign_id?: string;
  rule_key: string;
  rule_name: string;
  description?: string;
  enabled: boolean;
  risk_weight: number;
  threshold?: Record<string, unknown>;
  auto_hold_threshold?: number;
  auto_escalate_threshold?: number;
  created_at: string;
  updated_at: string;
}

export interface FraudCheck {
  id: string;
  submission_id: string;
  rule_id?: string;
  rule_key: string;
  passed: boolean;
  risk_score_added: number;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface FraudFlag {
  id: string;
  submission_id: string;
  flag_type: string;
  flag_description?: string;
  risk_score: number;
  related_submission_ids?: string[];
  reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  resolution?: string;
  created_at: string;
}

export interface FraudReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  decision: string;
  notes?: string;
  related_submission_ids?: string[];
  created_at: string;
}

export interface RelatedSubmission {
  id: string;
  submission_id: string;
  related_submission_id: string;
  relationship_type: string;
  confidence_score?: number;
  created_at: string;
}

export interface PaymentBatch {
  id: string;
  batch_code: string;
  campaign_id: string;
  period_start: string;
  period_end: string;
  status: PaymentBatchStatus;
  total_partners: number;
  total_activations: number;
  total_amount: number;
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  payment_date?: string;
  reconciliation_status?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  campaign?: Campaign;
  items?: PaymentBatchItem[];
}

export interface PaymentBatchItem {
  id: string;
  batch_id: string;
  partner_id: string;
  valid_activations: number;
  fee_per_activation: number;
  gross_amount: number;
  adjustment_amount: number;
  adjustment_reason?: string;
  final_amount: number;
  status: PaymentStatus;
  payment_reference?: string;
  payment_date?: string;
  payment_proof_url?: string;
  created_at: string;
  updated_at: string;
  partner?: Profile;
  adjustments?: PaymentAdjustment[];
}

export interface PaymentAdjustment {
  id: string;
  batch_item_id: string;
  amount: number;
  reason: string;
  created_by?: string;
  created_at: string;
}

export interface PaymentProof {
  id: string;
  batch_id: string;
  file_name: string;
  file_path: string;
  file_url?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface PartnerBankAccount {
  id: string;
  partner_id: string;
  bank_name: string;
  account_number_encrypted: string;
  account_number_masked?: string;
  account_holder_name: string;
  branch?: string;
  is_primary: boolean;
  is_verified: boolean;
  verified_at?: string;
  verified_by?: string;
  tax_info?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_email?: string;
  actor_role?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  campaign_id?: string;
  created_at: string;
}

// API Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard Types
export interface DashboardStats {
  totalSubmissions: number;
  pendingQc: number;
  valid: number;
  nonValid: number;
  suspectedFraud: number;
  validRate: number;
  totalEarnings: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface PartnerDashboard extends DashboardStats {
  todaySubmissions: number;
  weekSubmissions: number;
  lastPayment?: PaymentBatchItem;
  currentCampaignTarget?: number;
}

export interface PicDashboard extends DashboardStats {
  assignedPartners: number;
  activePartners: number;
  weeklyValid: number;
  weeklyProjectedPayout: number;
  teamValidRate: number;
  avgQcTurnaroundHours?: number;
}

export interface CampaignDashboard extends DashboardStats {
  totalPartners: number;
  activePartners: number;
  totalPic: number;
  fraudRate: number;
  confirmedFraud: number;
  campaignTarget?: number;
  targetProgress: number;
}

// Form Types
export interface SubmissionFormData {
  activation_date: string;
  activation_time?: string;
  activation_city?: string;
  activation_location?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_reference?: string;
  device_os?: DeviceOS;
  device_model?: string;
  fifgo_downloaded?: boolean;
  fifgo_registered?: boolean;
  user_tried_app?: boolean;
  rating_submitted?: boolean;
  rating_value?: number;
  review_submitted?: boolean;
  review_text?: string;
  additional_notes?: string;
  evidence_files?: File[];
  declaration_accepted: boolean;
}

// Filter Types
export interface SubmissionFilters {
  campaign_id?: string;
  partner_id?: string;
  status?: SubmissionStatus;
  date_from?: string;
  date_to?: string;
  city?: string;
  fraud_risk_level?: FraudRiskLevel;
  payment_status?: PaymentStatus;
  search?: string;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
  roles: UserRole[];
  activeRole?: Role;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface InvitationData {
  email: string;
  role: RoleName;
  campaign_id?: string;
  organization_id?: string;
}
