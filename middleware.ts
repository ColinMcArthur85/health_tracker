/**
 * Next.js Middleware for Authentication
 * 
 * Protects /dashboard/* routes and /api/* routes
 * Allows unauthenticated access to /api/auth/* (NextAuth routes)
 */
import { auth } from './auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  
  const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isDashboard = nextUrl.pathname.startsWith('/dashboard');
  const isProtectedApi = nextUrl.pathname.startsWith('/api') && !isAuthRoute;
  const isSignInPage = nextUrl.pathname === '/auth/signin';
  
  // Allow auth routes (needed for signin/signout)
  if (isAuthRoute) {
    return NextResponse.next();
  }
  
  // If logged in and trying to access signin page, redirect to dashboard
  if (isLoggedIn && isSignInPage) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }
  
  // Protect dashboard routes
  if (isDashboard && !isLoggedIn) {
    const signInUrl = new URL('/auth/signin', nextUrl);
    signInUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }
  
  // Protect API routes (except auth routes)
  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  // Check for demo mode write restrictions
  if (isProtectedApi && session?.user?.isDemo) {
    const method = req.method;
    const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    
    // Allow read operations for demo users
    if (!isWriteMethod) {
      return NextResponse.next();
    }
    
    // Block write operations for demo users
    return NextResponse.json(
      { 
        error: 'Demo Mode Restriction', 
        message: 'Demo mode is read-only. Sign in as owner to make changes.',
        isDemo: true 
      },
      { status: 403 }
    );
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect dashboard and API routes
    '/dashboard/:path*',
    '/api/:path*',
    // Also handle signin redirect
    '/auth/signin',
  ],
};
