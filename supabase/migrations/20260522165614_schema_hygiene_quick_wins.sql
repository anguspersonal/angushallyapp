-- Sub-task 1: identity.users has three indexes on google_sub. Keep
--   uq_users_google_sub (the canonical unique constraint), drop the
--   constraint-backed duplicate users_google_sub_key, drop the redundant
--   non-unique ix_users_google_sub.
-- Sub-task 3: bookmarks.bookmark_categories has uq_bookmark_categories
--   as a UNIQUE CONSTRAINT but no PRIMARY KEY. Drop the constraint and
--   re-add as PK with the same name. (The previous agent confirmed
--   Postgres rejects ADD PRIMARY KEY USING INDEX on constraint-owned
--   indexes -- see SQLSTATE 55000.)
-- See issue #75 for full reasoning and the constraint-vs-index footnote.
--
-- Confirmed: no FK references `users_google_sub_key` -- repo-wide scan of
--   server/migrations/ and supabase/migrations/ for REFERENCES/FOREIGN KEY
--   clauses targeting google_sub returned no matches (2026-05-25). The
--   DROP CONSTRAINT below is therefore safe without CASCADE.
--
-- Reversible:
--   BEGIN;
--   -- Sub-task 1 reversal: recreate the dropped constraint and index.
--   --   Note: this recreates the original names, but `uq_users_google_sub`
--   --   (kept by this migration) already enforces uniqueness, so the
--   --   ADD CONSTRAINT will fail unless that one is dropped first or
--   --   USING INDEX is wired to a freshly built unique index.
--   ALTER TABLE identity.users
--     ADD CONSTRAINT users_google_sub_key UNIQUE (google_sub);
--   CREATE INDEX IF NOT EXISTS ix_users_google_sub
--     ON identity.users(google_sub);
--   -- Sub-task 3 reversal: demote PK back to UNIQUE constraint.
--   ALTER TABLE bookmarks.bookmark_categories
--     DROP CONSTRAINT uq_bookmark_categories,
--     ADD CONSTRAINT uq_bookmark_categories UNIQUE (bookmark_id, category_id);
--   COMMIT;

BEGIN;

-- Sub-task 1
ALTER TABLE identity.users DROP CONSTRAINT users_google_sub_key;
DROP INDEX IF EXISTS identity.ix_users_google_sub;

-- Sub-task 3
ALTER TABLE bookmarks.bookmark_categories
  DROP CONSTRAINT uq_bookmark_categories,
  ADD CONSTRAINT uq_bookmark_categories PRIMARY KEY (bookmark_id, category_id);

COMMIT;
