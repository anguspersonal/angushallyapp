import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import {
  applyAssessmentToBookmark,
  createSharedBookmark,
  findBookmarkByUrl,
  getBookmarkAssessment,
  listBookmarkConfidenceData,
  listBookmarksForUser,
} from './bookmarksRepository';
import type { F5Assessment } from './f5Scoring';

interface StubResult {
  data?: unknown;
  error?: unknown;
}

function supabaseStub(result: StubResult): SupabaseClient {
  const stub: Record<string, unknown> = {
    then: (resolve: (v: StubResult) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  for (const m of [
    'schema', 'from', 'select', 'eq', 'order', 'maybeSingle',
    'single', 'insert', 'update',
  ]) {
    stub[m] = vi.fn(() => stub);
  }
  return stub as unknown as SupabaseClient;
}

const SAMPLE_ASSESSMENT: F5Assessment = {
  overallScore: 90,
  confidenceLevel: 'EXCELLENT',
  breakdown: {
    sourceQuality: 100,
    completeness: 100,
    apiCompliance: 100,
    validation: 100,
  },
};

describe('listBookmarksForUser', () => {
  it('returns rows on success', async () => {
    const admin = supabaseStub({ data: [{ id: 1 }, { id: 2 }], error: null });
    expect(await listBookmarksForUser(admin, 'user-1')).toHaveLength(2);
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(listBookmarksForUser(admin, 'user-1')).rejects.toBeInstanceOf(
      HttpError,
    );
    consoleError.mockRestore();
  });
});

describe('findBookmarkByUrl', () => {
  it('returns ref when an existing bookmark matches', async () => {
    const admin = supabaseStub({ data: { id: 7 }, error: null });
    expect(await findBookmarkByUrl(admin, 'user-1', 'https://x.test')).toEqual({
      id: 7,
    });
  });

  it('returns null when no match (legitimate not-found)', async () => {
    const admin = supabaseStub({ data: null, error: null });
    expect(await findBookmarkByUrl(admin, 'user-1', 'https://x.test')).toBeNull();
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(
      findBookmarkByUrl(admin, 'user-1', 'https://x.test'),
    ).rejects.toMatchObject({ status: 500 });
    consoleError.mockRestore();
  });
});

describe('createSharedBookmark', () => {
  it('returns the inserted row on success', async () => {
    const admin = supabaseStub({
      data: { id: 1, url: 'https://x.test', title: 'Hi' },
      error: null,
    });
    const result = await createSharedBookmark(admin, 'user-1', {
      url: 'https://x.test',
      title: 'Hi',
    });
    expect(result).toMatchObject({ id: 1, url: 'https://x.test' });
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(
      createSharedBookmark(admin, 'user-1', { url: 'https://x.test', title: 'Hi' }),
    ).rejects.toBeInstanceOf(HttpError);
    consoleError.mockRestore();
  });

  it('throws HttpError(500) when insert returns no row', async () => {
    const admin = supabaseStub({ data: null, error: null });
    await expect(
      createSharedBookmark(admin, 'user-1', { url: 'https://x.test', title: 'Hi' }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});

describe('getBookmarkAssessment', () => {
  it('returns shaped assessment on success', async () => {
    const admin = supabaseStub({
      data: {
        confidence_scores: { overallScore: 90 },
        intelligence_level: 4,
        processing_status: 'assessed',
      },
      error: null,
    });
    expect(await getBookmarkAssessment(admin, 'user-1', '7')).toEqual({
      confidenceScores: { overallScore: 90 },
      intelligenceLevel: 4,
      processingStatus: 'assessed',
    });
  });

  it('returns null when no row exists (legitimate not-found)', async () => {
    const admin = supabaseStub({ data: null, error: null });
    expect(await getBookmarkAssessment(admin, 'user-1', '7')).toBeNull();
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(getBookmarkAssessment(admin, 'user-1', '7')).rejects.toMatchObject({
      status: 500,
    });
    consoleError.mockRestore();
  });
});

describe('listBookmarkConfidenceData', () => {
  it('returns rows on success', async () => {
    const admin = supabaseStub({
      data: [{ confidence_scores: { overallScore: 90 }, intelligence_level: 4 }],
      error: null,
    });
    expect(await listBookmarkConfidenceData(admin, 'user-1')).toHaveLength(1);
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(
      listBookmarkConfidenceData(admin, 'user-1'),
    ).rejects.toBeInstanceOf(HttpError);
    consoleError.mockRestore();
  });
});

describe('applyAssessmentToBookmark', () => {
  it('writes the expected payload', async () => {
    const update = vi.fn((..._args: unknown[]) => ({
      eq: vi.fn((..._a: unknown[]) => ({
        eq: vi.fn((..._b: unknown[]) => Promise.resolve({ data: null, error: null })),
      })),
    }));
    const from = vi.fn((..._args: unknown[]) => ({ update }));
    const schema = vi.fn((..._args: unknown[]) => ({ from }));
    const admin = { schema } as unknown as SupabaseClient;

    await applyAssessmentToBookmark(admin, 'user-1', '7', SAMPLE_ASSESSMENT, 4);

    expect(schema).toHaveBeenCalledWith('bookmarks');
    expect(from).toHaveBeenCalledWith('bookmarks');
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        confidence_scores: SAMPLE_ASSESSMENT,
        intelligence_level: 4,
        processing_status: 'assessed',
      }),
    );
  });

  it('throws HttpError(500) on Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(
      applyAssessmentToBookmark(admin, 'user-1', '7', SAMPLE_ASSESSMENT, 4),
    ).rejects.toBeInstanceOf(HttpError);
    consoleError.mockRestore();
  });
});
