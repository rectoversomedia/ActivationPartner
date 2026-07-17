import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get single submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Parse JSON fields if needed
    const submission = {
      ...data,
      fraud_flags: typeof data.fraud_flags === 'string' ? JSON.parse(data.fraud_flags) : data.fraud_flags,
      fraud_reasons: typeof data.fraud_reasons === 'string' ? JSON.parse(data.fraud_reasons) : data.fraud_reasons,
      behavior_data: typeof data.behavior_data === 'string' ? JSON.parse(data.behavior_data) : data.behavior_data,
    };

    return NextResponse.json({ data: submission });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update submission status, QC notes, or fraud remarks
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { status, qc_notes, fraud_remarks, fraud_decision } = body;

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // If updating status, validate it
    if (status && !['pending', 'valid', 'invalid', 'fraud'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    if (qc_notes !== undefined) {
      updateData.qc_notes = qc_notes;
    }

    if (fraud_remarks !== undefined) {
      updateData.fraud_remarks = fraud_remarks;
    }

    if (fraud_decision !== undefined) {
      updateData.fraud_decision = fraud_decision;
    }

    // Ensure at least one meaningful field is being updated (excluding updated_at)
    const meaningfulFields = ['status', 'qc_notes', 'fraud_remarks', 'fraud_decision'];
    const hasMeaningfulUpdate = meaningfulFields.some(field => body[field] !== undefined);

    if (!hasMeaningfulUpdate) {
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
      message: 'Submission updated successfully',
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
