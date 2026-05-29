import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import type { LeadSource } from './leadSources';

/**
 * Lead persistence — a deep module over `crm.leads` (PRD #123, issue #124).
 *
 * Follows the repository-contract (ADR-0036) and db-access-layer (ADR-0004)
 * conventions, mirroring `bookmarksRepository` / `blogRepository`:
 *  - takes the service-role admin client (RLS bypassed; the only writer),
 *  - returns the persisted shape on success,
 *  - throws `HttpError(500, ...)` (and `console.error`s) on a Supabase error.
 *
 * `create()` is the only method now; list / update-status are reserved for the
 * later admin surface (out of scope per the PRD).
 */

export type LeadStatus = 'new' | 'read' | 'replied' | 'archived';

export interface CreateLeadInput {
  source: LeadSource;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Lead {
  id: string;
  source: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
}

function mapLeadRow(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    source: String(row.source),
    name: String(row.name),
    email: String(row.email),
    subject: String(row.subject),
    message: String(row.message),
    status: (row.status as LeadStatus) ?? 'new',
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at ? String(row.created_at) : '',
  };
}

/**
 * Inserts a lead and returns the persisted row (with DB-assigned id, default
 * `status: 'new'`, and `created_at`).
 */
export async function createLead(
  admin: SupabaseClient,
  input: CreateLeadInput,
): Promise<Lead> {
  const { data, error } = await admin
    .schema('crm')
    .from('leads')
    .insert({
      source: input.source,
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    })
    .select()
    .single();

  if (error) {
    console.error('[contact] createLead', error);
    throw new HttpError(500, 'Failed to persist lead');
  }
  if (!data) {
    throw new HttpError(500, 'Failed to persist lead');
  }
  return mapLeadRow(data as Record<string, unknown>);
}
