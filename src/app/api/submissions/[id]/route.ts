import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('activation_submissions')
      .select(`
        *,
        campaign:campaigns(id, name, code, fee_per_activation),
        partner:profiles(id, full_name, email, phone),
        evidence:submission_evidence(*),
        qc_reviews:qc_reviews(*, reviewer:profiles!reviewer_id(id, full_name))
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
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

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only allow certain fields to be updated
    const allowedFields = [
      'customer_name', 'customer_phone', 'activation_date', 'activation_time',
      'activation_city', 'activation_location', 'device_os', 'device_model',
      'fifgo_downloaded', 'fifgo_registered', 'user_tried_app',
      'rating_submitted', 'rating_value', 'review_text', 'additional_notes'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle status change
    if (body.status) {
      updateData.status = body.status;
    }

    const { data, error } = await supabase
      .from('activation_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the update in audit log
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action: 'submission_updated',
      entity_type: 'submission',
      entity_id: id,
      new_value: updateData,
    });

    return NextResponse.json({ data, message: 'Submission updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow partner to delete their own draft submissions
    const { data: existing } = await supabase
      .from('activation_submissions')
      .select('partner_id, status')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (existing.partner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existing.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft submissions can be deleted' }, { status: 400 });
    }

    const { error } = await supabase
      .from('activation_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
