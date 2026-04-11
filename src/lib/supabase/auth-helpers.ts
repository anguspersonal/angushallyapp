import { createSupabaseServerClient } from './server';
import { getSupabaseAdmin } from './admin';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export type AuthedRouteContext =
  | { ok: true; admin: SupabaseClient; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Standard auth gate for any authenticated API route.
 * Returns the service-role admin client and the authenticated user's ID.
 */
export async function requireAuth(): Promise<AuthedRouteContext> {
  const userClient = await createSupabaseServerClient();
  if (!userClient) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 },
      ),
    };
  }

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      ),
    };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Supabase admin not configured' },
        { status: 503 },
      ),
    };
  }

  return { ok: true, admin, userId: user.id };
}
