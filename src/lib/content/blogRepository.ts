import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { listPaginated } from '@/lib/api/listQuery';
import type {
  ContentListParams,
  ContentListResult,
  ContentPostDetail,
  ContentPostSummary,
} from '@/lib/content/contracts';

const SORT_COLUMN_MAP: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  title: 'title',
  id: 'id',
};

function normalizeAuthorId(value: unknown): string | number | null {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number') return value;
  return null;
}

function displayName(row: { first_name?: string | null; last_name?: string | null }): string {
  const fn = row.first_name?.trim();
  const ln = row.last_name?.trim();
  if (fn && ln) return `${fn} ${ln}`;
  if (fn) return fn;
  if (ln) return ln;
  return 'Unknown Author';
}

function mapPostRow(
  row: Record<string, unknown>,
  authorName: string | null,
): ContentPostSummary {
  return {
    id: row.id as string | number,
    slug: String(row.slug),
    title: String(row.title),
    excerpt: (row.excerpt as string) ?? null,
    coverImage: (row.cover_image as string) ?? null,
    altText: (row.alt_text as string) ?? null,
    attribution: (row.attribution as string) ?? null,
    attributionLink: (row.attribution_link as string) ?? null,
    tags: (row.tags as string[]) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? null,
    createdAt: row.created_at ? String(row.created_at) : null,
    publishedAt: row.published_at
      ? String(row.published_at)
      : row.created_at
        ? String(row.created_at)
        : null,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
    authorName,
    authorId: normalizeAuthorId(row.author_id),
  };
}

async function loadAuthorNames(
  admin: SupabaseClient,
  authorIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (authorIds.length === 0) return map;
  const { data, error } = await admin
    .schema('identity')
    .from('users')
    .select('id, first_name, last_name')
    .in('id', authorIds);
  if (error || !data) return map;
  for (const row of data) {
    map.set(String(row.id), displayName(row));
  }
  return map;
}

export async function listBlogPosts(
  admin: SupabaseClient,
  params: ContentListParams = {},
): Promise<ContentListResult> {
  const base = admin
    .schema('content')
    .from('posts')
    .select('*', { count: 'exact' });

  const { rows, pagination } = await listPaginated(base as never, params, {
    sortAllowlist: SORT_COLUMN_MAP,
    defaultSortColumn: 'created_at',
    defaultAscending: false,
    errorContext: 'posts',
  });

  const authorIds = [
    ...new Set(
      rows
        .map((row) => (row as { author_id?: unknown }).author_id)
        .filter((id): id is string => id != null && String(id).length > 0)
        .map(String),
    ),
  ];
  const authors = await loadAuthorNames(admin, authorIds);

  const items: ContentPostSummary[] = rows.map((row) => {
    const typed = row as Record<string, unknown>;
    const authorId = typed.author_id;
    return mapPostRow(
      typed,
      authorId ? (authors.get(String(authorId)) ?? null) : null,
    );
  });

  return { items, pagination };
}

export async function getBlogPostDetail(
  admin: SupabaseClient,
  identifier: string,
): Promise<ContentPostDetail | null> {
  const isNumeric = /^\d+$/.test(identifier);

  let query = admin.schema('content').from('posts').select('*');
  query = isNumeric ? query.eq('id', identifier) : query.eq('slug', identifier);

  const { data: row, error } = await query.maybeSingle();
  if (error) {
    console.error('[content] getBlogPostDetail', error);
    throw new HttpError(500, 'Failed to fetch post');
  }
  if (!row) return null;

  const authorIds = row.author_id ? [String(row.author_id)] : [];
  const authors = await loadAuthorNames(admin, authorIds);
  const authorName = row.author_id ? authors.get(String(row.author_id)) ?? null : null;

  return {
    ...mapPostRow(row, authorName),
    contentMarkdown: String(row.content_md ?? ''),
  };
}
