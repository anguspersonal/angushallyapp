import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Check if the request is for a protected route
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/projects/') || 
                          req.nextUrl.pathname.startsWith('/admin') ||
                          req.nextUrl.pathname.startsWith('/dashboard');
  
  if (isProtectedRoute) {
    const jwt = req.cookies.get('jwt_token');
    
    if (!jwt) {
      // Redirect to login if no JWT cookie is present
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/projects/:path*',
    '/admin/:path*',
    '/dashboard/:path*'
  ],
}; 