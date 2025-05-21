const { expect } = require('chai');
const db = require('../db');
const bookmarkService = require('../bookmark-api/bookmarkService');

describe('BookmarkService', () => {
  // Test user ID (matches the user created in migrations)
  const TEST_USER_ID = '95288f22-6049-4651-85ae-4932ededb5ab';
  
  // Sample bookmark data
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

  // Clean up before each test
  beforeEach(async () => {
    await db.query('DELETE FROM bookmark.bookmarks WHERE user_id = $1', [TEST_USER_ID]);
    await db.query('DELETE FROM bookmark.bookmark_sync_logs WHERE user_id = $1', [TEST_USER_ID]);
  });

  describe('addBookmark', () => {
    it('should create a new bookmark', async () => {
      const result = await bookmarkService.addBookmark(TEST_USER_ID, sampleBookmark);
      
      expect(result).to.be.an('object');
      expect(result.url).to.equal(sampleBookmark.url);
      expect(result.title).to.equal(sampleBookmark.title);
      expect(result.description).to.equal(sampleBookmark.description);
      expect(result.user_id).to.equal(TEST_USER_ID);
    });

    it('should update existing bookmark', async () => {
      // First create
      await bookmarkService.addBookmark(TEST_USER_ID, sampleBookmark);
      
      // Then update
      const updatedData = {
        ...sampleBookmark,
        title: 'Updated Title'
      };
      
      const result = await bookmarkService.addBookmark(TEST_USER_ID, updatedData);
      
      expect(result.title).to.equal('Updated Title');
      expect(result.url).to.equal(sampleBookmark.url);
    });
  });

  describe('upsertBookmarks', () => {
    it('should handle batch creation of bookmarks', async () => {
      const results = await bookmarkService.upsertBookmarks(TEST_USER_ID, sampleBookmarks);
      
      expect(results).to.be.an('array');
      expect(results).to.have.lengthOf(2);
      expect(results[0].url).to.equal(sampleBookmarks[0].url);
      expect(results[1].url).to.equal(sampleBookmarks[1].url);
    });

    it('should handle mixed create and update operations', async () => {
      // First create one bookmark
      await bookmarkService.addBookmark(TEST_USER_ID, sampleBookmarks[0]);
      
      // Then upsert both with an update to the first one
      const updatedBookmarks = [
        { ...sampleBookmarks[0], title: 'Updated First Example' },
        sampleBookmarks[1]
      ];
      
      const results = await bookmarkService.upsertBookmarks(TEST_USER_ID, updatedBookmarks);
      
      expect(results).to.have.lengthOf(2);
      expect(results[0].title).to.equal('Updated First Example');
      expect(results[1].url).to.equal(sampleBookmarks[1].url);
    });
  });

  describe('getBookmarks', () => {
    it('should retrieve all bookmarks for a user', async () => {
      // First create some bookmarks
      await bookmarkService.upsertBookmarks(TEST_USER_ID, sampleBookmarks);
      
      const results = await bookmarkService.getBookmarks(TEST_USER_ID);
      
      expect(results).to.be.an('array');
      expect(results).to.have.lengthOf(2);
      expect(results[0].created_at).to.be.a('date');
    });

    it('should return empty array for user with no bookmarks', async () => {
      const results = await bookmarkService.getBookmarks(TEST_USER_ID);
      expect(results).to.be.an('array');
      expect(results).to.be.empty;
    });
  });

  describe('logSync', () => {
    it('should create sync log entry', async () => {
      await bookmarkService.logSync(TEST_USER_ID, 5, 'success');
      
      const logs = await db.query(
        'SELECT * FROM bookmark.bookmark_sync_logs WHERE user_id = $1',
        [TEST_USER_ID]
      );
      
      expect(logs).to.have.lengthOf(1);
      expect(logs[0].item_count).to.equal(5);
      expect(logs[0].status).to.equal('success');
      expect(logs[0].error_msg).to.be.null;
    });

    it('should handle error messages in sync log', async () => {
      const errorMsg = 'Test error message';
      await bookmarkService.logSync(TEST_USER_ID, 0, 'error', errorMsg);
      
      const logs = await db.query(
        'SELECT * FROM bookmark.bookmark_sync_logs WHERE user_id = $1',
        [TEST_USER_ID]
      );
      
      expect(logs[0].status).to.equal('error');
      expect(logs[0].error_msg).to.equal(errorMsg);
    });
  });
}); 