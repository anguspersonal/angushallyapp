const ogs = require('open-graph-scraper');
const { fetchMetadata, isValidUrl } = require('../bookmark-api/openGraph');

// Mock open-graph-scraper
jest.mock('open-graph-scraper');

describe('OpenGraph Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidUrl', () => {
    test('should return true for valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
    });

    test('should return false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(undefined)).toBe(false);
    });
  });

  describe('fetchMetadata', () => {
    test('should return metadata for valid URL', async () => {
      const mockResult = {
        result: {
          ogTitle: 'Test Title',
          ogDescription: 'Test Description',
          ogImage: { url: 'https://example.com/image.jpg' },
          ogSiteName: 'Test Site',
          requestUrl: 'https://example.com',
          success: true
        }
      };

      ogs.mockResolvedValue(mockResult);

      const result = await fetchMetadata('https://example.com');

      expect(result).toEqual({
        title: 'Test Title',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
        site_name: 'Test Site',
        resolved_url: 'https://example.com',
        error: null
      });
    });

    test('should handle errors gracefully', async () => {
      ogs.mockRejectedValue(new Error('Network error'));

      const result = await fetchMetadata('https://example.com');

      expect(result).toEqual({
        title: null,
        description: null,
        image: null,
        site_name: null,
        resolved_url: 'https://example.com',
        error: { message: 'Network error', code: 'UNKNOWN_ERROR' }
      });
    });

    test('should handle invalid URLs', async () => {
      const result = await fetchMetadata('invalid-url');

      expect(result).toEqual({
        title: null,
        description: null,
        image: null,
        site_name: null,
        resolved_url: null,
        error: { message: 'Invalid URL format', code: 'INVALID_URL' }
      });
    });

    test('should handle empty results', async () => {
      const mockResult = {
        result: {
          success: false
        }
      };

      ogs.mockResolvedValue(mockResult);

      const result = await fetchMetadata('https://example.com');

      expect(result).toEqual({
        title: null,
        description: null,
        image: null,
        site_name: null,
        resolved_url: 'https://example.com',
        error: null
      });
    });
  });
}); 