import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

// NEXT.JS 16 PROTOCOL: Export function must be named 'proxy' or 'default'
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Define Protected Paths
  const isAdminPath = path.startsWith('/admin');
  const isAuthPath = path.startsWith('/auth');

  // 2. Check for the Pi Auth Token (Identity Handshake)
  const token = request.cookies.get('pi_auth_token')?.value;

  // 3. SECURITY LOGIC GATE
  // If trying to access Admin without an Auth session, redirect to Onboarding
  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url));
  }

  // If already logged in, don't show the onboarding page again
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Ensure the matcher is "Greedy" to catch mobile tunnel paths
export const config = {
  matcher: [
    '/admin/:path*', 
    '/auth/:path*', 
    '/dashboard/:path*',
    '/api/admin/:path*' // Explicitly include the API for mobile sync
  ],
};