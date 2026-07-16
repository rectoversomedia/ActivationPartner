import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null });
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
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      user,
      profile,
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
