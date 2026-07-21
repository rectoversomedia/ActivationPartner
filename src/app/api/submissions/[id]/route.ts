import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - Get single submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Parse JSON fields if needed
    const submission = {
      ...data,
      fraud_flags: typeof data.fraud_flags === 'string' ? JSON.parse(data.fraud_flags) : data.fraud_flags,
      fraud_reasons: typeof data.fraud_reasons === 'string' ? JSON.parse(data.fraud_reasons) : data.fraud_reasons,
      behavior_data: typeof data.behavior_data === 'string' ? JSON.parse(data.behavior_data) : data.behavior_data,
    };

    // Fetch screenshots from screenshot_evidence table
    const { data: evidenceRows } = await supabase
      .from("screenshot_evidence")
      .select("id, evidence_type, storage_url, file_size, created_at")
      .eq("submission_id", id)
      .order("created_at", { ascending: true });

    let screenshots: any[];
    if (evidenceRows && evidenceRows.length > 0) {
      screenshots = evidenceRows.map((r: any) => ({
        id: r.id,
        type: r.evidence_type,
        url: r.storage_url,
        file_size: r.file_size,
        created_at: r.created_at,
      }));
    } else {
      // Legacy fallback from boolean flags
      const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const slots = [
        { type: "Screenshot Download", flag: !!data.screenshot_download },
        { type: "Screenshot Registrasi", flag: !!data.screenshot_register },
        { type: "Screenshot Rating/Review", flag: !!data.screenshot_rating },
      ];
      screenshots = slots
        .filter(e => e.flag)
        .map(e => ({
          id: `${data.submission_code}-${e.type.split(" ")[1].toLowerCase()}`,
          type: e.type,
          url: `${baseUrl}/storage/v1/object/public/screenshots/${data.submission_code}/${e.type.split(" ")[1].toLowerCase()}.jpg`,
          pending: true,
        }));
    }
    submission.screenshots = screenshots;

    return NextResponse.json({ data: submission });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update submission status, QC notes, or fraud remarks
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { status, qc_notes, fraud_remarks, fraud_decision } = body;

    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // If updating status, validate it
    if (status && !['pending', 'valid', 'invalid', 'fraud'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    if (qc_notes !== undefined) {
      updateData.qc_notes = qc_notes;
    }

    if (fraud_remarks !== undefined) {
      updateData.fraud_remarks = fraud_remarks;
    }

    if (fraud_decision !== undefined) {
      updateData.fraud_decision = fraud_decision;
    }

    // Ensure at least one meaningful field is being updated (excluding updated_at)
    const meaningfulFields = ['status', 'qc_notes', 'fraud_remarks', 'fraud_decision'];
    const hasMeaningfulUpdate = meaningfulFields.some(field => body[field] !== undefined);

    if (!hasMeaningfulUpdate) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      message: 'Submission updated successfully',
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete submission (admin client bypasses RLS)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Use admin client to bypass RLS — INSERT/UPDATE/DELETE always need service role
    const supabase = supabaseAdmin;

    // Delete submission directly — skip SELECT check (avoids anon-key RLS issues)
    const { error: deleteErr, count } = await supabase
      .from('submissions')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (deleteErr) {
      console.error('Supabase delete error:', deleteErr);
      return NextResponse.json({ error: deleteErr.message }, { status: 500 });
    }

    if (!count || count === 0) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    console.log(`Deleted submission ${id}, rows removed: ${count}`);

    // Clean up screenshot_evidence (best-effort, non-critical)
    try {
      await supabase.from('screenshot_evidence').delete().eq('submission_id', id);
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ success: true, rowsRemoved: count });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
