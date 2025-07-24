import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Admin routes that require admin role
  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // API routes that require authentication
  const protectedApiRoutes = ['/api/bookings', '/api/courts'];
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  // If it's a public route, allow access
  if (isPublicRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!token) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Verify the token
  const payload = await verifyToken(token);
  if (!payload) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Check admin access for admin routes
  if (isAdminRoute && payload.role !== 'admin') {
    if (isProtectedApiRoute) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Add user info to request headers for API routes
  if (isProtectedApiRoute) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.id.toString());
    requestHeaders.set('x-user-role', payload.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};