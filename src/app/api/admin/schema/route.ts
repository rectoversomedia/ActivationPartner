import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST /api/admin/schema - Manage submissions table columns
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'check_columns') {
      // Try to read form_values column to see if it exists
      const { data, error } = await supabaseAdmin
        .from('submissions')
        .select('id, device_info, form_values')
        .limit(1);

      const formValuesExists = !error?.message?.includes('form_values');

      if (!formValuesExists) {
        return NextResponse.json({
          form_values_exists: false,
          error: error?.message || 'Column form_values does not exist',
          sql_statements: [
            'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_values JSONB;',
          ],
          instructions: [
            '1. Buka Supabase Dashboard → SQL Editor',
            '2. Jalankan: ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_values JSONB;',
            '3. Kembali ke tab Database di superadmin dan klik "Cek Ulang Kolom"',
          ],
        });
      }

      return NextResponse.json({
        form_values_exists: true,
        message: 'form_values column exists. New submissions will store dynamic form field values.',
      });
    }

    if (action === 'add_column') {
      // Try the update trick - if it fails with "form_values" in the error, column is missing
      const { error } = await supabaseAdmin
        .from('submissions')
        .update({ form_values: null })
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .select('id')
        .limit(1);

      if (error?.message?.includes('form_values')) {
        return NextResponse.json({
          column_added: false,
          needs_manual_sql: true,
          sql: 'ALTER TABLE submissions ADD COLUMN IF NOT EXISTS form_values JSONB;',
        });
      }

      return NextResponse.json({ column_added: true });
    }

    if (action === 'backfill_preview') {
      // Count submissions without form_values
      const { count, error } = await supabaseAdmin
        .from('submissions')
        .select('id', { count: 'exact', head: true })
        .is('form_values', null);

      // Sample device_info values for context
      const { data: samples } = await supabaseAdmin
        .from('submissions')
        .select('id, device_info, form_values')
        .is('form_values', null)
        .not('device_info', 'is', null)
        .limit(5);

      return NextResponse.json({
        submissions_needing_backfill: count || 0,
        sample_device_values: samples || [],
        note: 'Historical device_info comes from browser fingerprint. Cannot recover original dropdown values.',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Schema action error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
