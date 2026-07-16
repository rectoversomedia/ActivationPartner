import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const campaignId = searchParams.get('campaign_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('payment_batches')
      .select(`
        *,
        campaign:campaigns(id, name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    if (status) {
      query = query.eq('status', status);
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

    const { campaign_id, period_start, period_end } = body;

    if (!campaign_id || !period_start || !period_end) {
      return NextResponse.json(
        { error: 'campaign_id, period_start, and period_end are required' },
        { status: 400 }
      );
    }

    // Get all valid submissions for this campaign in the period
    const { data: validSubmissions } = await supabase
      .from('activation_submissions')
      .select(`
        partner_id,
        campaign:campaigns(fee_per_activation)
      `)
      .eq('campaign_id', campaign_id)
      .eq('status', 'valid')
      .gte('activation_date', period_start)
      .lte('activation_date', period_end);

    if (!validSubmissions || validSubmissions.length === 0) {
      return NextResponse.json(
        { error: 'No valid submissions found for this period' },
        { status: 400 }
      );
    }

    // Calculate totals per partner
    const partnerTotals: Record<string, number> = {};
    const partnerFees: Record<string, number> = {};

    for (const sub of validSubmissions) {
      partnerTotals[sub.partner_id] = (partnerTotals[sub.partner_id] || 0) + 1;
      partnerFees[sub.partner_id] = sub.campaign?.fee_per_activation || 0;
    }

    const totalPartners = Object.keys(partnerTotals).length;
    const totalActivations = validSubmissions.length;
    const totalAmount = Object.entries(partnerTotals).reduce((sum, [partnerId, count]) => {
      return sum + (count * (partnerFees[partnerId] || 0));
    }, 0);

    // Create payment batch
    const { data: batch, error: batchError } = await supabase
      .from('payment_batches')
      .insert({
        campaign_id,
        period_start,
        period_end,
        status: 'draft',
        total_partners: totalPartners,
        total_activations: totalActivations,
        total_amount: totalAmount,
        created_by: user.id,
      })
      .select()
      .single();

    if (batchError) {
      console.error('Batch insert error:', batchError);
      return NextResponse.json({ error: batchError.message }, { status: 500 });
    }

    // Create batch items for each partner
    const batchItems = Object.entries(partnerTotals).map(([partnerId, count]) => ({
      batch_id: batch.id,
      partner_id: partnerId,
      valid_activations: count,
      fee_per_activation: partnerFees[partnerId],
      gross_amount: count * partnerFees[partnerId],
      adjustment_amount: 0,
      final_amount: count * partnerFees[partnerId],
      status: 'pending',
    }));

    const { error: itemsError } = await supabase
      .from('payment_batch_items')
      .insert(batchItems);

    if (itemsError) {
      console.error('Batch items insert error:', itemsError);
      // Rollback batch creation
      await supabase.from('payment_batches').delete().eq('id', batch.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: batch,
      message: 'Payment batch created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
