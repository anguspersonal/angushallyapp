const bookmarkService = require('../bookmark-api/bookmarkService');
const openGraph = require('../bookmark-api/openGraph');
const db = require('../db');

// Mock axios for API calls
jest.mock('axios');

// Mock open-graph-scraper
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

      expect(result).toEqual({
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
      });

      // Verify metadata enrichment was attempted
      expect(mockedOpenGraph.fetchMetadata).toHaveBeenCalledWith('https://example.com');
    });

    it('should fallback to original data when metadata fetch fails', async () => {
      // Mock failed OpenGraph metadata fetch
      const mockFailedMetadata = {
        title: null,
        description: null,
        image: null,
        site_name: null,
        resolved_url: null,
        error: 'Network timeout'
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
          image_url: null,
          site_name: null,
          source_metadata: {
            metadata_enriched: false,
            metadata_error: 'Network timeout'
          }
        }]) // INSERT
        .mockResolvedValueOnce([{ id: 1, is_organized: true }]); // UPDATE staging

      const result = await bookmarkService.transferRaindropBookmarkToCanonical(mockRaindropBookmark);

      expect(result).toEqual({
        id: 'new-uuid',
        title: 'Test Bookmark',
        url: 'https://example.com',
        resolved_url: 'https://example.com',
        description: 'Original description from Raindrop',
        image_url: null,
        site_name: null,
        source_metadata: {
          metadata_enriched: false,
          metadata_error: 'Network timeout'
        }
      });

      // Verify metadata enrichment was attempted
      expect(mockedOpenGraph.fetchMetadata).toHaveBeenCalledWith('https://example.com');
    });

    it('should skip metadata enrichment for invalid URLs', async () => {
      const invalidBookmark = {
        ...mockRaindropBookmark,
        link: 'invalid-url'
      };

      mockedOpenGraph.isValidUrl.mockReturnValue(false);

      // Mock database operations
      mockedDb.query
        .mockResolvedValueOnce([]) // checkCanonicalBookmarkExists - no existing bookmark
        .mockResolvedValueOnce([{ 
          id: 'new-uuid', 
          title: 'Test Bookmark',
          url: 'invalid-url',
          resolved_url: 'invalid-url',
          description: 'Original description from Raindrop',
          image_url: null,
          site_name: null,
          source_metadata: {
            metadata_enriched: false,
            metadata_error: 'Invalid URL format'
          }
        }]) // INSERT
        .mockResolvedValueOnce([{ id: 1, is_organized: true }]); // UPDATE staging

      const result = await bookmarkService.transferRaindropBookmarkToCanonical(invalidBookmark);

      expect(result).toEqual({
        id: 'new-uuid',
        title: 'Test Bookmark',
        url: 'invalid-url',
        resolved_url: 'invalid-url',
        description: 'Original description from Raindrop',
        image_url: null,
        site_name: null,
        source_metadata: {
          metadata_enriched: false,
          metadata_error: 'Invalid URL format'
        }
      });

      // Verify metadata enrichment was NOT attempted for invalid URL
      expect(mockedOpenGraph.fetchMetadata).not.toHaveBeenCalled();
    });
  });
}); 