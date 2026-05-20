/**
 * Raindrop OAuth — authorize URL construction and authorization-code exchange.
 *
 * Both the GET `oauth/callback` and the POST `oauth/exchange` Route Handler
 * branches funnel through `exchangeAuthCode` so the token-persistence flow
 * lives in one place.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { upsertTokens } from './raindropRepository';

const RAINDROP_AUTHORIZE_URL = 'https://raindrop.io/oauth/authorize';
const RAINDROP_TOKEN_URL = 'https://raindrop.io/oauth/access_token';

interface RaindropOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

function readOAuthConfig(): RaindropOAuthConfig {
  const clientId = process.env.RAINDROP_CLIENT_ID;
  const clientSecret = process.env.RAINDROP_CLIENT_SECRET;
  const redirectUri = process.env.RAINDROP_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new HttpError(503, 'Raindrop not configured');
  }
  return { clientId, clientSecret, redirectUri };
}

export function buildAuthorizeUrl(userId: string): string {
  const { clientId, redirectUri } = readOAuthConfig();
  const state = Buffer.from(
    JSON.stringify({ userId, ts: Date.now() }),
  ).toString('base64url');
  return `${RAINDROP_AUTHORIZE_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
}

interface RaindropTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export async function exchangeAuthCode(
  admin: SupabaseClient,
  userId: string,
  code: string,
): Promise<void> {
  const { clientId, clientSecret, redirectUri } = readOAuthConfig();

  const tokenRes = await fetch(RAINDROP_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    throw new HttpError(502, 'Failed to exchange token');
  }

  const tokens = (await tokenRes.json()) as RaindropTokenResponse;
  await upsertTokens(
    admin,
    userId,
    tokens.access_token,
    tokens.refresh_token,
    tokens.expires_in,
  );
}
