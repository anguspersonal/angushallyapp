import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/contact/submitContact', () => ({
  submitContact: vi.fn(),
}));

vi.mock('@/lib/email/envValidation', () => ({
  validateEmailEnvOnce: vi.fn(() => []),
}));

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: vi.fn(() => null), // no DB in route unit tests
}));

import type { NextRequest } from 'next/server';
import { POST } from './route';
import { submitContact } from '@/lib/contact/submitContact';
import { validateEmailEnvOnce } from '@/lib/email/envValidation';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { HttpError } from '@/lib/api/httpError';

function makeRequest(body: unknown, opts: { malformed?: boolean } = {}): NextRequest {
  return {
    json: async () => {
      if (opts.malformed) throw new Error('bad json');
      return body;
    },
  } as unknown as NextRequest;
}

const validBody = {
  name: '  Angus  ',
  email: 'Angus@Example.com',
  subject: 'Hello',
  message: 'Hello there',
  source: 'contact_page',
  recaptchaToken: 'token-123',
};

// The normalised payload the validator hands the service.
const normalisedInput = {
  name: 'Angus',
  email: 'angus@example.com',
  subject: 'Hello',
  message: 'Hello there',
  source: 'contact_page',
  recaptchaToken: 'token-123',
};

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSupabaseAdmin).mockReturnValue(null);
    vi.mocked(submitContact).mockResolvedValue({
      message: 'Contact form submitted successfully',
      lead: null,
    });
  });

  it('returns 400 when JSON body is malformed', async () => {
    const response = await POST(makeRequest(null, { malformed: true }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON payload' });
    expect(submitContact).not.toHaveBeenCalled();
  });

  it('returns 400 with field errors when validation fails (subject now required)', async () => {
    const response = await POST(makeRequest({ name: '' }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors).toEqual([
      'Name is required',
      'Valid email is required',
      'Subject is required',
      'Message is required',
      'reCAPTCHA verification required',
    ]);
    expect(submitContact).not.toHaveBeenCalled();
  });

  it('returns 400 when source is outside the known set', async () => {
    const response = await POST(makeRequest({ ...validBody, source: 'evil' }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors).toContain('Invalid source');
    expect(submitContact).not.toHaveBeenCalled();
  });

  it('calls validateEmailEnvOnce on every request (helper dedupes internally)', async () => {
    await POST(makeRequest(validBody));
    expect(validateEmailEnvOnce).toHaveBeenCalled();
  });

  it('happy path: delegates the normalised payload + admin client to submitContact, returns 200', async () => {
    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: 'Contact form submitted successfully',
    });

    expect(submitContact).toHaveBeenCalledTimes(1);
    expect(submitContact).toHaveBeenCalledWith(normalisedInput, { admin: null });
  });

  it('defaults source to contact_page when omitted (existing /contact client)', async () => {
    const withoutSource = {
      name: validBody.name,
      email: validBody.email,
      subject: validBody.subject,
      message: validBody.message,
      recaptchaToken: validBody.recaptchaToken,
    };
    await POST(makeRequest(withoutSource));
    expect(submitContact).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'contact_page' }),
      { admin: null },
    );
  });

  it('maps an HttpError thrown by the service to the correct response (reCAPTCHA invalid)', async () => {
    vi.mocked(submitContact).mockRejectedValue(
      new HttpError(400, 'reCAPTCHA verification failed'),
    );
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'reCAPTCHA verification failed' });
  });

  it('maps a 502 email_unavailable from the service (the #102 failure mode is no longer an opaque 500)', async () => {
    vi.mocked(submitContact).mockRejectedValue(
      new HttpError(502, 'Email service unavailable', 'email_unavailable'),
    );
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Email service unavailable',
      code: 'email_unavailable',
    });
  });

  it('maps a 500 email_misconfigured from the service', async () => {
    vi.mocked(submitContact).mockRejectedValue(
      new HttpError(500, 'Email service misconfigured', 'email_misconfigured'),
    );
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Email service misconfigured',
      code: 'email_misconfigured',
    });
  });
});
