import { HttpError, authedHandler, publicHandler } from '@/lib/api/handler';
import {
  createSharedBookmark,
  findBookmarkByUrl,
  listBookmarksForUser,
} from '@/lib/bookmarks/bookmarksRepository';

type Params = { path?: string[] };

export const GET = authedHandler<Params>(async ({ admin, userId, params }) => {
  const subpath = params.path?.join('/') ?? '';
  if (subpath === '') {
    const bookmarks = await listBookmarksForUser(admin, userId);
    return { bookmarks };
  }
  throw new HttpError(404, 'Not found');
});

export const POST = authedHandler<Params>(async ({ admin, userId, params, req }) => {
  const subpath = params.path?.join('/') ?? '';

  if (subpath === 'share') {
    let body: { url?: string; text?: string; title?: string };
    try {
      body = (await req.json()) as { url?: string; text?: string; title?: string };
    } catch {
      throw new HttpError(400, 'Invalid JSON');
    }

    const url = body.url?.trim();
    if (!url) {
      throw new HttpError(400, 'URL is required');
    }

    const existing = await findBookmarkByUrl(admin, userId, url);
    if (existing) {
      return {
        success: true,
        message: 'Bookmark already exists',
        duplicate: true,
        bookmark: existing,
      };
    }

    const created = await createSharedBookmark(admin, userId, {
      url,
      title: body.title ?? body.text ?? url,
    });
    return { success: true, message: 'Bookmark created', bookmark: created };
  }

  throw new HttpError(404, 'Not found');
});

const notImplemented = publicHandler(async () => {
  throw new HttpError(501, 'Not implemented');
});

export const PUT = notImplemented;
export const PATCH = notImplemented;
export const DELETE = notImplemented;
