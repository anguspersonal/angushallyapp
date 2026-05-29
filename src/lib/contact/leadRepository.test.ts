import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { HttpError } from '@/lib/api/httpError';
import { createLead, type CreateLeadInput } from './leadRepository';

interface StubResult {
  data?: unknown;
  error?: unknown;
}

/**
 * Thenable Supabase stub mirroring src/lib/bookmarks/bookmarksRepository.test.ts:
 * every builder method returns the same object so `.schema().from().insert()
 * .select().single()` resolves to the configured result.
 */
function supabaseStub(result: StubResult): SupabaseClient {
  const stub: Record<string, unknown> = {
    then: (resolve: (v: StubResult) => unknown) => Promise.resolve(result).then(resolve),
  };
  for (const m of ['schema', 'from', 'insert', 'select', 'single']) {
    stub[m] = vi.fn(() => stub);
  }
  return stub as unknown as SupabaseClient;
}

const VALID_INPUT: CreateLeadInput = {
  source: 'contact_page',
  name: 'Angus',
  email: 'angus@example.com',
  subject: 'Hello',
  message: 'Hello there',
};

const PERSISTED_ROW = {
  id: '11111111-2222-4222-9222-333333333333',
  source: 'contact_page',
  name: 'Angus',
  email: 'angus@example.com',
  subject: 'Hello',
  message: 'Hello there',
  status: 'new',
  notes: null,
  created_at: '2026-05-29T17:00:00.000Z',
};

describe('createLead', () => {
  it('returns the persisted lead shape (camelCased) on success', async () => {
    const admin = supabaseStub({ data: PERSISTED_ROW, error: null });
    const lead = await createLead(admin, VALID_INPUT);
    expect(lead).toEqual({
      id: '11111111-2222-4222-9222-333333333333',
      source: 'contact_page',
      name: 'Angus',
      email: 'angus@example.com',
      subject: 'Hello',
      message: 'Hello there',
      status: 'new',
      notes: null,
      createdAt: '2026-05-29T17:00:00.000Z',
    });
  });

  it('writes the expected row into crm.leads (status defaults at the DB)', async () => {
    const single = vi.fn(() => Promise.resolve({ data: PERSISTED_ROW, error: null }));
    const select = vi.fn(() => ({ single }));
    const insert = vi.fn((_payload: Record<string, unknown>) => ({ select }));
    const from = vi.fn(() => ({ insert }));
    const schema = vi.fn(() => ({ from }));
    const admin = { schema } as unknown as SupabaseClient;

    const lead = await createLead(admin, VALID_INPUT);

    expect(schema).toHaveBeenCalledWith('crm');
    expect(from).toHaveBeenCalledWith('leads');
    expect(insert).toHaveBeenCalledWith({
      source: 'contact_page',
      name: 'Angus',
      email: 'angus@example.com',
      subject: 'Hello',
      message: 'Hello there',
    });
    // status/notes/created_at are NOT in the insert payload — the DB applies
    // the `new` default and timestamp.
    const insertedPayload = insert.mock.calls[0][0];
    expect(insertedPayload).not.toHaveProperty('status');
    expect(insertedPayload).not.toHaveProperty('notes');
    expect(lead.status).toBe('new');
  });

  it('throws HttpError(500) on a Supabase error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const admin = supabaseStub({ data: null, error: { message: 'boom' } });
    await expect(createLead(admin, VALID_INPUT)).rejects.toBeInstanceOf(HttpError);
    await expect(createLead(admin, VALID_INPUT)).rejects.toMatchObject({ status: 500 });
    consoleError.mockRestore();
  });

  it('throws HttpError(500) when the insert returns no row', async () => {
    const admin = supabaseStub({ data: null, error: null });
    await expect(createLead(admin, VALID_INPUT)).rejects.toBeInstanceOf(HttpError);
  });
});
