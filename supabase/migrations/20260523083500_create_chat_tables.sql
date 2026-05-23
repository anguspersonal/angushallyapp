-- Chatbot v1 persistence layer.
-- See docs/chatbotv1/requirements.md §5.9 and docs/chatbotv1/design.md §8.
--
-- Creates a dedicated `chat` schema (ADR-0002) with two tables:
--   chat.sessions   — one row per anonymous chat session (hashed IP, UA, referrer)
--   chat.messages   — every user/assistant/tool turn within a session
--
-- Service-role bypasses RLS; anon clients are denied by the empty-policy default.
-- 90-day retention is enforced by a pg_cron job scheduled at the end of this file.
--
-- All statements are idempotent (`IF NOT EXISTS`, `CREATE OR REPLACE` where
-- meaningful) so re-running on a fresh database is safe.
--
-- ⚠ Requires the `pg_cron` extension to be enabled in the Supabase project
-- dashboard (Database → Extensions) before applying. Without it, the
-- `cron.schedule(...)` call at the bottom of this migration will fail. See
-- docs/chatbotv1/README.md (once written) for the one-time dashboard step.

BEGIN;

CREATE SCHEMA IF NOT EXISTS chat;

-- ---------------------------------------------------------------------------
-- chat.sessions — one row per anonymous chat session
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat.sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  anon_id      uuid NOT NULL,                          -- generated client-side, stable per browser
  ip_hash      text NOT NULL,                          -- sha256(ip || '|' || server pepper)
  user_agent   text,
  referrer     text,
  first_route  text                                    -- pathname when the session opened
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_anon_id
  ON chat.sessions (anon_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_ip_hash
  ON chat.sessions (ip_hash);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at
  ON chat.sessions (created_at DESC);

-- ---------------------------------------------------------------------------
-- chat.messages — every turn in a session
--   role='user'      → the visitor's input
--   role='assistant' → the model's reply (tokens_in/out populated)
--   role='tool'      → tool invocations (tool_name + tool_args populated)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat.messages (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id         uuid NOT NULL REFERENCES chat.sessions(id) ON DELETE CASCADE,
  created_at         timestamptz NOT NULL DEFAULT now(),
  role               text NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content            text NOT NULL,
  model              text,                              -- null for role='user'
  tokens_in          integer,
  tokens_out         integer,
  latency_ms         integer,
  route              text,                              -- pathname when sent
  tool_name          text,
  tool_args          jsonb,
  injection_flagged  boolean NOT NULL DEFAULT false
);

-- Spend-cap aggregate query: WHERE created_at >= startOfDayUtc().
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
  ON chat.messages (created_at DESC);

-- Per-session listing + the session-message-count check used by FR-RATE-2.
CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON chat.messages (session_id, created_at);

-- Partial index for the abuse-audit queries (rare; only the flagged subset).
CREATE INDEX IF NOT EXISTS idx_chat_messages_flagged
  ON chat.messages (created_at DESC)
  WHERE injection_flagged = true;

-- ---------------------------------------------------------------------------
-- RLS — enable, ship no policies. Service-role bypasses; anon/authenticated
-- get nothing. The Route Handler is the only writer.
-- ---------------------------------------------------------------------------
ALTER TABLE chat.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat.messages ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 90-day retention via pg_cron.
--
-- DELETE cascades to chat.messages via the FK ON DELETE CASCADE. Runs daily
-- at 03:00 UTC — quiet hours for all relevant timezones.
--
-- cron.schedule is idempotent on job name: a second call with the same name
-- replaces the prior definition, so re-running this migration is safe.
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'chat-retention',
  '0 3 * * *',
  $$DELETE FROM chat.sessions WHERE created_at < now() - interval '90 days'$$
);

COMMIT;
