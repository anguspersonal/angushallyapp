const express = require('express');
const request = require('supertest');
const contentRouteFactory = require('../routes/contentRoute');

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

    app.use('/api/content', contentRouteFactory({ contentService, logger: { error: jest.fn() } }));
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
    expect(response.body.items[0].slug).toBe('hello-world');
    expect(response.body.pagination.hasMore).toBe(false);
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
  });
});
