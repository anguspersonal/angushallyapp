import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';

// Raindrop's default access-token lifetime when `expires_in` is missing.
const DEFAULT_EXPIRES_IN_SECONDS = 1209600;

export async function upsertTokens(
  admin: SupabaseClient,
  userId: string,
  accessToken: string,
  refreshToken: string | null | undefined,
  expiresIn: number | null | undefined,
): Promise<void> {
  const expiresAt = new Date(
    Date.now() + (expiresIn ?? DEFAULT_EXPIRES_IN_SECONDS) * 1000,
  ).toISOString();

  const { error } = await admin
    .schema('raindrop')
    .from('tokens')
    .upsert(
      {
        user_id: userId,
        access_token: accessToken,
        refresh_token: refreshToken ?? null,
        expires_at: expiresAt,
      },
      { onConflict: 'user_id' },
    );

  if (error) {
    console.error('[raindrop] upsertTokens', error);
    throw new HttpError(500, 'Failed to save Raindrop tokens');
  }
}

export async function userHasRaindropTokens(
  admin: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .schema('raindrop')
    .from('tokens')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[raindrop] userHasRaindropTokens', error);
    throw new HttpError(500, 'Failed to check Raindrop connection');
  }
  return data != null;
}

export async function getRaindropAccessToken(
  admin: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await admin
    .schema('raindrop')
    .from('tokens')
    .select('access_token')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[raindrop] getRaindropAccessToken', error);
    throw new HttpError(500, 'Failed to read Raindrop tokens');
  }
  return data ? ((data as { access_token: string }).access_token ?? null) : null;
}
