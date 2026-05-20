import { HttpError, authedHandler, publicHandler } from '@/lib/api/handler';
import {
  buildAuthorizeUrl,
  exchangeAuthCode,
} from '@/lib/raindrop/raindropOAuth';
import { userHasRaindropTokens } from '@/lib/raindrop/raindropRepository';
import { syncBookmarksForUser } from '@/lib/raindrop/raindropSync';

type Params = { path?: string[] };

export const GET = authedHandler<Params>(async ({ admin, userId, params, req }) => {
  const subpath = params.path?.join('/') ?? '';

  if (subpath === 'oauth/start') {
    return { authUrl: buildAuthorizeUrl(userId) };
  }

  if (subpath === 'oauth/callback') {
    const code = new URL(req.url).searchParams.get('code');
    if (!code) {
      throw new HttpError(400, 'Missing authorization code');
    }
    await exchangeAuthCode(admin, userId, code);
    return { message: 'Raindrop connected successfully' };
  }

  if (subpath === 'verify') {
    const isConnected = await userHasRaindropTokens(admin, userId);
    return { isConnected };
  }

  throw new HttpError(404, 'Not found');
});

export const POST = authedHandler<Params>(async ({ admin, userId, params, req }) => {
  const subpath = params.path?.join('/') ?? '';

  if (subpath === 'oauth/exchange') {
    let body: { code?: string };
    try {
      body = (await req.json()) as { code?: string };
    } catch {
      throw new HttpError(400, 'Invalid JSON payload');
    }
    if (!body.code) {
      throw new HttpError(400, 'Missing authorization code');
    }
    await exchangeAuthCode(admin, userId, body.code);
    return { message: 'Raindrop connected successfully' };
  }

  if (subpath === 'sync') {
    const { count } = await syncBookmarksForUser(admin, userId);
    return { message: 'Sync completed', count };
  }

  throw new HttpError(404, 'Not found');
});

const notImplemented = publicHandler(async () => {
  throw new HttpError(501, 'Not implemented');
});

export const PUT = notImplemented;
export const PATCH = notImplemented;
export const DELETE = notImplemented;
