import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type ParseJsonResult =
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse };

export async function parseRequestJson(request: NextRequest): Promise<ParseJsonResult> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 }),
    };
  }
}
