import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get submission to find storage path
    const { data: submission } = await supabase
      .from('submissions')
      .select('submission_code, screenshot_download, screenshot_register, screenshot_rating')
      .eq('id', id)
      .single();

    if (!submission) {
      return NextResponse.json({ data: [] });
    }

    // Try to get screenshots from table
    const { data, error } = await supabase
      .from('screenshot_evidence')
      .select('id, evidence_type, storage_url, file_size, created_at')
      .eq('submission_id', id)
      .order('created_at', { ascending: true });

    // If table exists and has data, use it
    if (!error && data && data.length > 0) {
      const screenshots = data.map((s) => ({
        id: s.id,
        type: s.evidence_type,
        url: s.storage_url,
        file_size: s.file_size,
        created_at: s.created_at,
      }));
      return NextResponse.json({ data: screenshots });
    }

    // Fallback: build URLs from storage path with .jpg/.png/.webp attempt
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const code = submission.submission_code;
    const fallbackData = [];

    if (submission.screenshot_download && baseUrl) {
      fallbackData.push({
        id: `${code}-download`,
        type: 'Screenshot Download',
        url: `${baseUrl}/storage/v1/object/public/screenshots/${code}/download.jpg`,
        file_size: null,
        created_at: null,
      });
    }
    if (submission.screenshot_register && baseUrl) {
      fallbackData.push({
        id: `${code}-register`,
        type: 'Screenshot Registrasi',
        url: `${baseUrl}/storage/v1/object/public/screenshots/${code}/register.jpg`,
        file_size: null,
        created_at: null,
      });
    }
    if (submission.screenshot_rating && baseUrl) {
      fallbackData.push({
        id: `${code}-rating`,
        type: 'Screenshot Rating/Review',
        url: `${baseUrl}/storage/v1/object/public/screenshots/${code}/rating.jpg`,
        file_size: null,
        created_at: null,
      });
    }

    return NextResponse.json({ data: fallbackData });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ data: [], error: 'Internal server error' }, { status: 500 });
  }
}