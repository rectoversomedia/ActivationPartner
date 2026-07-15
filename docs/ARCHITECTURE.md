# Campaign Management

## Entity Relationship

```
Organization (1) ─────< Campaign (N)
  │                      │
  │                      ├────< CampaignMember (N)
  │                      │          │
  │                      │          ├────< User (N)
  │                      │          │
  │                      │          └────< Role (N)
  │                      │
  │                      ├────< CampaignSetting (N)
  │                      │
  │                      ├────< CampaignSOP (N)
  │                      │
  │                      └────< ActivationSubmission (N)
  │                                 │
  │                                 ├────< SubmissionEvidence (N)
  │                                 │
  │                                 ├────< QCReview (N)
  │                                 │
  │                                 ├────< FraudCheck (N)
  │                                 │
  │                                 └────< PaymentBatchItem (N)

PIC (1) ──────< PICPartnerAssignment (N) >───── Partner (N)

PaymentBatch (1) ─────< PaymentBatchItem (N)
                            │
                            └────< PaymentAdjustment (N)
```

## Tables

### Core Entities
- `organizations` - Multiple organization support
- `profiles` - User profiles with role information
- `roles` - Role definitions (super_admin, campaign_manager, pic, qc_reviewer, partner)
- `user_roles` - User-role assignments

### Campaign
- `campaigns` - Campaign configurations
- `campaign_members` - Campaign membership with roles
- `campaign_settings` - Campaign-specific settings
- `campaign_form_fields` - Configurable form fields
- `campaign_sops` - SOP versions
- `sop_acceptances` - Partner SOP acceptances

### Submissions
- `activation_submissions` - Main submission records
- `submission_versions` - Revision history
- `submission_evidence` - Evidence files
- `qc_reviews` - QC decisions
- `qc_reason_codes` - Predefined rejection reasons

### Fraud Detection
- `fraud_rules` - Configurable fraud rules
- `fraud_checks` - Automated fraud checks
- `fraud_flags` - Triggered fraud flags
- `fraud_reviews` - Manual fraud reviews
- `related_submissions` - Duplicate detection links

### Payments
- `payment_batches` - Weekly payment batches
- `payment_batch_items` - Partner payments in batch
- `payment_adjustments` - Payment adjustments
- `payment_proofs` - Payment proof files

### Supporting
- `partner_bank_accounts` - Encrypted bank info
- `notifications` - In-app notifications
- `audit_logs` - Immutable audit trail
- `system_settings` - Global settings
