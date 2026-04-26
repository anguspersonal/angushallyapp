import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const GATED_PREFIXES = [
  '/projects/timeline',
  '/projects/ai/text-analysis',
  '/admin',
  '/dashboard',
];

function isGated(pathname: string): boolean {
  return GATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(req: NextRequest) {
  const { response, user } = await updateSession(req);

  if (isGated(req.nextUrl.pathname) && !user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Run on everything except Next internals and static files so Supabase cookies
  // stay fresh on public routes too. Gating itself is enforced by `isGated`.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
