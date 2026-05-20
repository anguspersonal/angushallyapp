import { describe, it, expect } from 'vitest';
import { ApiError } from './apiError';
import { readApiJson } from './readApiJson';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function textResponse(body: string, init: ResponseInit = {}): Response {
  return new Response(body, {
    headers: { 'content-type': 'text/plain' },
    ...init,
  });
}

describe('readApiJson — success path', () => {
  it('returns the parsed body for a 200 JSON response', async () => {
    const res = jsonResponse({ items: [1, 2, 3] });
    expect(await readApiJson<{ items: number[] }>(res)).toEqual({ items: [1, 2, 3] });
  });

  it('throws ApiError(INVALID_JSON) when a 200 body is not parseable', async () => {
    const res = new Response('not json', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
    await expect(readApiJson(res)).rejects.toMatchObject({
      status: 200,
      code: 'INVALID_JSON',
    });
  });
});

describe('readApiJson — error envelope decoding', () => {
  it('decodes { error, code } from a non-2xx JSON envelope', async () => {
    const res = jsonResponse(
      { error: 'Not connected', code: 'STRAVA_NOT_LINKED' },
      { status: 403 },
    );
    const err = await readApiJson(res).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({
      status: 403,
      code: 'STRAVA_NOT_LINKED',
      message: 'Not connected',
    });
  });

  it('decodes { error } without code, deriving code from status (404 → NOT_FOUND)', async () => {
    const res = jsonResponse({ error: 'Habit not found' }, { status: 404 });
    await expect(readApiJson(res)).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: 'Habit not found',
    });
  });

  it('decodes { error } without code, defaulting to HTTP_ERROR for non-404 statuses', async () => {
    const res = jsonResponse({ error: 'Internal' }, { status: 500 });
    await expect(readApiJson(res)).rejects.toMatchObject({
      status: 500,
      code: 'HTTP_ERROR',
    });
  });

  it('joins multi-field validation errors from { errors: [...] } into the message', async () => {
    const res = jsonResponse(
      { errors: ['Name is required', 'Email is required'] },
      { status: 400 },
    );
    await expect(readApiJson(res)).rejects.toMatchObject({
      status: 400,
      message: 'Name is required, Email is required',
    });
  });

  it('uses a text body as the message when not JSON', async () => {
    const res = textResponse('Server is having a bad day', { status: 502 });
    await expect(readApiJson(res)).rejects.toMatchObject({
      status: 502,
      message: 'Server is having a bad day',
      code: 'HTTP_ERROR',
    });
  });

  it('falls back to a generic status message when no body is parseable', async () => {
    const res = new Response('', {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
    await expect(readApiJson(res)).rejects.toMatchObject({
      status: 503,
      message: 'Request failed with status 503',
      code: 'HTTP_ERROR',
    });
  });
});

describe('readApiJson — ApiError shape', () => {
  it('the thrown error is an instance of both ApiError and Error', async () => {
    const res = jsonResponse({ error: 'Nope' }, { status: 401 });
    const err = await readApiJson(res).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(Error);
    expect((err as ApiError).name).toBe('ApiError');
  });

  it('exposes status and code as proper readonly fields (no @ts-expect-error needed)', async () => {
    const res = jsonResponse({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    const err = (await readApiJson(res).catch((e: unknown) => e)) as ApiError;
    expect(err.status).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });
});
