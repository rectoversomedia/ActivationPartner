import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/register', '/api/auth/login'];

// Routes that require admin role
const adminRoutes = ['/admin'];
const partnerRoutes = ['/partner'];
const picRoutes = ['/pic'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get('sb-access-token') ||
                        request.cookies.get('supabase-auth-token') ||
                        request.cookies.getAll().find(c => c.name.includes('auth-token'));

  // For demo purposes, allow access if no auth is configured
  // In production, you would check the session here
  if (!sessionCookie) {
    // Check if it's an API route (allow for now, API handles auth)
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Redirect to login for protected pages
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based routing (simplified for demo)
  // In production, you'd decode the JWT and check the role

  // Admin routes check
  if (pathname.startsWith('/admin')) {
    // For demo, allow access
    // In production: check if user has admin role
    return NextResponse.next();
  }

  // Partner routes check
  if (pathname.startsWith('/partner')) {
    return NextResponse.next();
  }

  // PIC routes check
  if (pathname.startsWith('/pic')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
