/**
 * Raindrop bookmark sync — pulls the latest 50 bookmarks via the Raindrop
 * REST API and upserts them into `raindrop.bookmarks`.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { getRaindropAccessToken } from './raindropRepository';

const RAINDROP_BOOKMARKS_URL =
  'https://api.raindrop.io/rest/v1/raindrops/0?perpage=50&page=0';

interface RaindropItem {
  _id: string | number;
  title?: string;
  link?: string;
  tags?: string[];
}

export interface RaindropSyncResult {
  count: number;
}

export async function syncBookmarksForUser(
  admin: SupabaseClient,
  userId: string,
): Promise<RaindropSyncResult> {
  const accessToken = await getRaindropAccessToken(admin, userId);
  if (!accessToken) {
    throw new HttpError(403, 'Raindrop not connected');
  }

  const rdRes = await fetch(RAINDROP_BOOKMARKS_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!rdRes.ok) {
    throw new HttpError(502, 'Failed to fetch from Raindrop');
  }

  const rdData = (await rdRes.json()) as { items?: RaindropItem[] };
  const items = rdData.items ?? [];

  let count = 0;
  for (const item of items) {
    const { error } = await admin
      .schema('raindrop')
      .from('bookmarks')
      .upsert(
        {
          user_id: userId,
          raindrop_id: String(item._id),
          title: item.title,
          link: item.link,
          tags: item.tags ?? [],
        },
        { onConflict: 'user_id,raindrop_id' },
      );
    if (!error) count++;
  }
  return { count };
}
