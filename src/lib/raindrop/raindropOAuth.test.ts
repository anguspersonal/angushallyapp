import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { buildAuthorizeUrl, exchangeAuthCode } from './raindropOAuth';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  delete process.env.RAINDROP_CLIENT_ID;
  delete process.env.RAINDROP_CLIENT_SECRET;
  delete process.env.RAINDROP_REDIRECT_URI;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('buildAuthorizeUrl', () => {
  it('throws HttpError(503) when Raindrop env is unconfigured', () => {
    expect(() => buildAuthorizeUrl('user-1')).toThrow(HttpError);
    try {
      buildAuthorizeUrl('user-1');
    } catch (err) {
      expect(err).toMatchObject({ status: 503 });
    }
  });

  it('builds the expected authorize URL with embedded base64url state', () => {
    process.env.RAINDROP_CLIENT_ID = 'client-id';
    process.env.RAINDROP_CLIENT_SECRET = 'client-secret';
    process.env.RAINDROP_REDIRECT_URI = 'https://example.test/cb';

    const url = buildAuthorizeUrl('user-42');
    expect(url).toContain('https://raindrop.io/oauth/authorize');
    expect(url).toContain('client_id=client-id');
    expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.test%2Fcb');
    expect(url).toContain('response_type=code');
    expect(url).toMatch(/state=[A-Za-z0-9_-]+/);

    // The state should decode back to a JSON object containing the user id.
    const stateMatch = url.match(/state=([A-Za-z0-9_-]+)/);
    expect(stateMatch).not.toBeNull();
    const decoded = JSON.parse(
      Buffer.from(stateMatch![1], 'base64url').toString('utf-8'),
    );
    expect(decoded.userId).toBe('user-42');
    expect(typeof decoded.ts).toBe('number');
  });
});

describe('exchangeAuthCode', () => {
  it('throws HttpError(503) when Raindrop env is unconfigured', async () => {
    const admin = {} as SupabaseClient;
    await expect(exchangeAuthCode(admin, 'user-1', 'code')).rejects.toMatchObject({
      status: 503,
    });
  });
});
