-- Hot-path indexes for frequently filtered, joined, and ordered columns.
-- Sourced from a code audit of src/lib/<domain>/ and src/app/api/**/route.ts
-- against the schemas defined in server/migrations/archive/knex-history.
-- See docs/backlog.json item `db-indexes`.
--
-- All statements are idempotent: CREATE INDEX IF NOT EXISTS skips re-creation
-- by index name. Index names are scoped per schema to avoid collisions.
-- Plain (non-CONCURRENT) creates are fine here — tables are small and the
-- whole migration runs in one transaction.

BEGIN;

-- habit.habit_log
--   2-col composite serves:
--     listHabitLogs      — WHERE user_id = $1 ORDER BY created_at DESC LIMIT/OFFSET
--     computeHabitStats  — WHERE user_id = $1 AND created_at >= $2 (range scan)
--   3-col composite serves:
--     listHabitLogsByType — WHERE user_id = $1 AND habit_type = $2 ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_habit_log_user_created_desc
  ON habit.habit_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_habit_log_user_type_created_desc
  ON habit.habit_log (user_id, habit_type, created_at DESC);

-- habit.strava_activities
--   listStravaActivitiesForUser: WHERE user_id = $1 ORDER BY start_date_local DESC
--   getLatestActivityUnixTimestamp: WHERE user_id = $1 ORDER BY start_date DESC LIMIT 1
CREATE INDEX IF NOT EXISTS idx_strava_activities_user_start_local_desc
  ON habit.strava_activities (user_id, start_date_local DESC);

CREATE INDEX IF NOT EXISTS idx_strava_activities_user_start_desc
  ON habit.strava_activities (user_id, start_date DESC);

-- content.posts
--   listBlogPosts:     ORDER BY {created_at|updated_at|title|id} {asc|desc} LIMIT/OFFSET
--   getBlogPostDetail: WHERE slug = $1
--
-- idx_posts_author_id: FK best practice. Postgres does NOT auto-index FK
-- columns — without this, ON DELETE / ON UPDATE cascades and any future
-- "posts by author" reverse lookup hit a sequential scan. The current
-- loadAuthorNames join is satisfied by identity.users PK; this index
-- protects future query shapes that filter posts by author_id directly.
CREATE INDEX IF NOT EXISTS idx_posts_author_id
  ON content.posts (author_id);

CREATE INDEX IF NOT EXISTS idx_posts_slug
  ON content.posts (slug);

CREATE INDEX IF NOT EXISTS idx_posts_created_desc
  ON content.posts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_updated_desc
  ON content.posts (updated_at DESC);

-- bookmarks.bookmarks
--   GET /api/bookmarks: WHERE user_id = $1 ORDER BY created_at DESC
--   (single-column ix_bookmarks_user_id already exists; the composite below
--   lets the paginated list satisfy the sort from the index directly.)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created_desc
  ON bookmarks.bookmarks (user_id, created_at DESC);

COMMIT;
