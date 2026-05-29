import { describe, it, expect } from 'vitest';
import { validateContactFormBody } from './validateContactForm';
import { DEFAULT_LEAD_SOURCE } from './leadSources';

const validInput = {
  name: 'Angus',
  email: 'angus@example.com',
  subject: 'Hello',
  message: 'Hello there',
  source: 'contact_page',
  recaptchaToken: 'token-123',
};

describe('validateContactFormBody', () => {
  describe('rejects', () => {
    it('null body with all five required errors', () => {
      const result = validateContactFormBody(null);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual([
          'Name is required',
          'Valid email is required',
          'Subject is required',
          'Message is required',
          'reCAPTCHA verification required',
        ]);
      }
    });

    it('undefined body with all five required errors', () => {
      const result = validateContactFormBody(undefined);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toHaveLength(5);
    });

    it('empty object with all five required errors', () => {
      const result = validateContactFormBody({});
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toHaveLength(5);
    });

    it('whitespace-only name', () => {
      const result = validateContactFormBody({ ...validInput, name: '   ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toEqual(['Name is required']);
    });

    it('non-string name', () => {
      const result = validateContactFormBody({ ...validInput, name: 42 });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toEqual(['Name is required']);
    });

    it.each([
      ['no @ sign', 'angusexample.com'],
      ['empty domain', 'angus@'],
      ['empty local part', '@example.com'],
      ['no TLD', 'angus@example'],
      ['contains whitespace', 'an gus@example.com'],
    ])('invalid email format: %s', (_label, email) => {
      const result = validateContactFormBody({ ...validInput, email });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toEqual(['Valid email is required']);
    });

    it('non-string email', () => {
      const result = validateContactFormBody({ ...validInput, email: 123 });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toEqual(['Valid email is required']);
    });

    it('whitespace-only subject', () => {
      const result = validateContactFormBody({ ...validInput, subject: '   ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toEqual(['Subject is required']);
    });

    it('whitespace-only message', () => {
      const result = validateContactFormBody({ ...validInput, message: '   ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toEqual(['Message is required']);
    });

    it('whitespace-only recaptchaToken', () => {
      const result = validateContactFormBody({ ...validInput, recaptchaToken: '   ' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toEqual(['reCAPTCHA verification required']);
    });

    it('source outside the known set', () => {
      const result = validateContactFormBody({ ...validInput, source: 'evil-spoof' });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toEqual(['Invalid source']);
    });

    it('reports multiple errors at once in field order', () => {
      const result = validateContactFormBody({
        name: '',
        email: 'not-an-email',
        subject: '',
        message: '',
        recaptchaToken: '',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual([
          'Name is required',
          'Valid email is required',
          'Subject is required',
          'Message is required',
          'reCAPTCHA verification required',
        ]);
      }
    });
  });

  describe('accepts', () => {
    it('clean valid input', () => {
      const result = validateContactFormBody(validInput);
      expect(result).toEqual({ ok: true, data: validInput });
    });

    it('trims name, subject, message, and recaptchaToken', () => {
      const result = validateContactFormBody({
        name: '  Angus  ',
        email: 'angus@example.com',
        subject: '  Hello  ',
        message: '  Hello there  ',
        source: 'contact_page',
        recaptchaToken: '  token-123  ',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.name).toBe('Angus');
        expect(result.data.subject).toBe('Hello');
        expect(result.data.message).toBe('Hello there');
        expect(result.data.recaptchaToken).toBe('token-123');
      }
    });

    it('lowercases email', () => {
      const result = validateContactFormBody({
        ...validInput,
        email: 'Angus.Hally@Example.COM',
      });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.email).toBe('angus.hally@example.com');
    });

    it('captures subject (previously dropped — issue #124)', () => {
      const result = validateContactFormBody({
        ...validInput,
        subject: 'A subject the server now keeps',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.subject).toBe('A subject the server now keeps');
      }
    });

    it('defaults source to contact_page when omitted (existing /contact client)', () => {
      const withoutSource = {
        name: validInput.name,
        email: validInput.email,
        subject: validInput.subject,
        message: validInput.message,
        recaptchaToken: validInput.recaptchaToken,
      };
      const result = validateContactFormBody(withoutSource);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.source).toBe(DEFAULT_LEAD_SOURCE);
    });

    it('defaults source when present but blank', () => {
      const result = validateContactFormBody({ ...validInput, source: '   ' });
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.data.source).toBe(DEFAULT_LEAD_SOURCE);
    });

    it.each(['teacher', 'strategist', 'ai-pm'])(
      'accepts known persona source: %s',
      (source) => {
        const result = validateContactFormBody({ ...validInput, source });
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.data.source).toBe(source);
      },
    );
  });
});
