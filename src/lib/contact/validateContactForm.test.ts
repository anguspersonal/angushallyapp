import { describe, it, expect } from 'vitest';
import { validateContactFormBody } from './validateContactForm';

const validInput = {
  name: 'Angus',
  email: 'angus@example.com',
  message: 'Hello there',
  recaptchaToken: 'token-123',
};

describe('validateContactFormBody', () => {
  describe('rejects', () => {
    it('null body with all four required errors', () => {
      const result = validateContactFormBody(null);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual([
          'Name is required',
          'Valid email is required',
          'Message is required',
          'reCAPTCHA verification required',
        ]);
      }
    });

    it('undefined body with all four required errors', () => {
      const result = validateContactFormBody(undefined);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toHaveLength(4);
    });

    it('empty object with all four required errors', () => {
      const result = validateContactFormBody({});
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.errors).toHaveLength(4);
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

    it('reports multiple errors at once in field order', () => {
      const result = validateContactFormBody({
        name: '',
        email: 'not-an-email',
        message: '',
        recaptchaToken: '',
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.errors).toEqual([
          'Name is required',
          'Valid email is required',
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

    it('trims name, message, and recaptchaToken', () => {
      const result = validateContactFormBody({
        name: '  Angus  ',
        email: 'angus@example.com',
        message: '  Hello there  ',
        recaptchaToken: '  token-123  ',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.name).toBe('Angus');
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

    it('ignores extra unknown fields (e.g. subject from the client form)', () => {
      // The client form posts `subject` but the validator currently drops it.
      // This test pins the current behavior so the divergence is visible.
      const result = validateContactFormBody({
        ...validInput,
        subject: 'A subject the server ignores',
      });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).not.toHaveProperty('subject');
      }
    });
  });
});
