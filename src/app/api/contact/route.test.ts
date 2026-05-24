import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/recaptcha/siteVerify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/recaptcha/siteVerify')>();
  return {
    ...actual,
    verifyRecaptchaSite: vi.fn(),
  };
});

vi.mock('@/lib/email', () => ({
  sendInquiryToOwner: vi.fn(),
  sendAcknowledgmentToUser: vi.fn(),
}));

vi.mock('@/lib/email/envValidation', () => ({
  validateEmailEnvOnce: vi.fn(() => []),
}));

import type { NextRequest } from 'next/server';
import { POST } from './route';
import { verifyRecaptchaSite } from '@/lib/recaptcha/siteVerify';
import {
  sendAcknowledgmentToUser,
  sendInquiryToOwner,
} from '@/lib/email';
import { EmailConfigError } from '@/lib/email/errors';
import { validateEmailEnvOnce } from '@/lib/email/envValidation';

function makeRequest(
  body: unknown,
  opts: { malformed?: boolean } = {},
): NextRequest {
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
  message: 'Hello there',
  recaptchaToken: 'token-123',
};

const trimmedFields = {
  name: 'Angus',
  email: 'angus@example.com',
  message: 'Hello there',
};

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Sensible defaults; individual tests override
    vi.mocked(sendInquiryToOwner).mockResolvedValue(undefined as never);
    vi.mocked(sendAcknowledgmentToUser).mockResolvedValue(undefined as never);
  });

  it('returns 400 when JSON body is malformed', async () => {
    const response = await POST(makeRequest(null, { malformed: true }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Invalid JSON payload' });
    expect(verifyRecaptchaSite).not.toHaveBeenCalled();
    expect(sendInquiryToOwner).not.toHaveBeenCalled();
  });

  it('returns 400 with field errors when validation fails', async () => {
    const response = await POST(makeRequest({ name: '' }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors).toEqual([
      'Name is required',
      'Valid email is required',
      'Message is required',
      'reCAPTCHA verification required',
    ]);
    expect(verifyRecaptchaSite).not.toHaveBeenCalled();
    expect(sendInquiryToOwner).not.toHaveBeenCalled();
  });

  it('returns 502 when reCAPTCHA verification throws', async () => {
    vi.mocked(verifyRecaptchaSite).mockRejectedValue(new Error('boom'));
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Failed to verify reCAPTCHA token',
    });
    expect(sendInquiryToOwner).not.toHaveBeenCalled();
  });

  it('returns 400 when reCAPTCHA token is invalid', async () => {
    vi.mocked(verifyRecaptchaSite).mockResolvedValue({
      success: false,
      'error-codes': ['invalid-input-response'],
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'reCAPTCHA verification failed',
    });
    expect(sendInquiryToOwner).not.toHaveBeenCalled();
  });

  it('returns 502 when reCAPTCHA verification has a server-side error', async () => {
    vi.mocked(verifyRecaptchaSite).mockResolvedValue({
      success: false,
      'error-codes': ['invalid-input-secret'],
    });
    const response = await POST(makeRequest(validBody));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Failed to verify reCAPTCHA token',
    });
    expect(sendInquiryToOwner).not.toHaveBeenCalled();
  });

  it('returns 502 with email_unavailable code when SMTP send throws a generic error', async () => {
    vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });
    vi.mocked(sendInquiryToOwner).mockRejectedValue(new Error('smtp down'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Email service unavailable',
      code: 'email_unavailable',
    });
    // Operator must be able to see the underlying cause in logs.
    expect(consoleErrorSpy).toHaveBeenCalled();
    const [, payload] = consoleErrorSpy.mock.calls[0];
    expect(payload).toMatchObject({ message: 'smtp down' });

    consoleErrorSpy.mockRestore();
  });

  it('returns 500 with email_misconfigured code when send throws EmailConfigError', async () => {
    vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });
    vi.mocked(sendInquiryToOwner).mockRejectedValue(
      new EmailConfigError('RECIPIENT_EMAIL is not configured'),
    );
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: 'Email service misconfigured',
      code: 'email_misconfigured',
    });

    consoleErrorSpy.mockRestore();
  });

  it('calls validateEmailEnvOnce on every request (helper handles dedupe internally)', async () => {
    vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });
    await POST(makeRequest(validBody));
    expect(validateEmailEnvOnce).toHaveBeenCalled();
  });

  it('happy path: verifies reCAPTCHA, sends one owner + one user email with trimmed/lowercased data, returns 200', async () => {
    vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: 'Contact form submitted successfully',
    });

    expect(verifyRecaptchaSite).toHaveBeenCalledTimes(1);
    expect(verifyRecaptchaSite).toHaveBeenCalledWith('token-123');

    expect(sendInquiryToOwner).toHaveBeenCalledTimes(1);
    expect(sendInquiryToOwner).toHaveBeenCalledWith(trimmedFields);
    expect(sendAcknowledgmentToUser).toHaveBeenCalledTimes(1);
    expect(sendAcknowledgmentToUser).toHaveBeenCalledWith(
      trimmedFields.name,
      trimmedFields.email,
      trimmedFields.message,
    );
  });
});
