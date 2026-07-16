import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get fraud flags for this submission
    const { data: flags, error: flagsError } = await supabase
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
      `)
      .eq('submission_id', id)
      .order('created_at', { ascending: false });

    if (flagsError) {
      console.error('Supabase error:', flagsError);
      return NextResponse.json({ error: flagsError.message }, { status: 500 });
    }

    // Get fraud checks
    const { data: checks, error: checksError } = await supabase
      .from('fraud_checks')
      .select(`
        *,
        rule:fraud_rules(id, rule_key, rule_name)
      `)
      .eq('submission_id', id)
      .order('created_at', { ascending: false });

    if (checksError) {
      console.error('Supabase error:', checksError);
      return NextResponse.json({ error: checksError.message }, { status: 500 });
    }

    // Get related submissions
    const { data: related, error: relatedError } = await supabase
      .from('related_submissions')
      .select(`
        *,
        related_submission:activation_submissions!related_submission_id(
          id,
          submission_code,
          customer_name,
          activation_date
        )
      `)
      .eq('submission_id', id);

    if (relatedError) {
      console.error('Supabase error:', relatedError);
      // Don't fail the whole request for this
    }

    return NextResponse.json({
      data: {
        flags,
        checks,
        related,
      },
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
