-- ix_bookmarks_user_id (user_id) is shadowed by idx_bookmarks_user_created_desc
-- (user_id, created_at DESC). Leading column of the composite serves all read
-- paths that the single-col index served. See issue #59.
--
-- Reversible: CREATE INDEX IF NOT EXISTS ix_bookmarks_user_id
--               ON bookmarks.bookmarks(user_id);
BEGIN;
DROP INDEX IF EXISTS bookmarks.ix_bookmarks_user_id;
COMMIT;
