import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const submissionId = formData.get('submission_id') as string | null;
    const evidenceType = formData.get('evidence_type') as string | null;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!submissionId) {
      return NextResponse.json({ error: 'submission_id is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Verify submission ownership
    const { data: submission } = await supabase
      .from('activation_submissions')
      .select('partner_id')
      .eq('id', submissionId)
      .single();

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.partner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${submissionId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage using admin client for bypass RLS
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from('evidence')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = adminClient.storage
      .from('evidence')
      .getPublicUrl(filename);

    // Calculate file hash (simplified)
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Save evidence record
    const { data: evidence, error: evidenceError } = await supabase
      .from('submission_evidence')
      .insert({
        submission_id: submissionId,
        evidence_type: evidenceType || 'general',
        file_name: file.name,
        file_path: filename,
        file_url: urlData.publicUrl,
        file_size: file.size,
        mime_type: file.type,
        file_hash_sha256: hash,
        storage_bucket: 'evidence',
        is_primary: false,
      })
      .select()
      .single();

    if (evidenceError) {
      console.error('Evidence record error:', evidenceError);
      return NextResponse.json({ error: evidenceError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: evidence,
      message: 'File uploaded successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
