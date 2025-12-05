// @ts-check
/**
 * Content service encapsulating all content/blog data access and mapping.
 * Routes and controllers should consume this service rather than issuing
 * SQL directly.
 */

/** @typedef {import('../../shared/services/content/contracts').ContentListParams} ContentListParams */
/** @typedef {import('../../shared/services/content/contracts').ContentListResult} ContentListResult */
/** @typedef {import('../../shared/services/content/contracts').ContentPostDetail} ContentPostDetail */
/** @typedef {import('../../shared/services/content/contracts').ContentPostSummary} ContentPostSummary */

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE = 1;
const SORT_COLUMN_MAP = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  title: 'title',
  id: 'id',
};

function normalizeSort(sortBy) {
  return SORT_COLUMN_MAP[sortBy] ? SORT_COLUMN_MAP[sortBy] : SORT_COLUMN_MAP.createdAt;
}

function normalizeOrder(order) {
  return order && order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
}

function clampPageSize(value) {
  const parsed = parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

function parsePositiveInt(value, fallback) {
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Maps a raw database row into the shared ContentPostSummary contract.
 * @param {any} row
 * @returns {ContentPostSummary}
 */
function mapPostRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? null,
    coverImage: row.cover_image ?? null,
    altText: row.alt_text ?? null,
    attribution: row.attribution ?? null,
    attributionLink: row.attribution_link ?? null,
    tags: row.tags ?? null,
    metadata: row.metadata ?? null,
    createdAt: row.created_at ?? null,
    publishedAt: row.published_at ?? row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    authorName: row.author_name ?? null,
    authorId: row.author_id ?? null,
  };
}

/**
 * Factory for the content service.
 * @param {{ db: { query: Function }, logger?: Pick<Console, 'error' | 'debug'> }} deps
 */
function createContentService(deps) {
  const { db, logger = console } = deps;

  if (!db || typeof db.query !== 'function') {
    throw new Error('createContentService requires a db dependency with a query function');
  }

  /**
   * Lists posts with pagination and sorting.
   * @param {ContentListParams} [params]
   * @returns {Promise<ContentListResult>}
   */
  async function listPosts(params = {}) {
    const page = parsePositiveInt(params.page, DEFAULT_PAGE);
    const pageSize = clampPageSize(params.pageSize);
    const offset = (page - 1) * pageSize;
    const sortColumn = normalizeSort(params.sortBy);
    const order = normalizeOrder(params.order || 'desc');

    const postsQuery = `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.cover_image,
        p.alt_text,
        p.attribution,
        p.attribution_link,
        p.tags,
        p.metadata,
        p.created_at,
        p.updated_at,
        p.author_id,
        COALESCE(
          CASE
            WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL
            THEN u.first_name || ' ' || u.last_name
            WHEN u.first_name IS NOT NULL
            THEN u.first_name
            WHEN u.last_name IS NOT NULL
            THEN u.last_name
            ELSE 'Unknown Author'
          END
        ) as author_name
      FROM content.posts p
      LEFT JOIN identity.users u ON p.author_id = u.id
      ORDER BY p."${sortColumn}" ${order}
      LIMIT $1
      OFFSET $2;
    `;

    const posts = await db.query(postsQuery, [pageSize, offset]);
    const totalPostsResult = await db.query('SELECT COUNT(*) AS total FROM content.posts;');
    const total = totalPostsResult[0] ? parseInt(totalPostsResult[0].total, 10) : 0;
    const totalPages = Math.ceil(total / pageSize) || 0;

    return {
      items: posts.map(mapPostRow),
      pagination: {
        totalItems: total,
        page,
        pageSize,
        totalPages,
        hasMore: page * pageSize < total,
      },
    };
  }

  /**
   * Fetches a post by slug.
   * @param {string} slug
   * @returns {Promise<ContentPostDetail | null>}
   */
  async function getPostBySlug(slug) {
    const query = `
      SELECT
        p.*,
        COALESCE(
          CASE
            WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL
            THEN u.first_name || ' ' || u.last_name
            WHEN u.first_name IS NOT NULL
            THEN u.first_name
            WHEN u.last_name IS NOT NULL
            THEN u.last_name
            ELSE 'Unknown Author'
          END
        ) as author_name
      FROM content.posts p
      LEFT JOIN identity.users u ON p.author_id = u.id
      WHERE p.slug = $1;
    `;

    const results = await db.query(query, [slug]);
    if (!results || results.length === 0) return null;
    const [row] = results;
    return /** @type {ContentPostDetail} */ ({ ...mapPostRow(row), contentMarkdown: row.content_md });
  }

  /**
   * Fetches a post by numeric id.
   * @param {string | number} id
   * @returns {Promise<ContentPostDetail | null>}
   */
  async function getPostById(id) {
    const query = `
      SELECT
        p.*,
        COALESCE(
          CASE
            WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL
            THEN u.first_name || ' ' || u.last_name
            WHEN u.first_name IS NOT NULL
            THEN u.first_name
            WHEN u.last_name IS NOT NULL
            THEN u.last_name
            ELSE 'Unknown Author'
          END
        ) as author_name
      FROM content.posts p
      LEFT JOIN identity.users u ON p.author_id = u.id
      WHERE p.id = $1;
    `;

    const results = await db.query(query, [id]);
    if (!results || results.length === 0) return null;
    const [row] = results;
    return /** @type {ContentPostDetail} */ ({ ...mapPostRow(row), contentMarkdown: row.content_md });
  }

  return {
    listPosts,
    getPostBySlug,
    getPostById,
  };
}

module.exports = {
  createContentService,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  SORT_COLUMN_MAP,
  mapPostRow,
  MAX_PAGE_SIZE,
};
