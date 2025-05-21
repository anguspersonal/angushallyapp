const { expect } = require('chai');
const ogs = require('open-graph-scraper');
const { fetchMetadata, isValidUrl } = require('../bookmark-api/openGraph');

// Mock open-graph-scraper
jest.mock('open-graph-scraper');

describe('OpenGraph Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('URL Validation', () => {
    it('should validate correct HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).to.be.true;
      expect(isValidUrl('http://example.com/path?query=1')).to.be.true;
    });

    it('should validate correct HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).to.be.true;
      expect(isValidUrl('https://sub.example.com/path?query=1#hash')).to.be.true;
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).to.be.false;
      expect(isValidUrl('ftp://example.com')).to.be.false;
      expect(isValidUrl('')).to.be.false;
    });
  });

  describe('Metadata Fetching', () => {
    it('should fetch and normalize OpenGraph metadata', async () => {
      const mockResult = {
        result: {
          ogTitle: 'Test Title',
          ogDescription: 'Test Description',
          ogImage: [{ url: 'https://example.com/image.jpg' }],
          ogSiteName: 'Example Site',
          requestUrl: 'https://example.com/final-url'
        }
      };

      ogs.mockResolvedValue(mockResult);

      const metadata = await fetchMetadata('https://example.com');

      expect(metadata).to.deep.equal({
        title: 'Test Title',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
        site_name: 'Example Site',
        resolved_url: 'https://example.com/final-url',
        error: null
      });
    });

    it('should use fallback fields when OpenGraph tags are missing', async () => {
      const mockResult = {
        result: {
          twitterTitle: 'Twitter Title',
          twitterDescription: 'Twitter Description',
          twitterImage: [{ url: 'https://example.com/twitter-image.jpg' }],
          title: 'HTML Title',
          description: 'Meta Description',
          requestUrl: 'https://example.com'
        }
      };

      ogs.mockResolvedValue(mockResult);

      const metadata = await fetchMetadata('https://example.com');

      expect(metadata).to.deep.equal({
        title: 'Twitter Title',
        description: 'Twitter Description',
        image: 'https://example.com/twitter-image.jpg',
        site_name: null,
        resolved_url: 'https://example.com',
        error: null
      });
    });

    it('should handle network errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockError.code = 'ETIMEDOUT';
      
      ogs.mockRejectedValue(mockError);

      const metadata = await fetchMetadata('https://example.com');

      expect(metadata).to.deep.equal({
        title: null,
        description: null,
        image: null,
        site_name: null,
        resolved_url: 'https://example.com',
        error: {
          message: 'Network error',
          code: 'ETIMEDOUT'
        }
      });
    });

    it('should handle missing image arrays', async () => {
      const mockResult = {
        result: {
          ogTitle: 'Test Title',
          ogDescription: 'Test Description',
          // No image arrays provided
          ogSiteName: 'Example Site',
          requestUrl: 'https://example.com'
        }
      };

      ogs.mockResolvedValue(mockResult);

      const metadata = await fetchMetadata('https://example.com');

      expect(metadata.image).to.be.null;
    });
  });
}); 