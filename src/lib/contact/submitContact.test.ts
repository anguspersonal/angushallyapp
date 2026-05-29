import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----- mocks (faked collaborators, per the /api/chat route tests, PR #80) ---

vi.mock('@/lib/recaptcha/siteVerify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/recaptcha/siteVerify')>();
  return {
    ...actual, // keep the real isRecaptchaTokenValidationError classifier
    verifyRecaptchaSite: vi.fn(),
  };
});

vi.mock('@/lib/email', () => ({
  sendInquiryToOwner: vi.fn(),
  sendAcknowledgmentToUser: vi.fn(),
}));

vi.mock('./leadRepository', () => ({
  createLead: vi.fn(),
}));

import type { SupabaseClient } from '@supabase/supabase-js';
import { submitContact } from './submitContact';
import { HttpError } from '@/lib/api/httpError';
import { verifyRecaptchaSite } from '@/lib/recaptcha/siteVerify';
import { sendAcknowledgmentToUser, sendInquiryToOwner } from '@/lib/email';
import { EmailConfigError } from '@/lib/email/errors';
import { createLead, type Lead } from './leadRepository';
import type { ValidatedContactForm } from './validateContactForm';

const VALID_INPUT: ValidatedContactForm = {
  name: 'Angus',
  email: 'angus@example.com',
  subject: 'Hello',
  message: 'Hello there',
  source: 'contact_page',
  recaptchaToken: 'token-123',
};

const PERSISTED_LEAD: Lead = {
  id: '11111111-2222-4222-9222-333333333333',
  source: 'contact_page',
  name: 'Angus',
  email: 'angus@example.com',
  subject: 'Hello',
  message: 'Hello there',
  status: 'new',
  notes: null,
  createdAt: '2026-05-29T17:00:00.000Z',
};

// A stand-in admin client; the repository is mocked so its methods are unused.
const fakeAdmin = {} as SupabaseClient;

