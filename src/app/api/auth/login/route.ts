import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Get user profile with roles
    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles:user_roles(
          role:roles(*)
        )
      `)
      .eq('id', data.user.id)
      .single();

    return NextResponse.json({
      data: {
        user: data.user,
        profile,
        session: data.session,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
