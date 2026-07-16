import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch submissions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`submission_code.ilike.%${search}%,customer_name.ilike.%${search}%,sales_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range((page - 1) * limit, page * limit);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: data || [],
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

// POST - Create new submission
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['sales_id', 'pic_id', 'campaign_id', 'customer_name', 'customer_phone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Generate submission code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let submissionCode = 'ACT-';
    for (let i = 0; i < 8; i++) {
      submissionCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Normalize phone
    let phone = body.customer_phone.replace(/[^\d+]/g, '');
    if (phone.startsWith('0')) {
      phone = '+62' + phone.slice(1);
    }

    // Insert to Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        submission_code: submissionCode,
        sales_id: body.sales_id,
        sales_name: body.sales_name,
        pic_id: body.pic_id,
        pic_name: body.pic_name,
        campaign_id: body.campaign_id,
        campaign_name: body.campaign_name,
        customer_name: body.customer_name,
        customer_email: body.customer_email || null,
        customer_phone: phone,
        customer_phone_masked: phone.slice(0, 4) + '****' + phone.slice(-4),
        device_info: body.device_info || null,
        gps_lat: body.gps_lat || null,
        gps_lng: body.gps_lng || null,
        screenshot_download: body.screenshot_download || false,
        screenshot_register: body.screenshot_register || false,
        screenshot_rating: body.screenshot_rating || false,
        status: 'pending',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent'),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      submissionCode,
      message: 'Submission created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
