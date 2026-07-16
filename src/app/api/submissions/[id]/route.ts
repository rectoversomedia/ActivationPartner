import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH - Update submission status (QC approval/rejection) or fraud remarks
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, status, qc_notes, fraud_remarks } = body;

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // If updating status, validate it
    if (status && !['pending', 'valid', 'invalid', 'fraud'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    updateData.updated_at = new Date().toISOString();

    if (qc_notes !== undefined) {
      updateData.qc_notes = qc_notes;
    }

    if (fraud_remarks !== undefined) {
      updateData.fraud_remarks = fraud_remarks;
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length <= 1) { // only updated_at
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      message: fraud_remarks !== undefined
        ? 'Fraud remarks saved successfully'
        : `Submission ${status === 'valid' ? 'approved' : status === 'invalid' ? 'rejected' : 'updated'} successfully`,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
