import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Single campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Parse JSON fields
    const campaign = {
      ...data,
      fraud_rules: typeof data.fraud_rules === 'string' ? JSON.parse(data.fraud_rules) : (data.fraud_rules || {}),
      allowed_regions: typeof data.allowed_regions === 'string' ? JSON.parse(data.allowed_regions) : (data.allowed_regions || []),
      required_evidence: typeof data.required_evidence === 'string' ? JSON.parse(data.required_evidence) : (data.required_evidence || []),
      form_fields: typeof data.form_fields === 'string' ? JSON.parse(data.form_fields) : (data.form_fields || []),
    };

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Handle both JSON and FormData
    let body: any;
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body = {
        name: formData.get('name') as string,
        code: formData.get('code') as string,
        fee_per_activation: parseInt(formData.get('fee_per_activation') as string) || 5000,
        is_active: formData.get('is_active') === 'true',
        fraud_rules: JSON.parse((formData.get('fraud_rules') as string) || '{}'),
        required_evidence: JSON.parse((formData.get('required_evidence') as string) || '[]'),
        form_fields: JSON.parse((formData.get('form_fields') as string) || '[]'),
        flexible_urls: JSON.parse((formData.get('flexible_urls') as string) || '[]'),
        brand_logo_url: formData.get('brand_logo_url') as string || null,
      };

      // Handle logo file upload
      const logoFile = formData.get('brand_logo') as File | null;
      if (logoFile && logoFile.size > 0) {
        const fileName = `logos/${Date.now()}_${logoFile.name}`;
        const buffer = await logoFile.arrayBuffer();
        const { error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(fileName, buffer);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('brand-logos')
            .getPublicUrl(fileName);
          body.brand_logo_url = urlData.publicUrl;
        }
      }
    } else {
      body = await request.json();
    }

    // Ensure fraud_rules has proper structure
    const fraud_rules = {
      require_screenshot_download: true,
      require_screenshot_register: true,
      require_screenshot_rating: true,
      require_gps: true,
      check_duplicate_phone: true,
      check_duplicate_name: true,
      check_duplicate_email: true,
      check_gps_location: false,
      ...body.fraud_rules,
    };

    const { data, error } = await supabase
      .from('campaigns')
      .update({
        name: body.name,
        code: body.code?.toUpperCase(),
        fee_per_activation: body.fee_per_activation,
        brand_logo_url: body.brand_logo_url || null,
        flexible_urls: body.flexible_urls || [],
        fraud_rules: JSON.stringify(fraud_rules),
        allowed_regions: JSON.stringify(body.allowed_regions || []),
        required_evidence: JSON.stringify(body.required_evidence || []),
        form_fields: JSON.stringify(body.form_fields || []),
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Campaign updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
