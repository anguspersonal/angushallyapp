const request = require('supertest');
const { createApp } = require('../bootstrap/createApp');
const config = require('../config');

describe('health checks', () => {
  test('/api/health returns ok', async () => {
    const app = createApp({ config });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('backend-ok');
  });

  test('/api/ready checks dependencies when provided', async () => {
    const db = { query: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const app = createApp({ config, db });
    const res = await request(app).get('/api/ready');
    expect(db.query).toHaveBeenCalledWith('SELECT 1');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });
});
