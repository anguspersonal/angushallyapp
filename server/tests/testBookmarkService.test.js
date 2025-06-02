// Mock the database before requiring the service
jest.mock('../db', () => ({
    query: jest.fn(),
    pool: {
        connect: jest.fn()
    }
}));

const db = require('../db');
const bookmarkService = require('../bookmark-api/bookmarkService');

describe('BookmarkService', () => {
    const TEST_USER_ID = '95288f22-6049-4651-85ae-4932ededb5ab';
    
    // Sample data - define these at the top level
    const sampleBookmark = {
        url: 'https://example.com',
        title: 'Example Website',
        description: 'An example website for testing',
        source: 'manual'
    };

    const sampleBookmarks = [
        {
            url: 'https://example1.com',
            title: 'Example 1',
            description: 'First example'
        },
        {
            url: 'https://example2.com',
            title: 'Example 2',
            description: 'Second example'
        }
    ];
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup default mock behavior - return empty array by default
        db.query.mockResolvedValue([]);
    });

    describe('addBookmark', () => {
        it('should create a new bookmark', async () => {
            const mockBookmark = {
                id: 1,
                url: 'https://example.com',
                title: 'Example Website',
                user_id: TEST_USER_ID,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            // Mock the database responses
            db.query
                .mockResolvedValueOnce([]) // First call (check existing)
                .mockResolvedValueOnce([mockBookmark]); // Second call (create)

            const result = await bookmarkService.addBookmark(TEST_USER_ID, sampleBookmark);
            
            expect(result).toEqual(mockBookmark);
            expect(db.query).toHaveBeenCalledTimes(2);
        });

        it('should update existing bookmark', async () => {
            const existingBookmark = { 
                id: 1, 
                url: sampleBookmark.url, 
                title: 'Old Title',
                user_id: TEST_USER_ID,
                created_at: new Date(),
                updated_at: new Date()
            };
            const updatedBookmark = { ...existingBookmark, title: 'Updated Title' };
            
            // Mock responses for update flow
            db.query
                .mockResolvedValueOnce([existingBookmark]) // Find existing
                .mockResolvedValueOnce([updatedBookmark]); // Update
            
            const updatedData = {
                ...sampleBookmark,
                title: 'Updated Title'
            };
            
            const result = await bookmarkService.addBookmark(TEST_USER_ID, updatedData);
            
            expect(result.title).toBe('Updated Title');
            expect(result.url).toBe(sampleBookmark.url);
            expect(db.query).toHaveBeenCalledTimes(2);
        });
    });

    describe('upsertBookmarks', () => {
        it('should handle batch creation of bookmarks', async () => {
            const mockResults = sampleBookmarks.map((bookmark, index) => ({
                id: index + 1,
                ...bookmark,
                user_id: TEST_USER_ID,
                created_at: new Date(),
                updated_at: new Date()
            }));
            
            // Dynamic mock implementation that does not rely on call order
            db.query.mockImplementation((sql, params) => {
                // SELECT → no existing bookmark
                if (/SELECT\s+\*/i.test(sql)) {
                    return Promise.resolve([]);
                }

                // INSERT → return newly created bookmark based on URL parameter
                if (/INSERT\s+INTO/i.test(sql)) {
                    const url = params[1];
                    const created = mockResults.find(bm => bm.url === url);
                    return Promise.resolve([created]);
                }

                // Default fallback (should not hit for this test)
                return Promise.resolve([]);
            });

            const results = await bookmarkService.upsertBookmarks(TEST_USER_ID, sampleBookmarks);
            
            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
            expect(results).toHaveLength(2);
            
            // Verify bookmark properties
            expect(results[0]).toEqual(expect.objectContaining({
                url: sampleBookmarks[0].url,
                title: sampleBookmarks[0].title
            }));
            expect(results[1]).toEqual(expect.objectContaining({
                url: sampleBookmarks[1].url,
                title: sampleBookmarks[1].title
            }));
            
            // We expect 4 queries (2 SELECT, 2 INSERT)
            expect(db.query).toHaveBeenCalledTimes(4);
        });

        it('should handle mixed create and update operations', async () => {
            const existingBookmark = { 
                id: 1, 
                ...sampleBookmarks[0], 
                user_id: TEST_USER_ID,
                created_at: new Date(),
                updated_at: new Date()
            };
            const updatedBookmark = {
                ...existingBookmark,
                title: 'Updated First Example',
                updated_at: new Date()
            };
            const newBookmark = { 
                id: 2, 
                ...sampleBookmarks[1], 
                user_id: TEST_USER_ID,
                created_at: new Date(),
                updated_at: new Date()
            };
            
            // Dynamic mock implementation to reflect mixed operations
            db.query.mockImplementation((sql, params) => {
                const url = params[1];

                // SELECT path
                if (/SELECT\s+\*/i.test(sql)) {
                    if (url === sampleBookmarks[0].url) {
                        // First bookmark exists already
                        return Promise.resolve([existingBookmark]);
                    }
                    // Second bookmark does not exist
                    return Promise.resolve([]);
                }

                // UPDATE path for first bookmark
                if (/UPDATE\s+bookmark\.bookmarks/i.test(sql)) {
                    return Promise.resolve([updatedBookmark]);
                }

                // INSERT path for second bookmark
                if (/INSERT\s+INTO/i.test(sql)) {
                    return Promise.resolve([newBookmark]);
                }

                return Promise.resolve([]);
            });

            const updatedBookmarksInput = [
                { ...sampleBookmarks[0], title: 'Updated First Example' },
                sampleBookmarks[1]
            ];
            
            const results = await bookmarkService.upsertBookmarks(TEST_USER_ID, updatedBookmarksInput);
            
            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
            expect(results).toHaveLength(2);
            
            // Verify bookmark properties
            expect(results[0]).toEqual(expect.objectContaining({
                title: 'Updated First Example'
            }));
            expect(results[1]).toEqual(expect.objectContaining({
                url: sampleBookmarks[1].url
            }));
            
            // Expected call counts: SELECT (2) + UPDATE (1) + INSERT (1) = 4
            expect(db.query).toHaveBeenCalledTimes(4);
        });
    });

    describe('getBookmarks', () => {
        it('should retrieve all bookmarks for a user', async () => {
            const mockBookmarks = [
                { 
                    id: 1, 
                    url: 'https://example1.com', 
                    title: 'Example 1',
                    user_id: TEST_USER_ID,
                    created_at: new Date() 
                },
                { 
                    id: 2, 
                    url: 'https://example2.com', 
                    title: 'Example 2',
                    user_id: TEST_USER_ID,
                    created_at: new Date() 
                }
            ];
            
            db.query.mockResolvedValueOnce(mockBookmarks);
            
            const results = await bookmarkService.getBookmarks(TEST_USER_ID);
            
            expect(results).toHaveLength(2);
            expect(results[0].created_at).toBeInstanceOf(Date);
        });

        it('should return empty array for user with no bookmarks', async () => {
            db.query.mockResolvedValueOnce([]);
            
            const results = await bookmarkService.getBookmarks(TEST_USER_ID);
            
            expect(results).toEqual([]);
        });
    });

    describe('logSync', () => {
        it('should create sync log entry', async () => {
            // Mock successful log creation - logSync doesn't return anything
            db.query.mockResolvedValueOnce([{ id: 1, user_id: TEST_USER_ID, bookmarks_processed: 5, status: 'success' }]);
            
            await bookmarkService.logSync(TEST_USER_ID, 5, 'success');
            
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO bookmark.bookmark_sync_logs'),
                [TEST_USER_ID, 5, 'success', null]
            );
        });

        it('should handle error messages in sync log', async () => {
            const errorMsg = 'Test error message';
            
            // Mock successful log creation - logSync doesn't return anything
            db.query.mockResolvedValueOnce([{ id: 1, user_id: TEST_USER_ID, bookmarks_processed: 0, status: 'error' }]);
            
            await bookmarkService.logSync(TEST_USER_ID, 0, 'error', errorMsg);
            
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO bookmark.bookmark_sync_logs'),
                [TEST_USER_ID, 0, 'error', errorMsg]
            );
        });
    });
}); 