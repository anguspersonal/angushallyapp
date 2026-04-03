import { migrationInProgressResponse } from '@/lib/api/migrationUnavailable';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export type HabitRouteContext =
  | { ok: true; admin: SupabaseClient; userId: string }
  | { ok: false; response: NextResponse };

export async function requireHabitUserAndAdmin(): Promise<HabitRouteContext> {
  const userClient = await createSupabaseServerClient();
  if (!userClient) {
    return { ok: false, response: migrationInProgressResponse('habit') };
  }

  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();
  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return { ok: false, response: migrationInProgressResponse('habit') };
  }

  return { ok: true, admin, userId: user.id };
}
