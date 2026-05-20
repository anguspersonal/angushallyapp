import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import type { F5Assessment, BookmarkConfidenceRow } from './f5Scoring';

export async function listBookmarksForUser(
  admin: SupabaseClient,
  userId: string,
): Promise<Record<string, unknown>[]> {
  const { data, error } = await admin
    .schema('bookmarks')
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[bookmarks] listBookmarksForUser', error);
    throw new HttpError(500, 'Failed to fetch bookmarks');
  }
  return data ?? [];
}

export interface ExistingBookmarkRef {
  id: string | number;
}

export async function findBookmarkByUrl(
  admin: SupabaseClient,
  userId: string,
  url: string,
): Promise<ExistingBookmarkRef | null> {
  const { data, error } = await admin
    .schema('bookmarks')
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('url', url)
    .maybeSingle();

  if (error) {
    console.error('[bookmarks] findBookmarkByUrl', error);
    throw new HttpError(500, 'Failed to check existing bookmark');
  }
  return data ? { id: (data as { id: string | number }).id } : null;
}

export interface SharedBookmarkInput {
  url: string;
  title: string;
}

export async function createSharedBookmark(
  admin: SupabaseClient,
  userId: string,
  input: SharedBookmarkInput,
): Promise<Record<string, unknown>> {
  const { data, error } = await admin
    .schema('bookmarks')
    .from('bookmarks')
    .insert({
      user_id: userId,
      url: input.url,
      title: input.title,
      source: 'share',
      processing_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('[bookmarks] createSharedBookmark', error);
    throw new HttpError(500, 'Failed to create bookmark');
  }
  if (!data) {
    throw new HttpError(500, 'Failed to create bookmark');
  }
  return data as Record<string, unknown>;
}

export interface BookmarkAssessmentRow {
  confidenceScores: Record<string, unknown> | null;
  intelligenceLevel: number | null;
  processingStatus: string | null;
}

export async function getBookmarkAssessment(
  admin: SupabaseClient,
  userId: string,
  bookmarkId: string,
): Promise<BookmarkAssessmentRow | null> {
  const { data, error } = await admin
    .schema('bookmarks')
    .from('bookmarks')
    .select('confidence_scores, intelligence_level, processing_status')
    .eq('id', bookmarkId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[bookmarks] getBookmarkAssessment', error);
    throw new HttpError(500, 'Failed to fetch bookmark assessment');
  }
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    confidenceScores:
      (row.confidence_scores as Record<string, unknown> | null) ?? null,
    intelligenceLevel: (row.intelligence_level as number | null) ?? null,
    processingStatus: (row.processing_status as string | null) ?? null,
  };
}

export async function listBookmarkConfidenceData(
  admin: SupabaseClient,
  userId: string,
): Promise<BookmarkConfidenceRow[]> {
  const { data, error } = await admin
    .schema('bookmarks')
    .from('bookmarks')
    .select('confidence_scores, intelligence_level')
    .eq('user_id', userId);

  if (error) {
    console.error('[bookmarks] listBookmarkConfidenceData', error);
    throw new HttpError(500, 'Failed to fetch stats');
  }
  return (data ?? []) as BookmarkConfidenceRow[];
}

export async function applyAssessmentToBookmark(
  admin: SupabaseClient,
  userId: string,
  bookmarkId: string,
  assessment: F5Assessment,
  intelligenceLevel: number,
): Promise<void> {
  const { error } = await admin
    .schema('bookmarks')
    .from('bookmarks')
    .update({
      confidence_scores: assessment,
      intelligence_level: intelligenceLevel,
      processing_status: 'assessed',
    })
    .eq('id', bookmarkId)
    .eq('user_id', userId);

  if (error) {
    console.error('[bookmarks] applyAssessmentToBookmark', error);
    throw new HttpError(500, 'Failed to update bookmark');
  }
}
