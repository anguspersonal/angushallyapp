import { HttpError, authedHandler, publicHandler } from '@/lib/api/handler';
import {
  applyAssessmentToBookmark,
  getBookmarkAssessment,
  listBookmarkConfidenceData,
} from '@/lib/bookmarks/bookmarksRepository';
import {
  computeConfidenceStats,
  computeF5Assessment,
  intelligenceLevelForAssessment,
  validateBookmarkMetadata,
} from '@/lib/bookmarks/f5Scoring';

type Params = { path?: string[] };

export const GET = authedHandler<Params>(async ({ admin, userId, params }) => {
  const subpath = params.path?.join('/') ?? '';

  const bookmarkMatch = subpath.match(/^bookmark\/([^/]+)\/assessment$/);
  if (bookmarkMatch) {
    const bookmarkId = bookmarkMatch[1];
    const assessment = await getBookmarkAssessment(admin, userId, bookmarkId);
    if (!assessment) {
      throw new HttpError(404, 'Bookmark not found');
    }
    return { success: true, assessment };
  }

  if (subpath === 'bookmarks/confidence-stats') {
    const rows = await listBookmarkConfidenceData(admin, userId);
    return { success: true, stats: computeConfidenceStats(rows) };
  }

  throw new HttpError(404, 'Not found');
});

export const POST = authedHandler<Params>(async ({ admin, userId, params, req }) => {
  const subpath = params.path?.join('/') ?? '';

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }

  const metadata = (body.metadata ?? {}) as Record<string, unknown>;
  const context = (body.context ?? {}) as Record<string, unknown>;

  if (subpath === 'assess') {
    return { success: true, assessment: computeF5Assessment(metadata, context) };
  }

  const bookmarkAssessMatch = subpath.match(/^bookmark\/([^/]+)\/assess$/);
  if (bookmarkAssessMatch) {
    const bookmarkId = bookmarkAssessMatch[1];
    const assessment = computeF5Assessment(metadata, context);
    await applyAssessmentToBookmark(
      admin,
      userId,
      bookmarkId,
      assessment,
      intelligenceLevelForAssessment(assessment),
    );
    return { success: true, assessment };
  }

  if (subpath === 'validate') {
    return { success: true, validation: validateBookmarkMetadata(metadata) };
  }

  throw new HttpError(404, 'Not found');
});

const notImplemented = publicHandler(async () => {
  throw new HttpError(501, 'Not implemented');
});

export const PUT = notImplemented;
export const PATCH = notImplemented;
export const DELETE = notImplemented;
