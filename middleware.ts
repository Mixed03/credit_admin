// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes (no auth required)
  const publicRoutes = [
    '/login', 
    '/api/auth/login', 
    '/api/auth/register',
    '/api/health',
  ];

  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For dashboard pages, check if user has token in cookie/header
  // But don't block - let the client-side handle it
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // For API routes, allow for now (we'll add proper auth later)
  // This allows the frontend to work without middleware blocking
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};