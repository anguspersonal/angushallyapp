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

BEGIN;

-- Sub-task 1
ALTER TABLE identity.users DROP CONSTRAINT users_google_sub_key;
DROP INDEX IF EXISTS identity.ix_users_google_sub;

-- Sub-task 3
ALTER TABLE bookmarks.bookmark_categories
  DROP CONSTRAINT uq_bookmark_categories,
  ADD CONSTRAINT uq_bookmark_categories PRIMARY KEY (bookmark_id, category_id);

COMMIT;
