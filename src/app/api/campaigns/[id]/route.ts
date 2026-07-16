import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Parse JSON fields
    const campaign = {
      ...data,
      fraud_rules: typeof data.fraud_rules === 'string' ? JSON.parse(data.fraud_rules) : (data.fraud_rules || {}),
      allowed_regions: typeof data.allowed_regions === 'string' ? JSON.parse(data.allowed_regions) : (data.allowed_regions || []),
      required_evidence: typeof data.required_evidence === 'string' ? JSON.parse(data.required_evidence) : (data.required_evidence || []),
      form_fields: typeof data.form_fields === 'string' ? JSON.parse(data.form_fields) : (data.form_fields || []),
    };

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    // Ensure fraud_rules has proper structure
    const fraud_rules = {
      require_screenshot_download: true,
      require_screenshot_register: true,
      require_screenshot_rating: true,
      require_gps: true,
      check_duplicate_phone: true,
      check_duplicate_name: true,
      check_duplicate_email: true,
      check_gps_location: false,
      ...body.fraud_rules,
    };

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        name: body.name,
        code: body.code?.toUpperCase(),
        fee_per_activation: body.fee_per_activation,
        fraud_rules: JSON.stringify(fraud_rules),
        allowed_regions: JSON.stringify(body.allowed_regions || []),
        required_evidence: JSON.stringify(body.required_evidence || []),
        form_fields: JSON.stringify(body.form_fields || []),
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Campaign updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
