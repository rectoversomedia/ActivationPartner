import { z } from 'zod';

// Phone number validation
const phoneRegex = /^(\+62|62|0)[0-9]{9,14}$/;

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// Invitation/Registration schema
export const invitationSchema = z.object({
  token: z.string().min(1, 'Token diperlukan'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Password minimal 6 karakter'),
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().regex(phoneRegex, 'Nomor telepon tidak valid'),
  whatsapp: z.string().regex(phoneRegex, 'Nomor WhatsApp tidak valid').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

// Partner profile schema
export const partnerProfileSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z.string().regex(phoneRegex, 'Nomor telepon tidak valid'),
  whatsapp: z.string().regex(phoneRegex, 'Nomor WhatsApp tidak valid').optional().or(z.literal('')),
  city: z.string().min(1, 'Kota harus diisi'),
  province: z.string().min(1, 'Provinsi harus diisi'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
});

// Bank account schema
export const bankAccountSchema = z.object({
  bank_name: z.string().min(1, 'Nama bank harus diisi'),
  account_number: z.string().min(5, 'Nomor rekening minimal 5 digit').max(20, 'Nomor rekening maksimal 20 digit'),
  account_holder_name: z.string().min(2, 'Nama penerima harus diisi'),
  branch: z.string().optional(),
});

// Submission schema (FIFGO)
export const submissionSchema = z.object({
  activation_date: z.string().min(1, 'Tanggal aktivasi harus diisi'),
  activation_time: z.string().optional(),
  activation_city: z.string().min(1, 'Kota harus diisi'),
  activation_location: z.string().min(3, 'Lokasi harus diisi'),
  customer_name: z.string().min(1, 'Nama customer harus diisi').max(100, 'Nama maksimal 100 karakter'),
  customer_phone: z.string().regex(phoneRegex, 'Nomor telepon customer tidak valid'),
  customer_reference: z.string().optional(),
  device_os: z.enum(['android', 'ios']),
  device_model: z.string().optional(),
  fifgo_downloaded: z.boolean(),
  fifgo_registered: z.boolean(),
  user_tried_app: z.boolean(),
  rating_submitted: z.boolean(),
  rating_value: z.number().min(1).max(5).optional(),
  review_submitted: z.boolean(),
  review_text: z.string().optional(),
  additional_notes: z.string().optional(),
  declaration_accepted: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui deklarasi',
  }),
});

// QC Review schema
export const qcReviewSchema = z.object({
  decision: z.enum(['valid', 'non_valid', 'need_revision', 'escalate_fraud', 'duplicate']),
  reason_code: z.string().optional(),
  reason_visible: z.string().optional(),
  internal_notes: z.string().optional(),
  is_override: z.boolean().default(false),
  override_reason: z.string().optional(),
}).refine((data) => {
  if (data.decision === 'non_valid' && !data.reason_code) {
    return false;
  }
  if (data.is_override && !data.override_reason) {
    return false;
  }
  return true;
}, {
  message: 'Alasan penolakan atau alasan override harus diisi',
});

// Fraud review schema
export const fraudReviewSchema = z.object({
  decision: z.enum(['valid', 'non_valid', 'confirmed_fraud']),
  notes: z.string().min(10, 'Catatan minimal 10 karakter'),
  related_submission_ids: z.array(z.string()).optional(),
});

// Payment adjustment schema
export const paymentAdjustmentSchema = z.object({
  amount: z.number().refine((val) => val !== 0, {
    message: 'Jumlah penyesuaian tidak boleh 0',
  }),
  reason: z.string().min(10, 'Alasan penyesuaian minimal 10 karakter'),
});

// Create campaign schema
export const createCampaignSchema = z.object({
  name: z.string().min(3, 'Nama campaign minimal 3 karakter'),
  code: z.string().min(2, 'Kode campaign minimal 2 karakter').max(20).regex(/^[A-Z0-9_]+$/, 'Kode hanya boleh huruf besar, angka, dan underscore'),
  client_name: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string(),
  fee_per_activation: z.number().min(0, 'Fee tidak boleh negatif'),
  payment_frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  target_activations: z.number().int().positive().optional(),
  max_submissions_per_day: z.number().int().positive().optional(),
  qc_sla_hours: z.number().int().positive().optional(),
});

// Create user schema
export const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['campaign_manager', 'pic', 'qc_reviewer', 'partner']),
  phone: z.string().regex(phoneRegex, 'Nomor telepon tidak valid').optional(),
  campaign_id: z.string().uuid().optional(),
});

// Assign partner to PIC schema
export const assignPartnerSchema = z.object({
  pic_user_id: z.string().uuid('PIC harus dipilih'),
  partner_user_id: z.string().uuid('Partner harus dipilih'),
  campaign_id: z.string().uuid('Campaign harus dipilih'),
});

// Create payment batch schema
export const createPaymentBatchSchema = z.object({
  campaign_id: z.string().uuid('Campaign harus dipilih'),
  period_start: z.string(),
  period_end: z.string(),
  approval_notes: z.string().optional(),
});

// SOP acceptance schema
export const sopAcceptanceSchema = z.object({
  sop_id: z.string().uuid(),
  accepted: z.literal(true),
});

// Types from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type InvitationInput = z.infer<typeof invitationSchema>;
export type PartnerProfileInput = z.infer<typeof partnerProfileSchema>;
export type BankAccountInput = z.infer<typeof bankAccountSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type QcReviewInput = z.infer<typeof qcReviewSchema>;
export type FraudReviewInput = z.infer<typeof fraudReviewSchema>;
export type PaymentAdjustmentInput = z.infer<typeof paymentAdjustmentSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type AssignPartnerInput = z.infer<typeof assignPartnerSchema>;
export type CreatePaymentBatchInput = z.infer<typeof createPaymentBatchSchema>;
