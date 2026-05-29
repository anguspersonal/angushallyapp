-- Attributed lead capture for the contact form (PRD #123, issue #124).
--
-- Creates `crm.leads` — one row per contact-form submission. Placed in the
-- `crm` schema per the schema-separation convention (ADR-0002); leads are the
-- first CRM-domain table and seed the future follow-up workflow.
--
-- Columns mirror the `submitContact` service payload plus a lifecycle:
--   source     — which surface produced the lead (persona / page identifier);
--                kept as free text here, constrained to a known set in the
--                application layer (src/lib/contact/leadSources.ts) so adding
--                a persona never requires a DDL change.
--   name/email/subject/message — the submitted fields (subject was previously
--                dropped before this slice).
--   status     — follow-up lifecycle, enum default 'new'.
--   notes      — nullable operator scratch space for the later admin surface.
--   created_at — capture time.
--
-- Service-role bypasses RLS; anon/authenticated clients are denied by the
-- empty-policy default (the Route Handler is the only writer, matching the
-- chat tables in 20260523083500_create_chat_tables.sql).
--
-- All statements are idempotent (`IF NOT EXISTS`, guarded enum creation) so
-- re-running on a fresh database is safe.
--
-- ⚠ AUTHOR-ONLY MIGRATION — DO NOT APPLY here. Per DDL governance
-- (ADR-0003, issues #74/#76) the owner reviews and applies this against each
-- Supabase environment. No `supabase db push/reset`, no apply_migration MCP.

BEGIN;

CREATE SCHEMA IF NOT EXISTS crm;

-- ---------------------------------------------------------------------------
-- Lifecycle enum for the follow-up workflow. Guarded so re-running the
-- migration on a database that already has the type is a no-op (CREATE TYPE
-- has no IF NOT EXISTS form).
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'lead_status' AND n.nspname = 'crm'
  ) THEN
    CREATE TYPE crm.lead_status AS ENUM ('new', 'read', 'replied', 'archived');
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- crm.leads — one row per contact-form submission.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crm.leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source      text NOT NULL,                              -- persona / page identifier
  name        text NOT NULL,
  email       text NOT NULL,
  subject     text NOT NULL,
  message     text NOT NULL,
  status      crm.lead_status NOT NULL DEFAULT 'new',
  notes       text,                                       -- nullable; operator follow-up
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Admin surface (later initiative) lists newest-first and filters by status /
-- source. These indexes cover those query shapes ahead of the UI landing.
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at
  ON crm.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status_created_at
  ON crm.leads (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source_created_at
  ON crm.leads (source, created_at DESC);

-- ---------------------------------------------------------------------------
-- RLS — enable, ship no policies. Service-role bypasses; anon/authenticated
-- get nothing. The contact Route Handler (service-role admin client) is the
-- only writer.
-- ---------------------------------------------------------------------------
ALTER TABLE crm.leads ENABLE ROW LEVEL SECURITY;

COMMIT;
