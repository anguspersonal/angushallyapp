import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null | undefined;

/**
 * Service-role client for trusted server Route Handlers only (never expose key to browser).
 * Returns null when env is not configured (caller should return 503 / migration message).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) {
    return cached;
  }
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    cached = null;
    return null;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function resetSupabaseAdminCacheForTests(): void {
  cached = undefined;
}
