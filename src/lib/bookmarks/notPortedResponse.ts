import { NextResponse } from 'next/server';

/**
 * @deprecated All bookmark cluster APIs have been ported to Supabase.
 * This stub is kept only for any overlooked references.
 */
export function bookmarksClusterNotPorted(): NextResponse {
  return NextResponse.json(
    {
      error: 'This endpoint has been migrated. Please update your client.',
      code: 'ENDPOINT_MIGRATED',
    },
    { status: 410 },
  );
}
