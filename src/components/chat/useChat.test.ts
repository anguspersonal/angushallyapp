/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useChat } from './useChat';

/**
 * Behaviour tests for `useChat`'s request shape (#139, C0).
 *
 * Scope: the persona-aware addition — that `send()` resolves the current
 * route's surface through the shared registry and carries it in the POST body
 * so the server can layer the persona block. We fake `fetch` and inspect the
 * request body; we do NOT exercise the SSE stream (covered by the route tests).
 */

type CapturedRequest = { url: string; body: Record<string, unknown> };

/** A minimal fetch stub: returns a response whose body stream ends
 *  immediately, so the hook's reader loop exits cleanly without a `done`. */
function stubFetch(captured: CapturedRequest[]): typeof fetch {
  return vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
    captured.push({
      url: String(_url),
      body: JSON.parse(String(init?.body ?? '{}')),
    });
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.close();
      },
    });
    return new Response(stream, {
      status: 200,
      headers: { 'content-type': 'text/event-stream' },
    });
  }) as unknown as typeof fetch;
}

function setPathname(pathname: string): void {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...window.location, pathname },
  });
}

describe('useChat request body — surface (#139)', () => {
  let captured: CapturedRequest[];
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    captured = [];
    global.fetch = stubFetch(captured);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    vi.clearAllMocks();
  });

  it('carries the resolved surface on a persona route', async () => {
    setPathname('/dev'); // `/dev` resolves to the `dev` surface in the registry
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.send('hello');
    });

    await waitFor(() => expect(captured.length).toBe(1));
    const body = captured[0].body;
    expect(body.route).toBe('/dev');
    expect(body.surface).toBe('dev');
  });

  it('carries the surface for a persona sub-route', async () => {
    setPathname('/dev/privacy'); // sub-routes resolve to the same surface
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.send('hello');
    });

    await waitFor(() => expect(captured.length).toBe(1));
    expect(captured[0].body.surface).toBe('dev');
  });

  it('omits surface on a route with no surface (no-persona path unchanged)', async () => {
    setPathname('/about'); // not a surface route → undefined
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.send('hello');
    });

    await waitFor(() => expect(captured.length).toBe(1));
    const body = captured[0].body;
    expect(body.route).toBe('/about');
    expect('surface' in body).toBe(false);
  });
});
