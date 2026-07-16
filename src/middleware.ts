import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that need admin authentication
const PROTECTED_ROUTES = ['/superadmin', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/api/auth');

  // Skip auth check for login page and static files
  if (isAuthRoute || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // For protected routes, check session cookie
  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validate session
    try {
      const session = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());

      if (session.exp < Date.now()) {
        // Session expired, redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('admin_session');
        return response;
      }
    } catch {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/superadmin/:path*', '/login', '/api/auth/:path*'],
};
