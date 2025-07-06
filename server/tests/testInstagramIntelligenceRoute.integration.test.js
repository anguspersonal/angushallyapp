const request = require('supertest');
const express = require('express');

jest.mock('../middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

jest.mock('../bookmark-api/instagramIntelligence', () => {
  return jest.fn().mockImplementation(() => ({
    extractInstagramMetadata: jest.fn().mockResolvedValue({ url: 'mock', caption: 'c', hashtags: [], mentions: [], location: '', mediaType: 'reel', engagement: {}, author: {}, timestamp: '', extractedAt: '' }),
    analyzeWithOpenAI: jest.fn().mockResolvedValue({ threadId: 't', runId: 'r', analysis: {}, metadata: {}, analyzedAt: '' }),
    saveAnalysis: jest.fn().mockResolvedValue({ id: 1, user_id: 'test-user-id', instagram_url: 'mock', analysis_result: {}, analyzed_at: '' }),
    getAnalysisHistory: jest.fn().mockResolvedValue([{ id: 1 }])
  }));
});

jest.mock('../db', () => ({
  query: jest.fn((q, vals) => {
    if (q.includes('DELETE')) {
      if (vals[0] === '404') return { rows: [] };
      return { rows: [{ id: vals[0] }] };
    }
    if (q.includes('SELECT')) return { rows: [{ id: vals[0] }] };
    return { rows: [] };
  })
}));

const instagramIntelligenceRoute = require('../routes/instagramIntelligenceRoute');

const app = express();
app.use(express.json());
app.use('/api/instagram-intelligence', instagramIntelligenceRoute);

describe('Instagram Intelligence API', () => {
  describe('POST /analyze', () => {
    it('returns 200 and analysis for valid request', async () => {
      const res = await request(app)
        .post('/api/instagram-intelligence/analyze')
        .send({ instagramUrl: 'https://www.instagram.com/reel/abc123/' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('analysis');
    });
    it('returns 400 for missing instagramUrl', async () => {
      const res = await request(app)
        .post('/api/instagram-intelligence/analyze')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/instagramUrl/);
    });
  });

  describe('GET /history', () => {
    it('returns 200 and history', async () => {
      const res = await request(app)
        .get('/api/instagram-intelligence/history');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('history');
    });
  });

  describe('POST /extract-metadata', () => {
    it('returns 200 and metadata', async () => {
      const res = await request(app)
        .post('/api/instagram-intelligence/extract-metadata')
        .send({ instagramUrl: 'https://www.instagram.com/reel/abc123/' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('metadata');
    });
  });

  describe('DELETE /analysis/:id', () => {
    it('returns 200 for successful delete', async () => {
      const res = await request(app)
        .delete('/api/instagram-intelligence/analysis/1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('deletedAnalysis');
    });
    it('returns 404 if not found', async () => {
      const res = await request(app)
        .delete('/api/instagram-intelligence/analysis/404');
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/);
    });
  });
}); 