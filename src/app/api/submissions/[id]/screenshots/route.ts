import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get submission with campaign code (joined) for path
    const { data: submission } = await supabase
      .from('submissions')
      .select('submission_code, campaign_id, screenshot_download, screenshot_register, screenshot_rating, campaigns:campaign_id(code)')
      .eq('id', id)
      .single();

    if (!submission) {
      return NextResponse.json({ data: [] });
    }

    // Try screenshot_evidence table first (most reliable — uses real stored URLs)
    const { data, error } = await supabase
      .from('screenshot_evidence')
      .select('id, evidence_type, storage_url, file_size, created_at')
      .eq('submission_id', id)
      .order('created_at', { ascending: true });

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

    // Fallback: probe Supabase Storage with HEAD requests on candidate paths
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!baseUrl) return NextResponse.json({ data: [] });

    const code = submission.submission_code;
    const campaignCode = (submission as any).campaigns?.code || 'default';
    const exts = ['jpg', 'jpeg', 'png', 'webp'];

    const probe = async (path: string): Promise<string | null> => {
      for (const ext of exts) {
        const url = `${baseUrl}/storage/v1/object/public/screenshots/${path}.${ext}`;
        try {
          const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
          if (res.ok) return url;
        } catch {}
      }
      return null;
    };

    const results: any[] = [];
    const checks = [
      { flag: submission.screenshot_download, evId: 'download', label: 'Screenshot Download' },
      { flag: submission.screenshot_register, evId: 'register', label: 'Screenshot Registrasi' },
      { flag: submission.screenshot_rating, evId: 'rating', label: 'Screenshot Rating/Review' },
    ];

    for (const c of checks) {
      if (!c.flag) continue;
      // New path: {campaignCode}/{submissionCode}/{evId}
      const newPath = await probe(`${campaignCode}/${code}/${c.evId}`);
      if (newPath) {
        results.push({ id: `${code}-${c.evId}`, type: c.label, url: newPath, file_size: null, created_at: null });
        continue;
      }
      // Legacy path: {submissionCode}/{evId} (submissions uploaded before path change)
      const oldPath = await probe(`${code}/${c.evId}`);
      if (oldPath) {
        results.push({ id: `${code}-${c.evId}`, type: c.label, url: oldPath, file_size: null, created_at: null });
      }
      // else: leave out — UI will show "Tidak ada screenshot"
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ data: [], error: 'Internal server error' }, { status: 500 });
  }
}