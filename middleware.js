import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function middleware(request) {
  console.log('Middleware called for path:', request.nextUrl.pathname);

  // Only run middleware for admin routes (except login)
  if (!request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname === '/admin') {
    console.log('Skipping middleware for non-admin route');
    return NextResponse.next();
  }

  const token = request.cookies.get('auth')?.value;
  console.log('Auth token present:', !!token);

  if (!token) {
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  try {
    // Verify the token using jose instead of jsonwebtoken
    const secret = new TextEncoder().encode(JWT_SECRET);
    await jwtVerify(token, secret);
    console.log('Token verified successfully');
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.redirect(new URL('/admin', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*']
};
