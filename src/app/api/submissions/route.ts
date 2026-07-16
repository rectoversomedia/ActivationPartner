import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const campaignId = searchParams.get('campaign_id');
    const status = searchParams.get('status');
    const partnerId = searchParams.get('partner_id');
    const search = searchParams.get('search');

    let query = supabase
      .from('activation_submissions')
      .select(`
        *,
        campaign:campaigns(id, name, code),
        partner:profiles(id, full_name, email)
      `, { count: 'exact' });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
    }
    if (search) {
      query = query.or(`submission_code.ilike.%${search}%,customer_name.ilike.%${search}%`);
    }

    query = query
      .order('submitted_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    const requiredFields = ['campaign_id', 'activation_date', 'customer_name', 'customer_phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Normalize phone number
    let normalizedPhone = body.customer_phone.replace(/[^\d+]/g, '');
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = '+62' + normalizedPhone.slice(1);
    }

    // Create submission
    const { data, error } = await supabase
      .from('activation_submissions')
      .insert({
        campaign_id: body.campaign_id,
        partner_id: user.id,
        customer_name: body.customer_name,
        customer_phone_normalized: normalizedPhone,
        customer_phone_masked: normalizedPhone.slice(0, 4) + '****' + normalizedPhone.slice(-4),
        activation_date: body.activation_date,
        activation_time: body.activation_time,
        activation_city: body.activation_city,
        activation_location: body.activation_location,
        device_os: body.device_os,
        device_model: body.device_model,
        fifgo_downloaded: body.fifgo_downloaded || false,
        fifgo_registered: body.fifgo_registered || false,
        user_tried_app: body.user_tried_app || false,
        rating_submitted: body.rating_submitted || false,
        rating_value: body.rating_value,
        review_text: body.review_text,
        additional_notes: body.additional_notes,
        declaration_accepted: body.declaration_accepted || false,
        declaration_timestamp: body.declaration_accepted ? new Date().toISOString() : null,
        client_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        client_user_agent: request.headers.get('user-agent'),
        latitude: body.latitude,
        longitude: body.longitude,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Submission created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
