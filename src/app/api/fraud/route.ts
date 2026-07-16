import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const submissionId = searchParams.get('submission_id');
    const reviewed = searchParams.get('reviewed');

    let query = supabase
      .from('fraud_flags')
      .select(`
        *,
        submission:activation_submissions(
          id,
          submission_code,
          customer_name,
          customer_phone_normalized,
          activation_city,
          activation_date,
          partner:profiles!partner_id(id, full_name, email)
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (submissionId) {
      query = query.eq('submission_id', submissionId);
    }
    if (reviewed !== null) {
      query = query.eq('reviewed', reviewed === 'true');
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
