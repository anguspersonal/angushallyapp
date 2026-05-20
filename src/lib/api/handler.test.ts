import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  HttpError,
  authedHandler,
  publicHandler,
  type Validator,
} from './handler';

type SupabaseStub = { auth: { getUser: ReturnType<typeof vi.fn> } };

function makeRequest(body?: unknown, opts: { malformed?: boolean } = {}): NextRequest {
  return {
    json: async () => {
      if (opts.malformed) throw new Error('bad json');
      return body;
    },
  } as unknown as NextRequest;
}

function makeUserClient(
  user: { id: string } | null = { id: 'user-123' },
  error: Error | null = null,
): SupabaseStub {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error }),
    },
  };
}

const adminStub = { __admin: true } as never;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getSupabaseAdmin).mockReturnValue(adminStub);
  vi.mocked(createSupabaseServerClient).mockResolvedValue(makeUserClient() as never);
});

// publicHandler ----------------------------------------------------------------

describe('publicHandler', () => {
  it('runs the handler and returns its value as JSON', async () => {
    const handler = publicHandler(async () => ({ hello: 'world' }));
    const res = await handler(makeRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ hello: 'world' });
  });

  it('exposes the admin client to the handler when configured', async () => {
    const handler = publicHandler(async ({ admin }) => ({ adminPresent: admin !== null }));
    const res = await handler(makeRequest());
    expect(await res.json()).toEqual({ adminPresent: true });
  });

  it('passes null admin when supabase is not configured', async () => {
    vi.mocked(getSupabaseAdmin).mockReturnValue(null);
    const handler = publicHandler(async ({ admin }) => ({ adminPresent: admin !== null }));
    const res = await handler(makeRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ adminPresent: false });
  });

  it('does not call createSupabaseServerClient (no auth)', async () => {
    const handler = publicHandler(async () => ({ ok: true }));
    await handler(makeRequest());
    expect(createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it('passes through a NextResponse returned by the handler', async () => {
    const handler = publicHandler(async () =>
      NextResponse.json({ custom: true }, { status: 201 }),
    );
    const res = await handler(makeRequest());
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ custom: true });
  });
});

// HttpError mapping ------------------------------------------------------------

describe('HttpError mapping', () => {
  it('maps thrown HttpError to status + message JSON', async () => {
    const handler = publicHandler(async () => {
      throw new HttpError(404, 'Not found');
    });
    const res = await handler(makeRequest());
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('includes code in body when HttpError carries one', async () => {
    const handler = publicHandler(async () => {
      throw new HttpError(403, 'Forbidden', 'NOT_LINKED');
    });
    const res = await handler(makeRequest());
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Forbidden', code: 'NOT_LINKED' });
  });

  it('maps unknown thrown errors to 500 with generic message', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = publicHandler(async () => {
      throw new Error('boom');
    });
    const res = await handler(makeRequest());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

// Body validation --------------------------------------------------------------

describe('body validation', () => {
  it('returns 400 with errors array when validator returns errors', async () => {
    const validator: Validator<{ name: string }> = () => ({
      ok: false,
      errors: ['Name is required', 'Email is required'],
    });
    const handler = publicHandler({ body: validator }, async () => ({ ok: true }));
    const res = await handler(makeRequest({}));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      errors: ['Name is required', 'Email is required'],
    });
  });

  it('returns custom status when validator failure carries one', async () => {
    const validator: Validator<{ text: string }> = () => ({
      ok: false,
      error: 'Too long',
      status: 413,
    });
    const handler = publicHandler({ body: validator }, async () => ({ ok: true }));
    const res = await handler(makeRequest({ text: 'x' }));
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Too long' });
  });

  it('returns 400 for malformed JSON before validator runs', async () => {
    const validator = vi.fn();
    const handler = publicHandler(
      { body: validator as unknown as Validator<unknown> },
      async () => ({ ok: true }),
    );
    const res = await handler(makeRequest(undefined, { malformed: true }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid JSON payload' });
    expect(validator).not.toHaveBeenCalled();
  });

  it('passes validated data as a typed body to the handler', async () => {
    const validator: Validator<{ name: string }> = (raw) => ({
      ok: true,
      data: { name: (raw as { name: string }).name.trim() },
    });
    const handler = publicHandler({ body: validator }, async ({ body }) => ({
      received: body.name,
    }));
    const res = await handler(makeRequest({ name: '  Angus  ' }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ received: 'Angus' });
  });
});

// authedHandler ----------------------------------------------------------------

describe('authedHandler', () => {
  it('returns 503 when supabase user client cannot be constructed', async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(null);
    const handler = authedHandler(async () => ({ ok: true }));
    const res = await handler(makeRequest());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'Supabase not configured' });
  });

  it('returns 401 when there is no session', async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(makeUserClient(null) as never);
    const handler = authedHandler(async () => ({ ok: true }));
    const res = await handler(makeRequest());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Authentication required' });
  });

  it('returns 401 when getUser returns an error', async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      makeUserClient(null, new Error('jwt expired')) as never,
    );
    const handler = authedHandler(async () => ({ ok: true }));
    const res = await handler(makeRequest());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Authentication required' });
  });

  it('returns 503 when admin client is missing despite valid session', async () => {
    vi.mocked(getSupabaseAdmin).mockReturnValue(null);
    const handler = authedHandler(async () => ({ ok: true }));
    const res = await handler(makeRequest());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'Supabase not configured' });
  });

  it('runs the handler with userId and admin when authenticated', async () => {
    const handler = authedHandler(async ({ admin, userId }) => ({
      adminPresent: admin !== null,
      userId,
    }));
    const res = await handler(makeRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      adminPresent: true,
      userId: 'user-123',
    });
  });

  it('runs validators after auth succeeds', async () => {
    const validator: Validator<{ value: number }> = (raw) => ({
      ok: true,
      data: { value: (raw as { value: number }).value * 2 },
    });
    const handler = authedHandler(
      { body: validator },
      async ({ body, userId }) => ({ userId, doubled: body.value }),
    );
    const res = await handler(makeRequest({ value: 5 }));
    expect(await res.json()).toEqual({ userId: 'user-123', doubled: 10 });
  });

  it('skips validation when no body validator is configured', async () => {
    const handler = authedHandler(async ({ body }) => ({ body }));
    const res = await handler(makeRequest());
    expect(await res.json()).toEqual({});
  });
});

// params -----------------------------------------------------------------------

describe('route params', () => {
  it('resolves the params promise and passes through to the handler', async () => {
    const handler = publicHandler<{ id: string }>(async ({ params }) => ({
      id: params.id,
    }));
    const res = await handler(makeRequest(), {
      params: Promise.resolve({ id: 'abc' }),
    });
    expect(await res.json()).toEqual({ id: 'abc' });
  });

  it('defaults to empty params when ctx is undefined (static routes)', async () => {
    const handler = publicHandler(async ({ params }) => ({ params }));
    const res = await handler(makeRequest());
    expect(await res.json()).toEqual({ params: {} });
  });
});