describe('submitContact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createLead).mockResolvedValue(PERSISTED_LEAD);
    vi.mocked(sendInquiryToOwner).mockResolvedValue(undefined as never);
    vi.mocked(sendAcknowledgmentToUser).mockResolvedValue(undefined as never);
  });

  describe('happy path', () => {
    it('verifies reCAPTCHA, persists the lead, and sends both emails', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });

      const result = await submitContact(VALID_INPUT, { admin: fakeAdmin });

      expect(result.message).toBe('Contact form submitted successfully');
      expect(result.lead).toEqual(PERSISTED_LEAD);

      expect(verifyRecaptchaSite).toHaveBeenCalledTimes(1);
      expect(verifyRecaptchaSite).toHaveBeenCalledWith('token-123');

      // Lead persisted with the attributed source + the captured subject.
      expect(createLead).toHaveBeenCalledTimes(1);
      expect(createLead).toHaveBeenCalledWith(fakeAdmin, {
        source: 'contact_page',
        name: 'Angus',
        email: 'angus@example.com',
        subject: 'Hello',
        message: 'Hello there',
      });

      // Exactly one owner email (with subject + reply-to via the mailer) and
      // one acknowledgment.
      expect(sendInquiryToOwner).toHaveBeenCalledTimes(1);
      expect(sendInquiryToOwner).toHaveBeenCalledWith({
        name: 'Angus',
        email: 'angus@example.com',
        subject: 'Hello',
        message: 'Hello there',
      });
      expect(sendAcknowledgmentToUser).toHaveBeenCalledTimes(1);
      expect(sendAcknowledgmentToUser).toHaveBeenCalledWith(
        'Angus',
        'angus@example.com',
        'Hello there',
      );
    });

    it('persists the lead BEFORE sending emails (inquiries are never lost)', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });
      const order: string[] = [];
      vi.mocked(createLead).mockImplementation(async () => {
        order.push('persist');
        return PERSISTED_LEAD;
      });
      vi.mocked(sendInquiryToOwner).mockImplementation(async () => {
        order.push('email');
      });

      await submitContact(VALID_INPUT, { admin: fakeAdmin });

      expect(order).toEqual(['persist', 'email']);
    });

    it('still sends emails when Supabase is unconfigured (admin = null), no persist', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });

      const result = await submitContact(VALID_INPUT, { admin: null });

      expect(result.lead).toBeNull();
      expect(createLead).not.toHaveBeenCalled();
      expect(sendInquiryToOwner).toHaveBeenCalledTimes(1);
      expect(sendAcknowledgmentToUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('reCAPTCHA failures short-circuit (no persist, no email)', () => {
    it('throws 400 when the token is a validation failure', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({
        success: false,
        'error-codes': ['invalid-input-response'],
      });

      await expect(submitContact(VALID_INPUT, { admin: fakeAdmin })).rejects.toMatchObject({
        status: 400,
        message: 'reCAPTCHA verification failed',
      });
      expect(createLead).not.toHaveBeenCalled();
      expect(sendInquiryToOwner).not.toHaveBeenCalled();
      expect(sendAcknowledgmentToUser).not.toHaveBeenCalled();
    });

    it('throws 502 on a server-side reCAPTCHA error code', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({
        success: false,
        'error-codes': ['invalid-input-secret'],
      });

      await expect(submitContact(VALID_INPUT, { admin: fakeAdmin })).rejects.toMatchObject({
        status: 502,
        message: 'Failed to verify reCAPTCHA token',
      });
      expect(createLead).not.toHaveBeenCalled();
      expect(sendInquiryToOwner).not.toHaveBeenCalled();
    });

    it('throws 502 when the verifier itself throws', async () => {
      vi.mocked(verifyRecaptchaSite).mockRejectedValue(new Error('network down'));

      await expect(submitContact(VALID_INPUT, { admin: fakeAdmin })).rejects.toMatchObject({
        status: 502,
        message: 'Failed to verify reCAPTCHA token',
      });
      expect(createLead).not.toHaveBeenCalled();
    });

    it('throws 400 when success=true but warning codes are present', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({
        success: true,
        'error-codes': ['some-warning'],
      });

      await expect(submitContact(VALID_INPUT, { admin: fakeAdmin })).rejects.toMatchObject({
        status: 400,
      });
      expect(createLead).not.toHaveBeenCalled();
    });
  });

  describe('email failure-mode separation', () => {
    it('maps EmailConfigError to 500 email_misconfigured (lead still persisted)', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });
      vi.mocked(sendInquiryToOwner).mockRejectedValue(
        new EmailConfigError('RECIPIENT_EMAIL is not configured'),
      );
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await expect(submitContact(VALID_INPUT, { admin: fakeAdmin })).rejects.toMatchObject({
        status: 500,
        code: 'email_misconfigured',
        message: 'Email service misconfigured',
      });
      // The lead was persisted before the email attempt — it is not lost.
      expect(createLead).toHaveBeenCalledTimes(1);
      consoleError.mockRestore();
    });

    it('maps a generic SMTP error to 502 email_unavailable', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });
      vi.mocked(sendInquiryToOwner).mockRejectedValue(new Error('smtp down'));
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await expect(submitContact(VALID_INPUT, { admin: fakeAdmin })).rejects.toMatchObject({
        status: 502,
        code: 'email_unavailable',
        message: 'Email service unavailable',
      });
      consoleError.mockRestore();
    });
  });

  describe('#102 regression — opaque 500 collapse is fixed', () => {
    // Before this slice the route wrapped both email sends in one try/catch and
    // re-threw `HttpError(500, 'Failed to process contact form submission')`,
    // collapsing EVERY underlying failure (transient SMTP included) into one
    // opaque 500 with no code. That is the user-reported symptom in #102.
    //
    // This test pins the fixed behaviour: a transient SMTP outage now surfaces
    // as a distinct, retryable 502 `email_unavailable` (NOT a 500 with the old
    // generic message), the real cause is logged for the operator, and the
    // lead is persisted regardless so the inquiry survives the email failure.
    it('a transient SMTP failure no longer collapses into the generic 500', async () => {
      vi.mocked(verifyRecaptchaSite).mockResolvedValue({ success: true });
      const underlying = new Error('ECONNREFUSED 127.0.0.1:587');
      (underlying as { code?: string }).code = 'ECONNREFUSED';
      vi.mocked(sendInquiryToOwner).mockRejectedValue(underlying);
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      let thrown: unknown;
      try {
        await submitContact(VALID_INPUT, { admin: fakeAdmin });
      } catch (err) {
        thrown = err;
      }

      expect(thrown).toBeInstanceOf(HttpError);
      const httpError = thrown as HttpError;
      // The old opaque behaviour is gone.
      expect(httpError.status).not.toBe(500);
      expect(httpError.message).not.toBe('Failed to process contact form submission');
      // The fixed behaviour: a distinct, retryable failure mode.
      expect(httpError.status).toBe(502);
      expect(httpError.code).toBe('email_unavailable');

      // The underlying cause is surfaced to the operator (not swallowed).
      expect(consoleError).toHaveBeenCalled();
      const [, payload] = consoleError.mock.calls[0] as [string, Record<string, unknown>];
      expect(payload).toMatchObject({ message: 'ECONNREFUSED 127.0.0.1:587', code: 'ECONNREFUSED' });

      // The lead is persisted even though the email failed — inquiry not lost.
      expect(createLead).toHaveBeenCalledTimes(1);

      consoleError.mockRestore();
    });
  });
});
