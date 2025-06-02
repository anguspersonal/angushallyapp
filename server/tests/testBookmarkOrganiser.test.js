const bookmarkService = require('../bookmark-api/bookmarkService');
const { fetchMetadata } = require('../bookmark-api/openGraph');
const bookmarkOrganiser = require('../bookmark-api/bookmarkMetadataEnricher');

// Mock dependencies
jest.mock('../bookmark-api/bookmarkService');
jest.mock('../bookmark-api/openGraph');
jest.mock('../db', () => ({
    query: jest.fn(),
    pool: {
        connect: jest.fn()
    }
}));

describe('Bookmark Organiser', () => {
    const mockUserId = 'test-user-id';
    const mockBookmarks = [
        {
            id: 1,
            url: 'https://example.com/1',
            is_organised: false
        },
        {
            id: 2,
            url: 'https://example.com/2',
            is_organised: false
        }
    ];

    const mockMetadata = {
        title: 'Test Title',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
        site_name: 'Example Site',
        resolved_url: 'https://example.com/resolved',
        error: null
    };

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup default mock implementations
        bookmarkService.getUnorganisedBookmarks.mockResolvedValue(mockBookmarks);
        bookmarkService.updateBookmarkMetadata.mockImplementation(async (userId, bookmarkId, metadata) => ({
            id: bookmarkId,
            ...metadata
        }));
        bookmarkService.logSync.mockResolvedValue();
        fetchMetadata.mockResolvedValue(mockMetadata);
    });

    test('should process unorganised bookmarks successfully', async () => {
        const result = await bookmarkOrganiser(mockUserId);

        expect(result).toEqual({
            processed: 2,
            success: 2,
            failed: 0,
            errors: []
        });

        expect(bookmarkService.getUnorganisedBookmarks).toHaveBeenCalledWith(mockUserId);
        expect(fetchMetadata).toHaveBeenCalledTimes(2);
        expect(bookmarkService.updateBookmarkMetadata).toHaveBeenCalledTimes(2);
        expect(bookmarkService.logSync).toHaveBeenCalledWith(
            mockUserId,
            2,
            'success',
            null
        );
    });

    test('should handle empty bookmark list', async () => {
        bookmarkService.getUnorganisedBookmarks.mockResolvedValue([]);

        const result = await bookmarkOrganiser(mockUserId);

        expect(result).toEqual({
            processed: 0,
            success: 0,
            failed: 0,
            errors: []
        });

        expect(bookmarkService.getUnorganisedBookmarks).toHaveBeenCalledWith(mockUserId);
        expect(fetchMetadata).not.toHaveBeenCalled();
        expect(bookmarkService.updateBookmarkMetadata).not.toHaveBeenCalled();
        expect(bookmarkService.logSync).toHaveBeenCalledWith(
            mockUserId,
            0,
            'success',
            null
        );
    });

    test('should handle metadata fetch errors', async () => {
        const error = new Error('Failed to fetch metadata');
        fetchMetadata.mockRejectedValueOnce(error);

        const result = await bookmarkOrganiser(mockUserId);

        expect(result).toEqual({
            processed: 2,
            success: 1,
            failed: 1,
            errors: [{
                bookmarkId: 1,
                url: 'https://example.com/1',
                error: 'Failed to fetch metadata'
            }]
        });

        expect(bookmarkService.logSync).toHaveBeenCalledWith(
            mockUserId,
            2,
            'partial_success',
            '1 bookmarks failed to process'
        );
    });

    test('should handle update errors', async () => {
        const error = new Error('Failed to update bookmark');
        bookmarkService.updateBookmarkMetadata.mockRejectedValueOnce(error);

        const result = await bookmarkOrganiser(mockUserId);

        expect(result).toEqual({
            processed: 2,
            success: 1,
            failed: 1,
            errors: [{
                bookmarkId: 1,
                url: 'https://example.com/1',
                error: 'Failed to update bookmark'
            }]
        });

        expect(bookmarkService.logSync).toHaveBeenCalledWith(
            mockUserId,
            2,
            'partial_success',
            '1 bookmarks failed to process'
        );
    });

    test('should handle complete failure', async () => {
        const error = new Error('Service unavailable');
        bookmarkService.getUnorganisedBookmarks.mockRejectedValue(error);

        await expect(bookmarkOrganiser(mockUserId)).rejects.toThrow('Service unavailable');

        expect(bookmarkService.logSync).toHaveBeenCalledWith(
            mockUserId,
            0,
            'error',
            'Service unavailable'
        );
    });
}); 