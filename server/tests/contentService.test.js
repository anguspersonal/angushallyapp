const {
  createContentService,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE,
  SORT_COLUMN_MAP,
  mapPostRow,
  MAX_PAGE_SIZE,
} = require('../services/contentService');
const { createContentServiceDeps, createContentRow } = require('./helpers/serviceMocks');

const baseRow = createContentRow();

function createServiceWithMock() {
  const { db, logger } = createContentServiceDeps();
  const service = createContentService({ db, logger });
  return { service, query: db.query, logger };
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
    expect(result.items[0]).toHaveProperty('publishedAt', '2024-01-01');
    expect(result.pagination.totalItems).toBe(1);
    expect(result.pagination.page).toBe(DEFAULT_PAGE);
    expect(result.pagination.pageSize).toBe(DEFAULT_PAGE_SIZE);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.hasMore).toBe(false);
  });

  test('listPosts reports hasMore and totalPages for deeper pages', async () => {
    const { service, query } = createServiceWithMock();
    query
      .mockResolvedValueOnce([
        createContentRow({ id: 2, slug: 'page-2' }),
        createContentRow({ id: 3, slug: 'page-2b' }),
      ])
      .mockResolvedValueOnce([{ total: '12' }]);

    const result = await service.listPosts({ page: 2, pageSize: 5, sortBy: 'createdAt' });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][1]).toEqual([5, 5]);
    expect(result.items).toHaveLength(2);
    expect(result.pagination).toMatchObject({
      totalItems: 12,
      page: 2,
      pageSize: 5,
      totalPages: 3,
      hasMore: true,
    });
  });

  test('listPosts handles last page and beyond with stable metadata', async () => {
    const { service, query } = createServiceWithMock();
    query
      .mockResolvedValueOnce([createContentRow({ id: 4, slug: 'last-page' })])
      .mockResolvedValueOnce([{ total: '6' }]);

    const result = await service.listPosts({ page: 3, pageSize: 2 });

    expect(result.items).toHaveLength(1);
    expect(result.pagination).toMatchObject({
      totalItems: 6,
      totalPages: 3,
      page: 3,
      hasMore: false,
    });

    query.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: '6' }]);
    const beyond = await service.listPosts({ page: 4, pageSize: 2 });
    expect(beyond.items).toEqual([]);
    expect(beyond.pagination).toMatchObject({
      totalItems: 6,
      totalPages: 3,
      page: 4,
      hasMore: false,
    });
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
    expect(params[1]).toBe(MAX_PAGE_SIZE);
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

  test('propagates db errors without mutating the contract', async () => {
    const { service, query } = createServiceWithMock();
    const failure = new Error('db unavailable');
    query.mockRejectedValueOnce(failure);

    await expect(service.listPosts({})).rejects.toBe(failure);
  });
});
