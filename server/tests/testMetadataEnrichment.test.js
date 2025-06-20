const { expect } = require('chai');
const bookmarkService = require('../bookmark-api/bookmarkService');
const openGraph = require('../bookmark-api/openGraph');
const db = require('../db');

// Mock openGraph for metadata enrichment
jest.mock('../bookmark-api/openGraph');
const mockedOpenGraph = openGraph;

// Mock db for database operations
jest.mock('../db');
const mockedDb = db;

describe('Metadata Enrichment Pipeline Integration', () => {
  const mockUserId = 'user-123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('transferRaindropBookmarkToCanonical with metadata enrichment', () => {
    const mockRaindropBookmark = {
      id: 1,
      user_id: mockUserId,
      raindrop_id: 12345,
      title: 'Test Bookmark',
      link: 'https://example.com',
      description: 'Original description from Raindrop',
      tags: ['test', 'example'],
      created_at: new Date('2025-01-01T00:00:00Z'),
      is_organized: false
    };

    it('should enrich bookmark with OpenGraph metadata when available', async () => {
      // Mock successful OpenGraph metadata fetch
      const mockEnrichedMetadata = {
        title: 'Enhanced Title from Website',
        description: 'Enhanced description from website meta tags',
        image: 'https://example.com/image.jpg',
        site_name: 'Example Site',
        resolved_url: 'https://example.com/final-url',
        error: null
      };
      
      mockedOpenGraph.isValidUrl.mockReturnValue(true);
      mockedOpenGraph.fetchMetadata.mockResolvedValue(mockEnrichedMetadata);

      // Mock database operations
      mockedDb.query
        .mockResolvedValueOnce([]) // checkCanonicalBookmarkExists - no existing bookmark
        .mockResolvedValueOnce([{ 
          id: 'new-uuid', 
          title: 'Enhanced Title from Website',
          url: 'https://example.com',
          resolved_url: 'https://example.com/final-url',
          description: 'Enhanced description from website meta tags',
          image_url: 'https://example.com/image.jpg',
          site_name: 'Example Site',
          source_metadata: {
            metadata_enriched: true,
            metadata_source: 'opengraph'
          }
        }]) // INSERT
        .mockResolvedValueOnce([{ id: 1, is_organized: true }]); // UPDATE staging

      const result = await bookmarkService.transferRaindropBookmarkToCanonical(mockRaindropBookmark);

      // Verify the result includes enriched metadata
      expect(result).to.exist;
      expect(result.title).to.equal('Enhanced Title from Website');
      expect(result.resolved_url).to.equal('https://example.com/final-url');
      expect(result.description).to.equal('Enhanced description from website meta tags');
      expect(result.image_url).to.equal('https://example.com/image.jpg');
      expect(result.site_name).to.equal('Example Site');
      expect(result.source_metadata.metadata_enriched).to.be.true;
      expect(result.source_metadata.metadata_source).to.equal('opengraph');
    });

    it('should fall back to Raindrop data when OpenGraph enrichment fails', async () => {
      // Mock failed OpenGraph metadata fetch
      const mockFailedMetadata = {
        title: null,
        description: null,
        image: null,
        site_name: null,
        resolved_url: 'https://example.com',
        error: {
          message: 'Network timeout',
          code: 'ETIMEDOUT'
        }
      };
      
      mockedOpenGraph.isValidUrl.mockReturnValue(true);
      mockedOpenGraph.fetchMetadata.mockResolvedValue(mockFailedMetadata);

      // Mock database operations
      mockedDb.query
        .mockResolvedValueOnce([]) // checkCanonicalBookmarkExists - no existing bookmark
        .mockResolvedValueOnce([{ 
          id: 'new-uuid', 
          title: 'Test Bookmark',
          url: 'https://example.com',
          resolved_url: 'https://example.com',
          description: 'Original description from Raindrop',
          source_metadata: {
            metadata_enriched: false,
            metadata_error: {
              message: 'Network timeout',
              code: 'ETIMEDOUT'
            }
          }
        }]) // INSERT
        .mockResolvedValueOnce([{ id: 1, is_organized: true }]); // UPDATE staging

      const result = await bookmarkService.transferRaindropBookmarkToCanonical(mockRaindropBookmark);

      // Verify fallback to original Raindrop data
      expect(result).to.exist;
      expect(result.title).to.equal('Test Bookmark');
      expect(result.description).to.equal('Original description from Raindrop');
      expect(result.source_metadata.metadata_enriched).to.be.false;
      expect(result.source_metadata.metadata_error).to.exist;
    });

    it('should skip enrichment for invalid URLs', async () => {
      // Mock invalid URL
      mockedOpenGraph.isValidUrl.mockReturnValue(false);

      // Mock database operations
      mockedDb.query
        .mockResolvedValueOnce([]) // checkCanonicalBookmarkExists - no existing bookmark
        .mockResolvedValueOnce([{ 
          id: 'new-uuid', 
          title: 'Test Bookmark',
          url: 'https://example.com',
          description: 'Original description from Raindrop',
          source_metadata: {
            metadata_enriched: false,
            metadata_source: null,
            metadata_error: null
          }
        }]) // INSERT
        .mockResolvedValueOnce([{ id: 1, is_organized: true }]); // UPDATE staging

      const result = await bookmarkService.transferRaindropBookmarkToCanonical(mockRaindropBookmark);

      // Verify original data is used when URL is invalid
      expect(result).to.exist;
      expect(result.title).to.equal('Test Bookmark');
      expect(result.description).to.equal('Original description from Raindrop');
      expect(result.source_metadata.metadata_enriched).to.be.false;
      expect(result.source_metadata.metadata_source).to.be.null;
    });

    it('should handle OpenGraph fetch exceptions gracefully', async () => {
      // Mock OpenGraph to throw an exception
      mockedOpenGraph.isValidUrl.mockReturnValue(true);
      mockedOpenGraph.fetchMetadata.mockRejectedValue(new Error('Network error'));

      // Mock database operations
      mockedDb.query
        .mockResolvedValueOnce([]) // checkCanonicalBookmarkExists - no existing bookmark
        .mockResolvedValueOnce([{ 
          id: 'new-uuid', 
          title: 'Test Bookmark',
          url: 'https://example.com',
          description: 'Original description from Raindrop',
          source_metadata: {
            metadata_enriched: false,
            metadata_source: null,
            metadata_error: null
          }
        }]) // INSERT
        .mockResolvedValueOnce([{ id: 1, is_organized: true }]); // UPDATE staging

      const result = await bookmarkService.transferRaindropBookmarkToCanonical(mockRaindropBookmark);

      // Verify graceful fallback after exception
      expect(result).to.exist;
      expect(result.title).to.equal('Test Bookmark');
      expect(result.description).to.equal('Original description from Raindrop');
      expect(result.source_metadata.metadata_enriched).to.be.false;
    });
  });
}); 