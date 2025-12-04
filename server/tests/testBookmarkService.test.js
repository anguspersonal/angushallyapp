jest.mock('../bookmark-api/raindropClient', () => ({
  raindropHttpClient: {
    get: jest.fn(),
  },
}));
const { raindropHttpClient } = require('../bookmark-api/raindropClient');
const bookmarkService = require('../bookmark-api/bookmarkService');
const db = require('../db');

const mockedHttpClient = raindropHttpClient;

// Mock db for database operations
jest.mock('../db');
const mockedDb = db;

describe('BookmarkService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Bookmark Fetching Functions', () => {
    const mockAccessToken = 'test-access-token';

    describe('getRaindropCollections', () => {
      it('should fetch collections successfully', async () => {
        const mockResponse = {
          data: {
            items: [
              { _id: 1, title: 'Collection 1' },
              { _id: 2, title: 'Collection 2' }
            ]
          }
        };

        mockedHttpClient.get.mockResolvedValue(mockResponse);

        const result = await bookmarkService.getRaindropCollections(mockAccessToken);

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          '/rest/v1/collections',
          {
            headers: {
              'Authorization': `Bearer ${mockAccessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        expect(result).toEqual(mockResponse.data.items);
      });

      it('should throw error when response format is invalid', async () => {
        const mockResponse = { data: {} };
        mockedHttpClient.get.mockResolvedValue(mockResponse);

        await expect(bookmarkService.getRaindropCollections(mockAccessToken))
          .rejects.toThrow('Invalid response format from Raindrop.io');
      });

      it('should handle API errors', async () => {
        const mockError = new Error('API Error');
        mockError.response = { data: { error: 'Unauthorized' } };
        mockedHttpClient.get.mockRejectedValue(mockError);

        await expect(bookmarkService.getRaindropCollections(mockAccessToken))
          .rejects.toThrow('API Error');
      });
    });

    describe('getRaindropBookmarksFromCollection', () => {
      it('should fetch bookmarks from collection successfully', async () => {
        const collectionId = '123';
        const mockResponse = {
          data: {
            items: [
              { _id: 'bookmark1', title: 'Test Bookmark 1', link: 'https://example1.com' },
              { _id: 'bookmark2', title: 'Test Bookmark 2', link: 'https://example2.com' }
            ]
          }
        };

        mockedHttpClient.get.mockResolvedValue(mockResponse);

        const result = await bookmarkService.getRaindropBookmarksFromCollection(mockAccessToken, collectionId);

        expect(mockedHttpClient.get).toHaveBeenCalledWith(
          `/rest/v1/raindrops/${collectionId}`,
          {
            headers: {
              'Authorization': `Bearer ${mockAccessToken}`,
              'Content-Type': 'application/json'
            },
            params: {
              perpage: 50,
              page: 0
            }
          }
        );

        expect(result).toEqual(mockResponse.data.items);
      });

      it('should handle empty collections', async () => {
        const mockResponse = { data: { items: [] } };
        mockedHttpClient.get.mockResolvedValue(mockResponse);

        const result = await bookmarkService.getRaindropBookmarksFromCollection(mockAccessToken, '123');
        expect(result).toEqual([]);
      });
    });

    describe('getAllRaindropBookmarks', () => {
      it('should fetch all bookmarks from all collections', async () => {
        const mockCollections = [
          { _id: 1, title: 'Collection 1' },
          { _id: 2, title: 'Collection 2' }
        ];

        const mockBookmarks1 = [
          { _id: 'bookmark1', title: 'Bookmark 1', link: 'https://example1.com' }
        ];

        const mockBookmarks2 = [
          { _id: 'bookmark2', title: 'Bookmark 2', link: 'https://example2.com' }
        ];

        // Mock getRaindropCollections
        mockedHttpClient.get
          .mockResolvedValueOnce({ data: { items: mockCollections } })
          .mockResolvedValueOnce({ data: { items: mockBookmarks1 } })
          .mockResolvedValueOnce({ data: { items: mockBookmarks2 } });

        const result = await bookmarkService.getAllRaindropBookmarks(mockAccessToken);

        expect(result).toHaveLength(2);
        expect(result).toEqual([...mockBookmarks1, ...mockBookmarks2]);
      });
    });
  });

  describe('Bookmark Saving Functions', () => {
    const mockUserId = 'user-123';
    const mockBookmark = {
      _id: 'raindrop-123',
      title: 'Test Bookmark',
      link: 'https://example.com',
      tags: ['test', 'example'],
      created: '2025-01-01T00:00:00Z'
    };

    describe('normalizeRaindropBookmark', () => {
      it('should normalize bookmark from Raindrop format', () => {
        const result = bookmarkService.normalizeRaindropBookmark(mockBookmark, mockUserId);

        expect(result).toEqual({
          user_id: mockUserId,
          raindrop_id: mockBookmark._id,
          title: mockBookmark.title,
          link: mockBookmark.link,
          tags: mockBookmark.tags,
          created_at: new Date(mockBookmark.created),
          is_organised: false
        });
      });

      it('should handle bookmarks without tags', () => {
        const bookmarkWithoutTags = { ...mockBookmark, tags: undefined };
        const result = bookmarkService.normalizeRaindropBookmark(bookmarkWithoutTags, mockUserId);

        expect(result.tags).toEqual([]);
      });
    });

    describe('saveRaindropBookmark', () => {
      it('should save a single bookmark successfully', async () => {
        const mockDbResult = [{ id: 1, ...mockBookmark }];
        mockedDb.query.mockResolvedValue(mockDbResult);

        const result = await bookmarkService.saveRaindropBookmark(mockBookmark, mockUserId);

        expect(mockedDb.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO raindrop.bookmarks'),
          expect.arrayContaining([
            mockUserId,
            mockBookmark._id,
            mockBookmark.title,
            mockBookmark.link,
            mockBookmark.tags,
            expect.any(Date),
            false
          ])
        );

        expect(result).toEqual(mockDbResult[0]);
      });

      it('should handle database errors', async () => {
        const mockError = new Error('Database error');
        mockedDb.query.mockRejectedValue(mockError);

        await expect(bookmarkService.saveRaindropBookmark(mockBookmark, mockUserId))
          .rejects.toThrow('Database error');
      });
    });

    describe('saveRaindropBookmarks', () => {
      it('should save multiple bookmarks in transaction', async () => {
        const mockBookmarks = [mockBookmark, { ...mockBookmark, _id: 'raindrop-456' }];
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce(undefined) // BEGIN
            .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // First INSERT
            .mockResolvedValueOnce({ rows: [{ id: 2 }] }) // Second INSERT
            .mockResolvedValueOnce(undefined), // COMMIT
          release: jest.fn()
        };

        mockedDb.pool = {
          connect: jest.fn().mockResolvedValue(mockClient)
        };

        const result = await bookmarkService.saveRaindropBookmarks(mockBookmarks, mockUserId);

        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
        expect(mockClient.release).toHaveBeenCalled();
        expect(result).toHaveLength(2);
      });

      it('should rollback transaction on error', async () => {
        const mockBookmarks = [mockBookmark];
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce(undefined) // BEGIN
            .mockRejectedValueOnce(new Error('Insert failed')) // INSERT fails
            .mockResolvedValueOnce(undefined), // ROLLBACK
          release: jest.fn()
        };

        mockedDb.pool = {
          connect: jest.fn().mockResolvedValue(mockClient)
        };

        await expect(bookmarkService.saveRaindropBookmarks(mockBookmarks, mockUserId))
          .rejects.toThrow('Insert failed');

        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();
      });
    });

    describe('getUserRaindropBookmarks', () => {
      it('should fetch user bookmarks successfully', async () => {
        const mockBookmarks = [
          { id: 1, title: 'Bookmark 1', user_id: mockUserId },
          { id: 2, title: 'Bookmark 2', user_id: mockUserId }
        ];

        mockedDb.query.mockResolvedValue(mockBookmarks);

        const result = await bookmarkService.getUserRaindropBookmarks(mockUserId);

        expect(mockedDb.query).toHaveBeenCalledWith(
          'SELECT * FROM raindrop.bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
          [mockUserId]
        );

        expect(result).toEqual(mockBookmarks);
      });

      it('should handle empty results', async () => {
        mockedDb.query.mockResolvedValue([]);

        const result = await bookmarkService.getUserRaindropBookmarks(mockUserId);
        expect(result).toEqual([]);
      });

      it('should handle database errors', async () => {
        const mockError = new Error('Database connection failed');
        mockedDb.query.mockRejectedValue(mockError);

        await expect(bookmarkService.getUserRaindropBookmarks(mockUserId))
          .rejects.toThrow('Database connection failed');
      });
    });
  });

  describe('Canonical Bookmark Operations', () => {
    const mockUserId = 'user-123';
    const mockEnrichedData = {
      user_id: mockUserId,
      title: 'Test Bookmark',
      url: 'https://example.com',
      resolved_url: 'https://example.com/final',
      description: 'A test bookmark description',
      image_url: 'https://example.com/image.jpg',
      image_alt: 'Test image',
      site_name: 'Example Site',
      tags: ['test', 'example'],
      source_type: 'raindrop',
      source_id: 'raindrop-123',
      source_metadata: { raindrop_id: 'raindrop-123' },
      is_organized: false,
      created_at: new Date('2025-01-01T00:00:00Z')
    };

    describe('createCanonicalBookmark', () => {
      it('should create a canonical bookmark successfully', async () => {
        const mockCreatedBookmark = {
          id: 'canonical-uuid-1',
          ...mockEnrichedData,
          created_at: new Date('2025-01-01T00:00:00Z'),
          updated_at: new Date()
        };

        mockedDb.query.mockResolvedValue([mockCreatedBookmark]);

        const result = await bookmarkService.createCanonicalBookmark(mockEnrichedData);

        expect(mockedDb.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO bookmarks.bookmarks'),
          expect.arrayContaining([
            mockUserId,
            mockEnrichedData.title,
            mockEnrichedData.url,
            mockEnrichedData.resolved_url,
            mockEnrichedData.description,
            mockEnrichedData.image_url,
            mockEnrichedData.image_alt,
            mockEnrichedData.site_name,
            mockEnrichedData.tags,
            mockEnrichedData.source_type,
            mockEnrichedData.source_id,
            mockEnrichedData.source_metadata,
            mockEnrichedData.is_organized,
            expect.any(Date),
            expect.any(Date)
          ])
        );

        expect(result).toEqual(mockCreatedBookmark);
      });

      it('should handle missing optional fields gracefully', async () => {
        const minimalData = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const mockCreatedBookmark = {
          id: 'canonical-uuid-1',
          ...minimalData,
          resolved_url: minimalData.url, // Should default to url
          description: null,
          image_url: null,
          image_alt: null,
          site_name: null,
          tags: [], // Should default to empty array
          source_metadata: {}, // Should default to empty object
          is_organized: false, // Should default to false
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        };

        mockedDb.query.mockResolvedValue([mockCreatedBookmark]);

        const result = await bookmarkService.createCanonicalBookmark(minimalData);

        expect(result).toEqual(mockCreatedBookmark);
      });

      it('should handle database errors', async () => {
        const mockError = new Error('Database constraint violation');
        mockedDb.query.mockRejectedValue(mockError);

        await expect(bookmarkService.createCanonicalBookmark(mockEnrichedData))
          .rejects.toThrow('Database constraint violation');
      });
    });

    describe('updateCanonicalBookmark', () => {
      const mockBookmarkId = 'canonical-uuid-1';
      const mockUpdateData = {
        title: 'Updated Title',
        description: 'Updated description',
        image_url: 'https://example.com/new-image.jpg',
        tags: ['updated', 'tags'],
        is_organized: true
      };

      it('should update a canonical bookmark successfully', async () => {
        const mockUpdatedBookmark = {
          id: mockBookmarkId,
          ...mockEnrichedData,
          ...mockUpdateData,
          updated_at: new Date()
        };

        mockedDb.query.mockResolvedValue([mockUpdatedBookmark]);

        const result = await bookmarkService.updateCanonicalBookmark(mockBookmarkId, mockUpdateData);

        expect(mockedDb.query).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE bookmarks.bookmarks'),
          expect.arrayContaining([
            mockUpdateData.title,
            undefined, // url not provided
            undefined, // resolved_url not provided
            mockUpdateData.description,
            mockUpdateData.image_url,
            undefined, // image_alt not provided
            undefined, // site_name not provided
            mockUpdateData.tags,
            undefined, // source_metadata not provided
            mockUpdateData.is_organized,
            mockBookmarkId
          ])
        );

        expect(result).toEqual(mockUpdatedBookmark);
      });

      it('should handle partial updates (only provided fields)', async () => {
        const partialUpdateData = {
          title: 'Only Title Update'
        };

        const mockUpdatedBookmark = {
          id: mockBookmarkId,
          ...mockEnrichedData,
          title: partialUpdateData.title,
          updated_at: new Date()
        };

        mockedDb.query.mockResolvedValue([mockUpdatedBookmark]);

        const result = await bookmarkService.updateCanonicalBookmark(mockBookmarkId, partialUpdateData);

        expect(result.title).toBe(partialUpdateData.title);
        // Other fields should remain unchanged
        expect(result.description).toBe(mockEnrichedData.description);
        expect(result.tags).toEqual(mockEnrichedData.tags);
      });

      it('should throw error if bookmark not found', async () => {
        mockedDb.query.mockResolvedValue([]);

        await expect(bookmarkService.updateCanonicalBookmark(mockBookmarkId, mockUpdateData))
          .rejects.toThrow(`Canonical bookmark with ID ${mockBookmarkId} not found`);
      });

      it('should handle database errors', async () => {
        const mockError = new Error('Update constraint violation');
        mockedDb.query.mockRejectedValue(mockError);

        await expect(bookmarkService.updateCanonicalBookmark(mockBookmarkId, mockUpdateData))
          .rejects.toThrow('Update constraint violation');
      });

      it('should handle null/undefined values in update data', async () => {
        const updateDataWithNulls = {
          title: null,
          description: undefined,
          tags: null
        };

        const mockUpdatedBookmark = {
          id: mockBookmarkId,
          ...mockEnrichedData,
          title: null,
          description: undefined,
          tags: null,
          updated_at: new Date()
        };

        mockedDb.query.mockResolvedValue([mockUpdatedBookmark]);

        const result = await bookmarkService.updateCanonicalBookmark(mockBookmarkId, updateDataWithNulls);

        expect(result).toEqual(mockUpdatedBookmark);
      });
    });
  });

  describe('Transfer Operations', () => {
    const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
    const mockBookmarkId = 1;

    describe('getUnorganizedRaindropBookmarks', () => {
      it('should return unorganized bookmarks for a user', async () => {
        const mockBookmarks = [
          {
            id: 1,
            user_id: mockUserId,
            raindrop_id: 12345,
            title: 'Test Bookmark 1',
            link: 'https://example.com/1',
            is_organized: false
          },
          {
            id: 2,
            user_id: mockUserId,
            raindrop_id: 12346,
            title: 'Test Bookmark 2',
            link: 'https://example.com/2',
            is_organized: false
          }
        ];

        mockedDb.query.mockResolvedValue(mockBookmarks);

        const result = await bookmarkService.getUnorganizedRaindropBookmarks(mockUserId);

        expect(mockedDb.query).toHaveBeenCalledWith(
          'SELECT * FROM raindrop.bookmarks WHERE user_id = $1 AND is_organized = false ORDER BY created_at ASC',
          [mockUserId]
        );
        expect(result).toEqual(mockBookmarks);
      });

      it('should handle database errors', async () => {
        const error = new Error('Database connection failed');
        mockedDb.query.mockRejectedValue(error);

        await expect(bookmarkService.getUnorganizedRaindropBookmarks(mockUserId))
          .rejects.toThrow('Database connection failed');
      });
    });

    describe('markRaindropBookmarkAsOrganized', () => {
      it('should mark a bookmark as organized', async () => {
        const mockUpdatedBookmark = {
          id: mockBookmarkId,
          user_id: mockUserId,
          raindrop_id: 12345,
          title: 'Test Bookmark',
          link: 'https://example.com',
          is_organized: true,
          updated_at: new Date()
        };

        mockedDb.query.mockResolvedValue([mockUpdatedBookmark]);

        const result = await bookmarkService.markRaindropBookmarkAsOrganized(mockBookmarkId);

        expect(mockedDb.query).toHaveBeenCalledWith(
          'UPDATE raindrop.bookmarks SET is_organized = true, updated_at = NOW() WHERE id = $1 RETURNING *',
          [mockBookmarkId]
        );
        expect(result).toEqual(mockUpdatedBookmark);
      });

      it('should throw error if bookmark not found', async () => {
        mockedDb.query.mockResolvedValue([]);

        await expect(bookmarkService.markRaindropBookmarkAsOrganized(mockBookmarkId))
          .rejects.toThrow(`Bookmark with ID ${mockBookmarkId} not found`);
      });

      it('should handle database errors', async () => {
        const error = new Error('Update failed');
        mockedDb.query.mockRejectedValue(error);

        await expect(bookmarkService.markRaindropBookmarkAsOrganized(mockBookmarkId))
          .rejects.toThrow('Update failed');
      });
    });

    describe('transferUnorganizedRaindropBookmarks', () => {
      const mockUnorganizedBookmarks = [
        {
          id: 1,
          user_id: mockUserId,
          raindrop_id: 12345,
          title: 'Test Bookmark 1',
          link: 'https://example.com/1',
          tags: ['test', 'example'],
          is_organized: false,
          created_at: new Date()
        },
        {
          id: 2,
          user_id: mockUserId,
          raindrop_id: 12346,
          title: 'Test Bookmark 2',
          link: 'https://example.com/2',
          tags: ['test'],
          is_organized: false,
          created_at: new Date()
        }
      ];

      const mockCanonicalBookmark = {
        id: 'canonical-uuid-1',
        user_id: mockUserId,
        title: 'Test Bookmark 1',
        url: 'https://example.com/1',
        source_type: 'raindrop',
        source_id: '12345',
        is_organized: false
      };

      it('should transfer all unorganized bookmarks successfully', async () => {
        // Set up mocks for the sequence of calls
        mockedDb.query
          // getUnorganizedRaindropBookmarks
          .mockResolvedValueOnce(mockUnorganizedBookmarks)
          // checkCanonicalBookmarkExists - first bookmark (not found)
          .mockResolvedValueOnce([])
          // transferRaindropBookmarkToCanonical - first bookmark (INSERT)
          .mockResolvedValueOnce([mockCanonicalBookmark])
          // transferRaindropBookmarkToCanonical - first bookmark (UPDATE staging)
          .mockResolvedValueOnce([{ id: 1, is_organized: true }])
          // checkCanonicalBookmarkExists - second bookmark (not found)
          .mockResolvedValueOnce([])
          // transferRaindropBookmarkToCanonical - second bookmark (INSERT)
          .mockResolvedValueOnce([{ ...mockCanonicalBookmark, id: 'canonical-uuid-2', title: 'Test Bookmark 2' }])
          // transferRaindropBookmarkToCanonical - second bookmark (UPDATE staging)
          .mockResolvedValueOnce([{ id: 2, is_organized: true }]);

        const result = await bookmarkService.transferUnorganizedRaindropBookmarks(mockUserId);

        expect(result).toEqual({
          success: 2,
          failed: 0,
          total: 2,
          errors: [],
          transferredBookmarks: [
            {
              stagingId: 1,
              canonicalId: 'canonical-uuid-1',
              title: 'Test Bookmark 1',
              enriched: false
            },
            {
              stagingId: 2,
              canonicalId: 'canonical-uuid-2',
              title: 'Test Bookmark 2',
              enriched: false
            }
          ],
          enrichmentStats: {
            enriched: 0,
            failed: 0,
            skipped: 0
          }
        });
      });

      it('should return empty result when no unorganized bookmarks exist', async () => {
        mockedDb.query.mockResolvedValueOnce([]); // getUnorganizedRaindropBookmarks

        const result = await bookmarkService.transferUnorganizedRaindropBookmarks(mockUserId);

        expect(result).toEqual({
          success: 0,
          failed: 0,
          total: 0,
          errors: [],
          message: 'No unorganized bookmarks found'
        });
      });

      it('should handle partial failures gracefully', async () => {
        // Set up mocks for partial failure scenario
        mockedDb.query
          // getUnorganizedRaindropBookmarks
          .mockResolvedValueOnce(mockUnorganizedBookmarks)
          // checkCanonicalBookmarkExists - first bookmark (not found)
          .mockResolvedValueOnce([])
          // transferRaindropBookmarkToCanonical - first bookmark (INSERT)
          .mockResolvedValueOnce([mockCanonicalBookmark])
          // transferRaindropBookmarkToCanonical - first bookmark (UPDATE staging)
          .mockResolvedValueOnce([{ id: 1, is_organized: true }])
          // checkCanonicalBookmarkExists - second bookmark (fails)
          .mockRejectedValueOnce(new Error('Transfer failed for second bookmark'));

        const result = await bookmarkService.transferUnorganizedRaindropBookmarks(mockUserId);

        expect(result.success).toBe(1);
        expect(result.failed).toBe(1);
        expect(result.total).toBe(2);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          bookmarkId: 2,
          title: 'Test Bookmark 2',
          error: 'Transfer failed for second bookmark',
          errorType: 'database'
        });
        expect(result.transferredBookmarks).toHaveLength(1);
      });

      it('should handle database errors in getUnorganizedRaindropBookmarks', async () => {
        const error = new Error('Database connection failed');
        mockedDb.query.mockRejectedValueOnce(error);

        await expect(bookmarkService.transferUnorganizedRaindropBookmarks(mockUserId))
          .rejects.toThrow('Database connection failed');
      });

      it('should handle validation errors gracefully in batch transfer', async () => {
        const invalidBookmarks = [
          {
            id: 1,
            user_id: mockUserId,
            raindrop_id: 12345,
            title: '', // Invalid: empty title (not null/undefined, so not converted to 'Untitled')
            link: 'not-a-valid-url', // Invalid: bad URL format
            tags: ['test'],
            is_organized: false,
            created_at: new Date()
          },
          {
            id: 2,
            user_id: mockUserId,
            raindrop_id: 12346,
            title: 'Valid Bookmark',
            link: 'https://example.com/2',
            tags: ['test'],
            is_organized: false,
            created_at: new Date()
          }
        ];

        const mockCanonicalBookmark = {
          id: 'canonical-uuid-2',
          user_id: mockUserId,
          title: 'Valid Bookmark',
          url: 'https://example.com/2',
          source_type: 'raindrop',
          source_id: '12346',
          is_organized: false
        };

        mockedDb.query
          // getUnorganizedRaindropBookmarks
          .mockResolvedValueOnce(invalidBookmarks)
          // First bookmark will fail validation (no DB calls for failed validation)
          // checkCanonicalBookmarkExists - second bookmark (not found)
          .mockResolvedValueOnce([])
          // transferRaindropBookmarkToCanonical - second bookmark (INSERT)
          .mockResolvedValueOnce([mockCanonicalBookmark])
          // transferRaindropBookmarkToCanonical - second bookmark (UPDATE staging)
          .mockResolvedValueOnce([{ id: 2, is_organized: true }]);

        const result = await bookmarkService.transferUnorganizedRaindropBookmarks(mockUserId);

        expect(result.success).toBe(1);
        expect(result.failed).toBe(1);
        expect(result.total).toBe(2);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual({
          bookmarkId: 1,
          title: '',
          error: 'Validation failed: url must be a valid URL format, resolved_url must be a valid URL format if provided',
          errorType: 'validation'
        });
        expect(result.transferredBookmarks).toHaveLength(1);
        expect(result.transferredBookmarks[0]).toEqual({
          stagingId: 2,
          canonicalId: 'canonical-uuid-2',
          title: 'Valid Bookmark',
          enriched: false
        });
      });
    });

    describe('transferRaindropBookmarkToCanonical validation integration', () => {
      const mockValidRaindropBookmark = {
        id: 1,
        user_id: mockUserId,
        raindrop_id: 12345,
        title: 'Valid Test Bookmark',
        link: 'https://example.com',
        tags: ['test'],
        is_organized: false,
        created_at: new Date()
      };

      it('should successfully transfer valid bookmark with validation', async () => {
        const mockCanonicalBookmark = {
          id: 'canonical-uuid-1',
          user_id: mockUserId,
          title: 'Valid Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: '12345',
          is_organized: false
        };

        mockedDb.query
          // checkCanonicalBookmarkExists (not found)
          .mockResolvedValueOnce([])
          // transferRaindropBookmarkToCanonical (INSERT)
          .mockResolvedValueOnce([mockCanonicalBookmark])
          // transferRaindropBookmarkToCanonical (UPDATE staging)
          .mockResolvedValueOnce([{ id: 1, is_organized: true }]);

        const result = await bookmarkService.transferRaindropBookmarkToCanonical(mockValidRaindropBookmark);

        expect(result).toEqual(mockCanonicalBookmark);
        expect(mockedDb.query).toHaveBeenCalledTimes(3);
      });

      it('should reject bookmark with validation errors', async () => {
        const mockInvalidRaindropBookmark = {
          id: 1,
          user_id: mockUserId,
          raindrop_id: 12345,
          title: '', // Invalid: empty title (not null/undefined, so not converted to 'Untitled')
          link: 'not-a-valid-url', // Invalid: bad URL format
          tags: ['test'],
          is_organized: false,
          created_at: new Date()
        };

        await expect(bookmarkService.transferRaindropBookmarkToCanonical(mockInvalidRaindropBookmark))
          .rejects.toThrow('Bookmark validation failed: url must be a valid URL format, resolved_url must be a valid URL format if provided');

        // Should not make any database calls due to validation failure
        expect(mockedDb.query).not.toHaveBeenCalled();
      });

      it('should handle missing title by defaulting to "Untitled"', async () => {
        const mockBookmarkNoTitle = {
          id: 1,
          user_id: mockUserId,
          raindrop_id: 12345,
          title: null, // Will be converted to 'Untitled'
          link: 'https://example.com',
          tags: ['test'],
          is_organized: false,
          created_at: new Date()
        };

        const mockCanonicalBookmark = {
          id: 'canonical-uuid-1',
          user_id: mockUserId,
          title: 'Untitled',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: '12345',
          is_organized: false
        };

        mockedDb.query
          // checkCanonicalBookmarkExists (not found)
          .mockResolvedValueOnce([])
          // transferRaindropBookmarkToCanonical (INSERT)
          .mockResolvedValueOnce([mockCanonicalBookmark])
          // transferRaindropBookmarkToCanonical (UPDATE staging)
          .mockResolvedValueOnce([{ id: 1, is_organized: true }]);

        const result = await bookmarkService.transferRaindropBookmarkToCanonical(mockBookmarkNoTitle);

        expect(result.title).toBe('Untitled');
        expect(mockedDb.query).toHaveBeenCalledTimes(3);
      });

      it('should convert raindrop_id to string for source_id validation', async () => {
        const mockBookmarkNumericId = {
          id: 1,
          user_id: mockUserId,
          raindrop_id: 12345, // Numeric ID
          title: 'Test Bookmark',
          link: 'https://example.com',
          tags: ['test'],
          is_organized: false,
          created_at: new Date()
        };

        const mockCanonicalBookmark = {
          id: 'canonical-uuid-1',
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: '12345', // Should be converted to string
          is_organized: false
        };

        mockedDb.query
          // checkCanonicalBookmarkExists (not found)
          .mockResolvedValueOnce([])
          // transferRaindropBookmarkToCanonical (INSERT)
          .mockResolvedValueOnce([mockCanonicalBookmark])
          // transferRaindropBookmarkToCanonical (UPDATE staging)
          .mockResolvedValueOnce([{ id: 1, is_organized: true }]);

        const result = await bookmarkService.transferRaindropBookmarkToCanonical(mockBookmarkNumericId);

        // Verify the checkCanonicalBookmarkExists was called with string source_id
        expect(mockedDb.query).toHaveBeenNthCalledWith(1,
          'SELECT * FROM bookmarks.bookmarks WHERE user_id = $1 AND source_type = $2 AND source_id = $3',
          [mockUserId, 'raindrop', '12345']
        );
        expect(result).toEqual(mockCanonicalBookmark);
      });
    });

    describe('Integration with existing functions', () => {
      const mockUnorganizedBookmarks = [
        {
          id: 1,
          user_id: mockUserId,
          raindrop_id: 12345,
          title: 'Test Bookmark 1',
          link: 'https://example.com/1',
          tags: ['test'],
          is_organized: false,
          created_at: new Date()
        }
      ];

      it('should work with checkCanonicalBookmarkExists', async () => {
        const mockExistingBookmark = {
          id: 'existing-uuid',
          user_id: mockUserId,
          source_type: 'raindrop',
          source_id: '12345'
        };

        mockedDb.query
          .mockResolvedValueOnce(mockUnorganizedBookmarks) // getUnorganizedRaindropBookmarks
          .mockResolvedValueOnce([mockExistingBookmark]) // checkCanonicalBookmarkExists
          .mockResolvedValueOnce([{ ...mockExistingBookmark, title: 'Updated Title' }]) // transferRaindropBookmarkToCanonical (update)
          .mockResolvedValueOnce([{ id: 1, is_organized: true }]); // transferRaindropBookmarkToCanonical (UPDATE staging)

        const result = await bookmarkService.transferUnorganizedRaindropBookmarks(mockUserId);

        expect(result.success).toBe(1);
        expect(result.failed).toBe(0);
      });
    });
  });

  describe('validateBookmarkData', () => {
    const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

    describe('Required fields validation', () => {
      it('should validate a complete valid bookmark', () => {
        const validBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(validBookmark);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject bookmark missing user_id', () => {
        const invalidBookmark = {
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('user_id is required');
      });

      it('should reject bookmark with empty user_id', () => {
        const invalidBookmark = {
          user_id: '',
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('user_id must be a non-empty string');
      });

      it('should reject bookmark missing title', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('title is required');
      });

      it('should reject bookmark with empty title', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: '',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('title must be a non-empty string');
      });

      it('should reject bookmark missing url', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('url is required');
      });

      it('should reject bookmark with invalid url format', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'not-a-valid-url',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('url must be a valid URL format');
      });

      it('should reject bookmark missing source_type', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('source_type is required');
      });

      it('should reject bookmark missing source_id', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('source_id is required');
      });
    });

    describe('Optional fields validation', () => {
      it('should accept bookmark with valid optional fields', () => {
        const validBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          resolved_url: 'https://example.com/final',
          description: 'A test bookmark description',
          image_url: 'https://example.com/image.jpg',
          image_alt: 'Test image',
          site_name: 'Example Site',
          tags: ['test', 'example'],
          source_metadata: { raindrop_id: 'raindrop-123' },
          is_organized: false,
          created_at: new Date('2025-01-01T00:00:00Z')
        };

        const result = bookmarkService.validateBookmarkData(validBookmark);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject bookmark with invalid resolved_url', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          resolved_url: 'not-a-valid-url'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('resolved_url must be a valid URL format if provided');
      });

      it('should reject bookmark with non-string description', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          description: 123
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('description must be a string if provided');
      });

      it('should reject bookmark with invalid image_url', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          image_url: 'not-a-valid-url'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('image_url must be a valid URL format if provided');
      });

      it('should reject bookmark with non-string image_alt', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          image_alt: 123
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('image_alt must be a string if provided');
      });

      it('should reject bookmark with non-string site_name', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          site_name: 123
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('site_name must be a string if provided');
      });

      it('should reject bookmark with non-array tags', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          tags: 'not-an-array'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('tags must be an array if provided');
      });

      it('should reject bookmark with non-string tags', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          tags: ['valid-tag', 123, 'another-valid-tag']
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('tags[1] must be a string');
      });

      it('should reject bookmark with non-object source_metadata', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          source_metadata: 'not-an-object'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('source_metadata must be an object if provided');
      });

      it('should reject bookmark with array source_metadata', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          source_metadata: ['not', 'an', 'object']
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('source_metadata must be an object if provided');
      });

      it('should reject bookmark with non-boolean is_organized', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          is_organized: 'not-a-boolean'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('is_organized must be a boolean if provided');
      });

      it('should reject bookmark with invalid created_at', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          created_at: 'not-a-valid-date'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('created_at must be a valid date if provided');
      });
    });

    describe('Field length validation', () => {
      it('should reject bookmark with title too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'a'.repeat(1001),
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('title must be 1000 characters or less');
      });

      it('should reject bookmark with url too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com/' + 'a'.repeat(2048),
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('url must be 2048 characters or less');
      });

      it('should reject bookmark with resolved_url too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          resolved_url: 'https://example.com/' + 'a'.repeat(2048)
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('resolved_url must be 2048 characters or less');
      });

      it('should reject bookmark with description too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          description: 'a'.repeat(5001)
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('description must be 5000 characters or less');
      });

      it('should reject bookmark with image_url too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          image_url: 'https://example.com/' + 'a'.repeat(2048)
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('image_url must be 2048 characters or less');
      });

      it('should reject bookmark with image_alt too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          image_alt: 'a'.repeat(501)
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('image_alt must be 500 characters or less');
      });

      it('should reject bookmark with site_name too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          site_name: 'a'.repeat(201)
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('site_name must be 200 characters or less');
      });

      it('should reject bookmark with source_type too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'a'.repeat(51),
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('source_type must be 50 characters or less');
      });

      it('should reject bookmark with source_id too long', () => {
        const invalidBookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'a'.repeat(256)
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('source_id must be 255 characters or less');
      });
    });

    describe('Multiple validation errors', () => {
      it('should collect all validation errors', () => {
        const invalidBookmark = {
          user_id: '',
          title: '',
          url: 'not-a-url',
          source_type: '',
          source_id: '',
          description: 123,
          tags: 'not-an-array'
        };

        const result = bookmarkService.validateBookmarkData(invalidBookmark);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(7);
        expect(result.errors).toContain('user_id must be a non-empty string');
        expect(result.errors).toContain('title must be a non-empty string');
        expect(result.errors).toContain('url must be a valid URL format');
        expect(result.errors).toContain('source_type must be a non-empty string');
        expect(result.errors).toContain('source_id must be a non-empty string');
        expect(result.errors).toContain('description must be a string if provided');
        expect(result.errors).toContain('tags must be an array if provided');
      });
    });

    describe('Edge cases', () => {
      it('should handle null values for optional fields', () => {
        const bookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          resolved_url: null,
          description: null,
          image_url: null,
          image_alt: null,
          site_name: null,
          tags: null,
          source_metadata: null,
          is_organized: null,
          created_at: null
        };

        const result = bookmarkService.validateBookmarkData(bookmark);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle undefined values for optional fields', () => {
        const bookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123'
        };

        const result = bookmarkService.validateBookmarkData(bookmark);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle empty string for resolved_url', () => {
        const bookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          resolved_url: ''
        };

        const result = bookmarkService.validateBookmarkData(bookmark);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle empty string for image_url', () => {
        const bookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          image_url: ''
        };

        const result = bookmarkService.validateBookmarkData(bookmark);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle Date object for created_at', () => {
        const bookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          created_at: new Date('2025-01-01T00:00:00Z')
        };

        const result = bookmarkService.validateBookmarkData(bookmark);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should handle date string for created_at', () => {
        const bookmark = {
          user_id: mockUserId,
          title: 'Test Bookmark',
          url: 'https://example.com',
          source_type: 'raindrop',
          source_id: 'raindrop-123',
          created_at: '2025-01-01T00:00:00Z'
        };

        const result = bookmarkService.validateBookmarkData(bookmark);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });
}); 