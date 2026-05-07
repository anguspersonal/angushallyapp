import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { HttpError } from './httpError';

export { HttpError };

export type ValidatorFailure =
  | { ok: false; error: string; status?: number }
  | { ok: false; errors: string[]; status?: number };

export type ValidatorResult<T> = { ok: true; data: T } | ValidatorFailure;

export type Validator<T> = (raw: unknown) => ValidatorResult<T>;

interface BaseCtx<TBody, TParams> {
  body: TBody;
  params: TParams;
  req: NextRequest;
}

export interface PublicHandlerCtx<TBody, TParams> extends BaseCtx<TBody, TParams> {
  admin: SupabaseClient | null;
}

export interface AuthedHandlerCtx<TBody, TParams> extends BaseCtx<TBody, TParams> {
  admin: SupabaseClient;
  userId: string;
}

interface HandlerOptions<TBody> {
  body?: Validator<TBody>;
}

type HandlerReturn = unknown;

type RouteHandlerFn<TParams> = (
  req: NextRequest,
  ctx?: { params: Promise<TParams> },
) => Promise<Response>;

// publicHandler ----------------------------------------------------------------

export function publicHandler<TParams = Record<string, never>>(
  fn: (ctx: PublicHandlerCtx<undefined, TParams>) => Promise<HandlerReturn>,
): RouteHandlerFn<TParams>;
export function publicHandler<TBody, TParams = Record<string, never>>(
  options: HandlerOptions<TBody>,
  fn: (ctx: PublicHandlerCtx<TBody, TParams>) => Promise<HandlerReturn>,
): RouteHandlerFn<TParams>;
export function publicHandler<TBody, TParams>(
  optsOrFn:
    | HandlerOptions<TBody>
    | ((ctx: PublicHandlerCtx<undefined, TParams>) => Promise<HandlerReturn>),
  maybeFn?: (ctx: PublicHandlerCtx<TBody, TParams>) => Promise<HandlerReturn>,
): RouteHandlerFn<TParams> {
  const { options, fn } = unpackArgs<TBody, PublicHandlerCtx<TBody, TParams>>(
    optsOrFn as never,
    maybeFn as never,
  );
  return (req, ctx) =>
    runHandler<TBody, TParams>({
      req,
      ctx,
      options,
      requireSession: false,
      run: ({ admin, body, params }) =>
        fn({ admin, body, params, req } as PublicHandlerCtx<TBody, TParams>),
    });
}

// authedHandler ----------------------------------------------------------------

export function authedHandler<TParams = Record<string, never>>(
  fn: (ctx: AuthedHandlerCtx<undefined, TParams>) => Promise<HandlerReturn>,
): RouteHandlerFn<TParams>;
export function authedHandler<TBody, TParams = Record<string, never>>(
  options: HandlerOptions<TBody>,
  fn: (ctx: AuthedHandlerCtx<TBody, TParams>) => Promise<HandlerReturn>,
): RouteHandlerFn<TParams>;
export function authedHandler<TBody, TParams>(
  optsOrFn:
    | HandlerOptions<TBody>
    | ((ctx: AuthedHandlerCtx<undefined, TParams>) => Promise<HandlerReturn>),
  maybeFn?: (ctx: AuthedHandlerCtx<TBody, TParams>) => Promise<HandlerReturn>,
): RouteHandlerFn<TParams> {
  const { options, fn } = unpackArgs<TBody, AuthedHandlerCtx<TBody, TParams>>(
    optsOrFn as never,
    maybeFn as never,
  );
  return (req, ctx) =>
    runHandler<TBody, TParams>({
      req,
      ctx,
      options,
      requireSession: true,
      run: ({ admin, body, params, userId }) =>
        fn({
          admin: admin as SupabaseClient,
          body,
          params,
          req,
          userId: userId as string,
        } as AuthedHandlerCtx<TBody, TParams>),
    });
}

// internals --------------------------------------------------------------------

function unpackArgs<TBody, TCtx>(
  optsOrFn: HandlerOptions<TBody> | ((ctx: TCtx) => Promise<HandlerReturn>),
  maybeFn: ((ctx: TCtx) => Promise<HandlerReturn>) | undefined,
): { options: HandlerOptions<TBody>; fn: (ctx: TCtx) => Promise<HandlerReturn> } {
  if (typeof optsOrFn === 'function') {
    return { options: {}, fn: optsOrFn };
  }
  return { options: optsOrFn, fn: maybeFn as (ctx: TCtx) => Promise<HandlerReturn> };
}

interface RunArgs<TBody, TParams> {
  req: NextRequest;
  ctx: { params: Promise<TParams> } | undefined;
  options: HandlerOptions<TBody>;
  requireSession: boolean;
  run: (args: {
    admin: SupabaseClient | null;
    body: TBody;
    params: TParams;
    userId?: string;
  }) => Promise<HandlerReturn>;
}

async function runHandler<TBody, TParams>({
  req,
  ctx,
  options,
  requireSession,
  run,
}: RunArgs<TBody, TParams>): Promise<Response> {
  try {
    let userId: string | undefined;

    if (requireSession) {
      const userClient = await createSupabaseServerClient();
      if (!userClient) return jsonError(503, 'Supabase not configured');

      const {
        data: { user },
        error: authError,
      } = await userClient.auth.getUser();
      if (authError || !user) return jsonError(401, 'Authentication required');

      userId = user.id;
    }

    const admin = getSupabaseAdmin();
    if (requireSession && !admin) return jsonError(503, 'Supabase not configured');

    let body: TBody;
    if (options.body) {
      let raw: unknown;
      try {
        raw = await req.json();
      } catch {
        return jsonError(400, 'Invalid JSON payload');
      }
      const result = options.body(raw);
      if (!result.ok) return validatorFailureResponse(result);
      body = result.data;
    } else {
      body = undefined as TBody;
    }

    const params = (ctx ? await ctx.params : ({} as TParams)) as TParams;

    const result = await run({ admin, body, params, userId });

    if (result instanceof Response) return result;
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof HttpError) {
      return jsonError(err.status, err.message, err.code);
    }
    console.error('[handler] unexpected error', err);
    return jsonError(500, 'Internal server error');
  }
}

function jsonError(status: number, error: string, code?: string): NextResponse {
  return NextResponse.json(code ? { error, code } : { error }, { status });
}

function validatorFailureResponse(failure: ValidatorFailure): NextResponse {
  const status = failure.status ?? 400;
  if ('errors' in failure) {
    return NextResponse.json({ errors: failure.errors }, { status });
  }
  return NextResponse.json({ error: failure.error }, { status });
}
