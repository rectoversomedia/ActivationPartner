import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const campaignId = searchParams.get('campaign_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('campaigns')
      .select(`
        *,
        organization:organizations(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (campaignId) {
      query = query.eq('id', campaignId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count || 0,
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
    const requiredFields = ['name', 'code'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name: body.name,
        code: body.code,
        client_name: body.client_name,
        description: body.description,
        start_date: body.start_date,
        end_date: body.end_date,
        status: body.status || 'draft',
        fee_per_activation: body.fee_per_activation || 0,
        payment_frequency: body.payment_frequency || 'weekly',
        max_submissions_per_day: body.max_submissions_per_day,
        operating_hours: body.operating_hours,
        target_activations: body.target_activations,
        required_evidence: body.required_evidence || [],
        fraud_rules: body.fraud_rules || {},
        resubmission_policy: body.resubmission_policy || { allowed: true, max_attempts: 3 },
        qc_sla_hours: body.qc_sla_hours || 48,
        settings: body.settings || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the creation
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      actor_email: user.email,
      action: 'campaign_created',
      entity_type: 'campaign',
      entity_id: data.id,
      new_value: data,
    });

    return NextResponse.json({ data, message: 'Campaign created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
