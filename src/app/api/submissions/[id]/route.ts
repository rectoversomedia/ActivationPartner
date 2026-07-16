import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH - Update submission status (QC approval/rejection)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, status, qc_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    if (!['pending', 'valid', 'invalid', 'fraud'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (qc_notes) {
      updateData.qc_notes = qc_notes;
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
      message: `Submission ${status === 'valid' ? 'approved' : status === 'invalid' ? 'rejected' : 'updated'} successfully`,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
