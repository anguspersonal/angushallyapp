const InstagramIntelligenceService = require('../bookmark-api/instagramIntelligence');

jest.mock('../../config/env', () => ({
  openai: { apiKey: 'test-openai-key' },
  apify: { apiKey: 'test-apify-key' }
}));

jest.mock('../db', () => ({
  query: jest.fn()
}));

describe('InstagramIntelligenceService', () => {
  let service;
  beforeEach(() => {
    service = new InstagramIntelligenceService();
  });

  describe('isValidInstagramUrl', () => {
    it('returns true for valid Instagram reel URL', () => {
      expect(service.isValidInstagramUrl('https://www.instagram.com/reel/abc123/')).toBe(true);
    });
    it('returns false for invalid URL', () => {
      expect(service.isValidInstagramUrl('https://notinstagram.com/reel/abc123/')).toBe(false);
    });
  });

  describe('extractInstagramMetadata', () => {
    it('returns mock metadata for valid URL', async () => {
      const url = 'https://www.instagram.com/reel/abc123/';
      const metadata = await service.extractInstagramMetadata(url);
      expect(metadata).toHaveProperty('url', url);
      expect(metadata).toHaveProperty('caption');
      expect(metadata).toHaveProperty('hashtags');
    });
    it('throws error for invalid URL', async () => {
      await expect(service.extractInstagramMetadata('invalid-url')).rejects.toThrow('Invalid Instagram URL format');
    });
  });

  describe('formatMetadataForAnalysis', () => {
    it('returns formatted string', () => {
      const metadata = {
        url: 'https://www.instagram.com/reel/abc123/',
        caption: 'Test caption',
        hashtags: ['#a'],
        mentions: ['@b'],
        location: 'Loc',
        mediaType: 'reel',
        engagement: { likes: 1, comments: 2, shares: 3 },
        author: { username: 'user', followers: 10, following: 5 },
        timestamp: '2024-01-01T00:00:00Z'
      };
      const result = service.formatMetadataForAnalysis(metadata);
      expect(result).toContain('Test caption');
      expect(result).toContain('user');
    });
  });

  describe('parseAnalysisResponse', () => {
    it('returns parsed object from assistant message', () => {
      const mockMessages = {
        data: [
          { role: 'assistant', created_at: '2024-01-01T00:00:01Z', content: [{ text: { value: 'Analysis result' } }] },
          { role: 'user', created_at: '2024-01-01T00:00:00Z', content: [{ text: { value: 'User message' } }] }
        ]
      };
      const result = service.parseAnalysisResponse(mockMessages);
      expect(result.rawResponse).toBe('Analysis result');
      expect(result).toHaveProperty('parsedAt');
    });
    it('throws error if no assistant response', () => {
      const mockMessages = { data: [] };
      expect(() => service.parseAnalysisResponse(mockMessages)).toThrow('No assistant response found');
    });
  });
}); 