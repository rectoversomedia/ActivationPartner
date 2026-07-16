import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Get sales and PICs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'sales', 'pics', or 'all'

    if (type === 'sales' || type === 'all' || !type) {
      const { data: sales } = await supabase
        .from('sales')
        .select('*')
        .order('name');

      if (type === 'sales') {
        return NextResponse.json({ data: sales || [] });
      }
    }

    if (type === 'pics' || type === 'all' || !type) {
      const { data: pics } = await supabase
        .from('pics')
        .select('*')
        .order('name');

      if (type === 'pics') {
        return NextResponse.json({ data: pics || [] });
      }

      if (type === 'all' || !type) {
        const { data: sales } = await supabase.from('sales').select('*').order('name');
        const { data: pics } = await supabase.from('pics').select('*').order('name');

        return NextResponse.json({
          sales: sales || [],
          pics: pics || [],
        });
      }
    }

    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create sales or PIC
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { type, name, phone } = body;

    if (!type || !name) {
      return NextResponse.json({ error: 'Type and name are required' }, { status: 400 });
    }

    const table = type === 'sales' ? 'sales' : 'pics';

    const { data, error } = await supabase
      .from(table)
      .insert({
        name,
        phone: phone || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: `${type} created successfully` }, { status: 201 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
