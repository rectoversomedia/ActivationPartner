import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { decision, reason_code, reason_visible, internal_notes, override_reason } = body;

    // Validate required fields
    if (!decision) {
      return NextResponse.json({ error: 'Decision is required' }, { status: 400 });
    }

    const validDecisions = ['valid', 'non_valid', 'need_revision', 'escalate_fraud', 'duplicate'];
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision value' }, { status: 400 });
    }

    // Get current submission
    const { data: submission, error: fetchError } = await supabase
      .from('activation_submissions')
      .select('status, partner_id')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Map decision to new status
    let newStatus: string;
    switch (decision) {
      case 'valid':
        newStatus = 'valid';
        break;
      case 'non_valid':
      case 'duplicate':
        newStatus = 'non_valid';
        break;
      case 'need_revision':
        newStatus = 'need_revision';
        break;
      case 'escalate_fraud':
        newStatus = 'suspected_fraud';
        break;
      default:
        newStatus = submission.status;
    }

    // Create QC review record
    const { data: qcReview, error: qcError } = await supabase
      .from('qc_reviews')
      .insert({
        submission_id: id,
        reviewer_id: user.id,
        decision,
        reason_code,
        reason_visible,
        internal_notes,
        previous_status: submission.status,
        new_status: newStatus,
        is_override: body.is_override || false,
        override_reason,
      })
      .select()
      .single();

    if (qcError) {
      console.error('QC review insert error:', qcError);
      return NextResponse.json({ error: qcError.message }, { status: 500 });
    }

    // Update submission status
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('activation_submissions')
      .update({
        status: newStatus,
        qc_reviewed_by: user.id,
        qc_reviewed_at: new Date().toISOString(),
        rejection_reason_code: reason_code,
        rejection_reason_visible: reason_visible,
        internal_qc_notes: internal_notes,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Submission update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Calculate payment eligibility for valid submissions
    if (decision === 'valid') {
      // Get campaign fee
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('fee_per_activation')
        .eq('id', updatedSubmission.campaign_id)
        .single();

      if (campaign) {
        await supabase
          .from('activation_submissions')
          .update({
            eligible_for_payment: true,
            payment_amount: campaign.fee_per_activation,
          })
          .eq('id', id);
      }
    }

    // Log to audit
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      actor_role: 'qc_reviewer',
      action: `submission_qc_${decision}`,
      entity_type: 'submission',
      entity_id: id,
      new_value: { status: newStatus, decision },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
    });

    return NextResponse.json({
      data: {
        submission: updatedSubmission,
        qc_review: qcReview,
      },
      message: 'QC review submitted successfully',
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('qc_reviews')
      .select(`
        *,
        reviewer:profiles!reviewer_id(id, full_name, email)
      `)
      .eq('submission_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
