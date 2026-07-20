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
      .from('screenshot_evidence')
      .select('id, evidence_type, storage_url, file_size, created_at')
      .eq('submission_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const screenshots = (data || []).map((s) => ({
      id: s.id,
      type: s.evidence_type,
      url: s.storage_url,
      file_size: s.file_size,
      created_at: s.created_at,
    }));

    return NextResponse.json({ data: screenshots });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}