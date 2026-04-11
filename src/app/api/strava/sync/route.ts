import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { syncStravaForAllUsers } from '@/lib/strava/stravaSync';

/**
 * POST /api/strava/sync
 *
 * Invoked by Vercel Cron once per day (see vercel.json).
 * Protected by CRON_SECRET — Vercel sends `Authorization: Bearer ${CRON_SECRET}`
 * automatically when the env var is set on the project. For manual testing:
 *   curl -X POST http://localhost:3000/api/strava/sync \
 *        -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Supabase admin client not configured' },
      { status: 503 },
    );
  }

  try {
    const results = await syncStravaForAllUsers(admin);
    const totalUpserted = results.reduce((sum, r) => sum + r.activitiesUpserted, 0);
    const failures = results.filter((r) => r.error);

    console.log(
      `[strava/sync] synced ${results.length} user(s), ${totalUpserted} activities upserted, ${failures.length} failures`,
    );

    return NextResponse.json({
      ok: failures.length === 0,
      userCount: results.length,
      totalUpserted,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[strava/sync] fatal', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
