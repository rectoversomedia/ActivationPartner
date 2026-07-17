import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Parse JSON fields
    const campaigns = (data || []).map(c => ({
      ...c,
      fraud_rules: typeof c.fraud_rules === 'string' ? JSON.parse(c.fraud_rules) : (c.fraud_rules || {}),
      allowed_regions: typeof c.allowed_regions === 'string' ? JSON.parse(c.allowed_regions) : (c.allowed_regions || []),
      required_evidence: typeof c.required_evidence === 'string' ? JSON.parse(c.required_evidence) : (c.required_evidence || []),
      form_fields: typeof c.form_fields === 'string' ? JSON.parse(c.form_fields) : (c.form_fields || []),
    }));

    return NextResponse.json({ data: campaigns, total: count || 0 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    // Default fraud rules
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

    // Default evidence items
    const required_evidence = body.required_evidence || [
      { id: 'download', label: 'Screenshot Download', required: true },
      { id: 'register', label: 'Screenshot Registrasi', required: true },
      { id: 'rating', label: 'Screenshot Rating/Review', required: true },
    ];

    // Default form fields
    const form_fields = body.form_fields || [
      { id: 'sales', name: 'sales_id', label: 'Sales', type: 'select', required: true, source: 'sales' },
      { id: 'pic', name: 'pic_id', label: 'PIC', type: 'select', required: true, source: 'pics' },
      { id: 'customer_name', name: 'customer_name', label: 'Nama Customer', type: 'text', required: true },
      { id: 'customer_phone', name: 'customer_phone', label: 'No. Telepon Customer', type: 'tel', required: true },
    ];

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        code: body.code.toUpperCase(),
        fee_per_activation: body.fee_per_activation || 5000,
        brand_logo_url: body.brand_logo_url || null,
        download_url: body.download_url || null,
        form_url: body.form_url || null,
        assets_url: body.assets_url || null,
        redirect_url: body.redirect_url || null,
        fraud_rules: JSON.stringify(fraud_rules),
        allowed_regions: JSON.stringify(body.allowed_regions || []),
        required_evidence: JSON.stringify(required_evidence),
        form_fields: JSON.stringify(form_fields),
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Campaign created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
