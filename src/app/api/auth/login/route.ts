import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Admin credentials (hardcoded for now - can move to DB later)
const ADMIN_CREDENTIALS = [
  { email: 'admin@rectoverso.id', password: 'Admin123!', role: 'super_admin', name: 'Super Admin' },
  { email: 'manager@rectoverso.id', password: 'Manager123!', role: 'campaign_manager', name: 'Campaign Manager' },
];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Debug: log the attempt
    console.log('Login attempt:', email);

    // Check credentials
    const admin = ADMIN_CREDENTIALS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (!admin) {
      console.log('Login failed: invalid credentials');
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login success:', admin.email);

    // Create session token (simple JWT-like token)
    const sessionToken = Buffer.from(JSON.stringify({
      email: admin.email,
      role: admin.role,
      name: admin.name,
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    })).toString('base64');

    const response = NextResponse.json({
      success: true,
      user: { email: admin.email, role: admin.role, name: admin.name },
    });

    // Set cookie
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: false, // Allow non-HTTPS for local development
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
