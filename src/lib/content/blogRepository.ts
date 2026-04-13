import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ContentListParams,
  ContentListResult,
  ContentPostDetail,
  ContentPostSummary,
} from '@/lib/content/contracts';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE = 1;

const SORT_COLUMN_MAP: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  title: 'title',
  id: 'id',
};

function normalizeSort(sortBy?: string): string {
  return SORT_COLUMN_MAP[sortBy ?? ''] ? SORT_COLUMN_MAP[sortBy ?? ''] : 'created_at';
}

function clampPageSize(value?: number): number {
  const parsed = parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

function parsePositiveInt(value: number | undefined, fallback: number): number {
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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
): Promise<ContentListResult | null> {
  const page = parsePositiveInt(params.page, DEFAULT_PAGE);
  const pageSize = clampPageSize(params.pageSize);
  const offset = (page - 1) * pageSize;
  const sortColumn = normalizeSort(params.sortBy);
  const ascending = params.order === 'asc';

  const q = admin
    .schema('content')
    .from('posts')
    .select('*', { count: 'exact' })
    .order(sortColumn, { ascending })
    .range(offset, offset + pageSize - 1);

  const { data: rows, error, count } = await q;
  if (error) {
    console.error('[content] listBlogPosts', error);
    return null;
  }

  const authorIds = [
    ...new Set(
      (rows ?? [])
        .map((r) => r.author_id)
        .filter((id): id is string => id != null && String(id).length > 0)
        .map(String),
    ),
  ];
  const authors = await loadAuthorNames(admin, authorIds);

  const items: ContentPostSummary[] = (rows ?? []).map((row) =>
    mapPostRow(row, row.author_id ? authors.get(String(row.author_id)) ?? null : null),
  );

  const total = typeof count === 'number' ? count : items.length;
  const totalPages = Math.ceil(total / pageSize) || 0;

  return {
    items,
    pagination: {
      totalItems: total,
      page,
      pageSize,
      totalPages,
      hasMore: page * pageSize < total,
    },
  };
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
    return null;
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
