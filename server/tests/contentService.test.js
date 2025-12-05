const {
  createContentService,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  SORT_COLUMN_MAP,
  mapPostRow,
  MAX_PAGE_SIZE,
} = require('../services/contentService');

const baseRow = {
  id: 1,
  slug: 'hello-world',
  title: 'Hello World',
  excerpt: 'Intro post',
  cover_image: null,
  alt_text: null,
  attribution: null,
  attribution_link: null,
  tags: ['intro'],
  metadata: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-02',
  author_name: 'Alex Kim',
  author_id: 'user-1',
  content_md: '# Hello',
};

function createServiceWithMock() {
  const query = jest.fn();
  const service = createContentService({ db: { query } });
  return { service, query };
}

describe('contentService', () => {
  test('mapPostRow maps snake_case DB row to camelCase domain object', () => {
    const mapped = mapPostRow(baseRow);
    expect(mapped).toMatchObject({
      slug: 'hello-world',
      authorName: 'Alex Kim',
      createdAt: '2024-01-01',
      publishedAt: '2024-01-01',
    });
    expect(mapped.coverImage).toBeNull();
  });

  test('listPosts returns mapped posts with pagination defaults', async () => {
    const { service, query } = createServiceWithMock();
    query
      .mockResolvedValueOnce([baseRow])
      .mockResolvedValueOnce([{ total: '1' }]);

    const result = await service.listPosts({});

    expect(query).toHaveBeenCalledTimes(2);
    const [postsSql, postsParams] = query.mock.calls[0];
    expect(postsSql).toContain(`ORDER BY p."${SORT_COLUMN_MAP.createdAt}" DESC`);
    expect(postsParams).toEqual([DEFAULT_PAGE_SIZE, 0]);
    expect(result.items[0]).toMatchObject({ slug: 'hello-world', authorName: 'Alex Kim' });
    expect(result.pagination.totalItems).toBe(1);
    expect(result.pagination.page).toBe(DEFAULT_PAGE);
    expect(result.pagination.hasMore).toBe(false);
  });

  test('listPosts honors sort and order while protecting allowed list', async () => {
    const { service, query } = createServiceWithMock();
    query
      .mockResolvedValueOnce([baseRow])
      .mockResolvedValueOnce([{ total: '1' }]);

    await service.listPosts({ sortBy: 'updatedAt', order: 'asc', pageSize: 5, page: 3 });

    const [postsSql] = query.mock.calls[0];
    expect(postsSql).toContain(`ORDER BY p."${SORT_COLUMN_MAP.updatedAt}" ASC`);
    expect(query.mock.calls[0][1]).toEqual([5, 10]);
  });

  test('listPosts coerces invalid sort to createdAt', async () => {
    const { service, query } = createServiceWithMock();
    query
      .mockResolvedValueOnce([baseRow])
      .mockResolvedValueOnce([{ total: '1' }]);

    await service.listPosts({ sortBy: 'DROP TABLE', order: 'asc' });
    const [postsSql] = query.mock.calls[0];
    expect(postsSql).toContain(`ORDER BY p."${SORT_COLUMN_MAP.createdAt}" ASC`);
  });

  test('listPosts clamps excessive pageSize', async () => {
    const { service, query } = createServiceWithMock();
    query.mockResolvedValueOnce([baseRow]).mockResolvedValueOnce([{ total: `${MAX_PAGE_SIZE + 5}` }]);

    await service.listPosts({ pageSize: MAX_PAGE_SIZE + 100, page: 2 });
    const [, params] = query.mock.calls[0];
    expect(params[0]).toBe(MAX_PAGE_SIZE);
  });

  test('getPostBySlug returns mapped detail or null', async () => {
    const { service, query } = createServiceWithMock();
    query.mockResolvedValueOnce([baseRow]);
    const post = await service.getPostBySlug('hello-world');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.slug = $1'), ['hello-world']);
    expect(post).toMatchObject({ contentMarkdown: '# Hello', slug: 'hello-world' });

    query.mockResolvedValueOnce([]);
    const missing = await service.getPostBySlug('missing');
    expect(missing).toBeNull();
  });

  test('getPostById returns mapped detail or null', async () => {
    const { service, query } = createServiceWithMock();
    query.mockResolvedValueOnce([baseRow]);
    const post = await service.getPostById(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.id = $1'), [1]);
    expect(post).toMatchObject({ id: 1, contentMarkdown: '# Hello' });

    query.mockResolvedValueOnce([]);
    const missing = await service.getPostById(99);
    expect(missing).toBeNull();
  });
});
