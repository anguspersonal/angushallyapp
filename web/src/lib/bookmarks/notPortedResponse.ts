import { NextResponse } from 'next/server';

/** Bookmarks / Raindrop / F5 / Instagram-intelligence cluster — not enabled on Vercel until ported from `server/bookmark-api`. */
export function bookmarksClusterNotPorted(): NextResponse {
  return NextResponse.json(
    {
      error: 'Bookmarks and related APIs are not enabled on this deployment',
      code: 'BOOKMARKS_CLUSTER_NOT_PORTED',
    },
    { status: 503 },
  );
}
