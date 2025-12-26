const express = require('express');
const request = require('supertest');
const contentRouteFactory = require('../routes/contentRoute');
const { createMockLogger } = require('./helpers/serviceMocks');

const sampleResponse = {
  items: [{ id: 1, slug: 'hello-world', title: 'Hello World', excerpt: 'Intro' }],
  pagination: {
    totalItems: 1,
    pageSize: 10,
    page: 1,
    totalPages: 1,
    hasMore: false,
  },
};

describe('contentRoute integration (service-backed)', () => {
  function createApp(overrides = {}) {
    const app = express();
    const contentService = {
      listPosts: jest.fn().mockResolvedValue(sampleResponse),
      getPostById: jest.fn().mockResolvedValue(sampleResponse.items[0]),
      getPostBySlug: jest.fn().mockResolvedValue(sampleResponse.items[0]),
      ...overrides,
    };

    app.use('/api/content', contentRouteFactory({ contentService, logger: createMockLogger() }));
    return { app, contentService };
  }

  test('GET /posts delegates to service and returns payload', async () => {
    const { app, contentService } = createApp();
    const response = await request(app).get('/api/content/posts?pageSize=5&order=asc');

    expect(response.status).toBe(200);
    expect(contentService.listPosts).toHaveBeenCalledWith({
      pageSize: 5,
      page: undefined,
      sortBy: undefined,
      order: 'asc',
    });
    expect(response.body).toMatchObject({
      items: [{ slug: 'hello-world', title: 'Hello World', excerpt: 'Intro' }],
      pagination: {
        totalItems: 1,
        pageSize: 10,
        page: 1,
        totalPages: 1,
        hasMore: false,
      },
    });
    expect(response.body).not.toHaveProperty('error_class');
    expect(Object.keys(response.body)).toEqual(['items', 'pagination']);
  });

  test('GET /posts preserves pagination envelope across pages', async () => {
    const pagedResponse = {
      items: [
        { id: 2, slug: 'p2', title: 'Second page 1', excerpt: 'Later' },
        { id: 3, slug: 'p2b', title: 'Second page 2', excerpt: 'Later 2' },
      ],
      pagination: {
        totalItems: 12,
        pageSize: 5,
        page: 2,
        totalPages: 3,
        hasMore: true,
      },
    };
    const { app, contentService } = createApp({ listPosts: jest.fn().mockResolvedValue(pagedResponse) });

    const response = await request(app).get('/api/content/posts?page=2&pageSize=5');

    expect(response.status).toBe(200);
    expect(contentService.listPosts).toHaveBeenCalledWith({ page: 2, pageSize: 5, sortBy: undefined, order: undefined });
    expect(response.body.pagination).toEqual(pagedResponse.pagination);
    expect(response.body.items).toHaveLength(2);
    expect(Object.keys(response.body)).toEqual(['items', 'pagination']);
  });

  test('GET /posts keeps envelope stable on last and empty pages', async () => {
    const finalPageResponse = {
      items: [{ id: 4, slug: 'p3', title: 'Third page 1', excerpt: 'End' }],
      pagination: {
        totalItems: 6,
        pageSize: 2,
        page: 3,
        totalPages: 3,
        hasMore: false,
      },
    };
    const emptyPageResponse = { ...finalPageResponse, items: [], pagination: { ...finalPageResponse.pagination, page: 4 } };
    const { app, contentService } = createApp({
      listPosts: jest.fn().mockResolvedValueOnce(finalPageResponse).mockResolvedValueOnce(emptyPageResponse),
    });

    const lastPage = await request(app).get('/api/content/posts?page=3&pageSize=2');
    const beyond = await request(app).get('/api/content/posts?page=4&pageSize=2');

    expect(lastPage.status).toBe(200);
    expect(lastPage.body).toEqual(finalPageResponse);
    expect(beyond.status).toBe(200);
    expect(beyond.body.pagination).toMatchObject({ totalItems: 6, totalPages: 3, page: 4, hasMore: false });
    expect(Object.keys(beyond.body)).toEqual(['items', 'pagination']);
    expect(contentService.listPosts).toHaveBeenCalledTimes(2);
  });

  test('GET /posts returns stable error envelope when service rejects', async () => {
    const serviceError = { code: 'CONTENT_FETCH_FAILED', message: 'dependency blew up' };
    const { app, contentService } = createApp({ listPosts: jest.fn().mockRejectedValue(serviceError) });

    const response = await request(app).get('/api/content/posts');

    expect(contentService.listPosts).toHaveBeenCalledWith({
      page: undefined,
      pageSize: undefined,
      sortBy: undefined,
      order: undefined,
    });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to list posts', code: 'CONTENT_FETCH_FAILED' });
    expect(Object.keys(response.body)).toEqual(['error', 'code']);
  });

  test('GET /posts/:identifier resolves numeric ids', async () => {
    const { app, contentService } = createApp();
    const response = await request(app).get('/api/content/posts/1');

    expect(contentService.getPostById).toHaveBeenCalledWith(1);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Hello World');
  });

  test('GET /posts/:identifier resolves slugs', async () => {
    const { app, contentService } = createApp();
    await request(app).get('/api/content/posts/hello-world');
    expect(contentService.getPostBySlug).toHaveBeenCalledWith('hello-world');
  });

  test('GET /posts/:identifier returns 404 when missing', async () => {
    const { app, contentService } = createApp({ getPostBySlug: jest.fn().mockResolvedValue(null) });
    const response = await request(app).get('/api/content/posts/missing');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Post not found', code: 'CONTENT_NOT_FOUND' });
  });

  test('GET /posts/:identifier surfaces service errors without leaking internals', async () => {
    const error = { code: 'CONTENT_FETCH_FAILED', message: 'upstream down' };
    const { app, contentService } = createApp({ getPostBySlug: jest.fn().mockRejectedValue(error) });
    const response = await request(app).get('/api/content/posts/hello-world');

    expect(contentService.getPostBySlug).toHaveBeenCalledWith('hello-world');
    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({ code: 'CONTENT_FETCH_FAILED', error: 'Failed to load post' });
    expect(response.body).not.toHaveProperty('error_class');
    expect(Object.keys(response.body)).toEqual(['error', 'code']);
  });

  test('GET /posts/:identifier retains status code contract when service rejects', async () => {
    const error = { code: 'CONTENT_NOT_FOUND', message: 'missing' };
    const { app, contentService } = createApp({ getPostById: jest.fn().mockRejectedValue(error) });
    const response = await request(app).get('/api/content/posts/99');

    expect(contentService.getPostById).toHaveBeenCalledWith(99);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Post not found', code: 'CONTENT_NOT_FOUND' });
  });
});
