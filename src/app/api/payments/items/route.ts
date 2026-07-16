import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const batchId = searchParams.get('batch_id');
    const partnerId = searchParams.get('partner_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('payment_batch_items')
      .select(`
        *,
        partner:profiles!partner_id(id, full_name, email),
        batch:payment_batches(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (batchId) {
      query = query.eq('batch_id', batchId);
    }
    if (partnerId) {
      query = query.eq('partner_id', partnerId);
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
