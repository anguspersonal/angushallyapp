const axios = require('axios');
const bookmarkService = require('../bookmark-api/bookmarkService');
const db = require('../db');

// Mock axios for API calls
jest.mock('axios');
const mockedAxios = axios;

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

        mockedAxios.get.mockResolvedValue(mockResponse);

        const result = await bookmarkService.getRaindropCollections(mockAccessToken);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          'https://api.raindrop.io/rest/v1/collections',
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
        mockedAxios.get.mockResolvedValue(mockResponse);

        await expect(bookmarkService.getRaindropCollections(mockAccessToken))
          .rejects.toThrow('Invalid response format from Raindrop.io');
      });

      it('should handle API errors', async () => {
        const mockError = new Error('API Error');
        mockError.response = { data: { error: 'Unauthorized' } };
        mockedAxios.get.mockRejectedValue(mockError);

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

        mockedAxios.get.mockResolvedValue(mockResponse);

        const result = await bookmarkService.getRaindropBookmarksFromCollection(mockAccessToken, collectionId);

        expect(mockedAxios.get).toHaveBeenCalledWith(
          `https://api.raindrop.io/rest/v1/raindrops/${collectionId}`,
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
        mockedAxios.get.mockResolvedValue(mockResponse);

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
        mockedAxios.get
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
}); 