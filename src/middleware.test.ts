import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(),
}));

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { middleware } from './middleware';
import { updateSession } from '@/lib/supabase/middleware';

function makeRequest(pathname: string): NextRequest {
  const url = new URL(`http://localhost${pathname}`);
  return {
    nextUrl: url,
    url: url.toString(),
    cookies: { get: () => undefined, getAll: () => [] },
  } as unknown as NextRequest;
}

describe('middleware gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated users on /projects/timeline', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      response: NextResponse.next(),
      user: null,
    });

    const response = await middleware(makeRequest('/projects/timeline'));

    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('redirect=%2Fprojects%2Ftimeline');
  });

  it('redirects unauthenticated users on /projects/ai/text-analysis', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      response: NextResponse.next(),
      user: null,
    });

    const response = await middleware(makeRequest('/projects/ai/text-analysis'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/login');
  });

  it('lets authenticated users through on gated paths', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      response: NextResponse.next(),
      user: { id: 'user-123' } as any,
    });

    const response = await middleware(makeRequest('/projects/timeline'));

    expect(response.status).toBe(200);
  });

  it('does not redirect on public paths even when unauthenticated', async () => {
    vi.mocked(updateSession).mockResolvedValue({
      response: NextResponse.next(),
      user: null,
    });

    for (const path of ['/', '/about', '/blog', '/projects', '/projects/strava', '/contact', '/work-with-me', '/work-with-me/consulting']) {
      const response = await middleware(makeRequest(path));
      expect(response.status).toBe(200);
    }
  });
});
