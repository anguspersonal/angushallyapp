import { requireAuth } from '@/lib/supabase/auth-helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Params = { path?: string[] };

export async function GET(_request: NextRequest, context: { params: Promise<Params> }) {
  const ctx = await requireAuth();
  if (!ctx.ok) return ctx.response;

  const { path } = await context.params;
  const subpath = path?.join('/') ?? '';

  // GET /api/raindrop/oauth/start
  if (subpath === 'oauth/start') {
    const clientId = process.env.RAINDROP_CLIENT_ID;
    const redirectUri = process.env.RAINDROP_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: 'Raindrop not configured' }, { status: 503 });
    }
    const state = Buffer.from(JSON.stringify({ userId: ctx.userId, ts: Date.now() })).toString('base64url');
    const authUrl = `https://raindrop.io/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
    return NextResponse.json({ authUrl });
  }

  // GET /api/raindrop/oauth/callback
  if (subpath === 'oauth/callback') {
    const url = new URL(_request.url);
    const code = url.searchParams.get('code');
    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const clientId = process.env.RAINDROP_CLIENT_ID;
    const clientSecret = process.env.RAINDROP_CLIENT_SECRET;
    const redirectUri = process.env.RAINDROP_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Raindrop not configured' }, { status: 503 });
    }

    const tokenRes = await fetch('https://raindrop.io/oauth/access_token', {
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
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 502 });
    }

    const tokens = await tokenRes.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 1209600) * 1000).toISOString();

    const { error } = await ctx.admin
      .schema('raindrop')
      .from('tokens')
      .upsert({
        user_id: ctx.userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('[raindrop] save tokens', error);
      return NextResponse.json({ error: 'Failed to save tokens' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Raindrop connected successfully' });
  }

  // GET /api/raindrop/verify
  if (subpath === 'verify') {
    const { data } = await ctx.admin
      .schema('raindrop')
      .from('tokens')
      .select('user_id')
      .eq('user_id', ctx.userId)
      .maybeSingle();

    return NextResponse.json({ isConnected: !!data });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request: NextRequest, context: { params: Promise<Params> }) {
  const ctx = await requireAuth();
  if (!ctx.ok) return ctx.response;

  const { path } = await context.params;
  const subpath = path?.join('/') ?? '';

  // POST /api/raindrop/oauth/exchange
  if (subpath === 'oauth/exchange') {
    let body: { code?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const code = body.code;
    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const clientId = process.env.RAINDROP_CLIENT_ID;
    const clientSecret = process.env.RAINDROP_CLIENT_SECRET;
    const redirectUri = process.env.RAINDROP_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Raindrop not configured' }, { status: 503 });
    }

    const tokenRes = await fetch('https://raindrop.io/oauth/access_token', {
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
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 502 });
    }

    const tokens = await tokenRes.json();
    const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 1209600) * 1000).toISOString();

    const { error } = await ctx.admin
      .schema('raindrop')
      .from('tokens')
      .upsert({
        user_id: ctx.userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('[raindrop] save tokens', error);
      return NextResponse.json({ error: 'Failed to save tokens' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Raindrop connected successfully' });
  }

  // POST /api/raindrop/sync
  if (subpath === 'sync') {
    const { data: tokenRow } = await ctx.admin
      .schema('raindrop')
      .from('tokens')
      .select('access_token')
      .eq('user_id', ctx.userId)
      .maybeSingle();

    if (!tokenRow) {
      return NextResponse.json({ error: 'Raindrop not connected' }, { status: 403 });
    }

    // Fetch bookmarks from Raindrop API
    const rdRes = await fetch('https://api.raindrop.io/rest/v1/raindrops/0?perpage=50&page=0', {
      headers: { Authorization: `Bearer ${tokenRow.access_token}` },
    });

    if (!rdRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Raindrop' }, { status: 502 });
    }

    const rdData = await rdRes.json();
    const items = rdData.items ?? [];

    let savedCount = 0;
    for (const item of items) {
      const { error } = await ctx.admin
        .schema('raindrop')
        .from('bookmarks')
        .upsert({
          user_id: ctx.userId,
          raindrop_id: String(item._id),
          title: item.title,
          link: item.link,
          tags: item.tags ?? [],
        }, { onConflict: 'user_id,raindrop_id' });

      if (!error) savedCount++;
    }

    return NextResponse.json({ message: 'Sync completed', count: savedCount });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
