'use client';

import { useCallback, useMemo, useState } from 'react';
import { api } from '@/lib/api/client';

/**
 * Shared, persona-agnostic contact-form logic.
 *
 * This hook owns validation + the submit lifecycle so every persona's skinned
 * `ContactForm` behaves identically while looking however the persona wants.
 * It is deliberately decoupled from the network: the actual submit is an
 * injectable `submit` function (defaulting to a POST to `/api/contact` via the
 * app's `api` client). Tests fake `submit` — they never touch a real network.
 *
 * The hook always forwards `source` (which persona/page the lead came from)
 * and `subject` to the submit function, matching the extended API contract
 * described in PRD #123 (`{ name, email, subject, message, source,
 * recaptchaToken }`).
 */

/** Mutually-exclusive lifecycle phases. */
export type ContactFormStatus = 'idle' | 'submitting' | 'success' | 'error';

/** The user-editable fields. `subject` is optional in the UI but always sent. */
export interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Per-field validation errors. Absent key === field is valid. */
export type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

/**
 * The payload handed to `submit`. Mirrors the `/api/contact` contract: the
 * user fields plus the persona `source` and the (optional) reCAPTCHA token.
 */
export interface ContactSubmitPayload extends ContactFormValues {
  source: string;
  recaptchaToken?: string;
}

/** A pluggable submit. Resolves on success, rejects (throws) on failure. */
export type ContactSubmitFn = (payload: ContactSubmitPayload) => Promise<unknown>;

export interface UseContactFormOptions {
  /**
   * Persona / page identifier attributed to every lead (e.g. 'dev',
   * 'strategist'). Always forwarded to `submit`.
   */
  source: string;
  /** Seed values, e.g. a draft handed off from the chatbot. */
  initialValues?: Partial<ContactFormValues>;
  /**
   * When true, a non-empty `recaptchaToken` must be supplied before submit is
   * allowed. Defaults to false so the hook is usable without reCAPTCHA wiring.
   */
  requireRecaptcha?: boolean;
  /**
   * The actual submit. Injectable so it can be faked in tests and swapped per
   * environment. Defaults to a POST to `/api/contact` via the `api` client.
   */
  submit?: ContactSubmitFn;
}

export interface UseContactFormResult {
  values: ContactFormValues;
  errors: ContactFormErrors;
  status: ContactFormStatus;
  /** Convenience flags derived from `status`. */
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  /** Human-readable error message after a failed submit (null otherwise). */
  errorMessage: string | null;
  /** Update a single field (clears that field's error). */
  setFieldValue: (field: keyof ContactFormValues, value: string) => void;
  /** Set / clear the reCAPTCHA token. */
  setRecaptchaToken: (token: string | null) => void;
  /** Validate without submitting. Returns true when the form is valid. */
  validate: () => boolean;
  /**
   * Validate then submit. No-op (returns false) when already submitting or
   * when validation fails — i.e. submission is gated on validity.
   */
  handleSubmit: () => Promise<boolean>;
  /** Reset back to the seeded values and the idle state. */
  reset: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MIN_LENGTH = 10;

const EMPTY_VALUES: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

/**
 * Pure field validation. Mirrors the server-side rules in
 * `validateContactForm.ts` (name non-empty, email format, message min length).
 * The reCAPTCHA gate lives in the hook because it is not a form field.
 */
export function validateContactValues(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Name is required';
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = 'Valid email is required';
  }
  if (values.message.trim().length < MESSAGE_MIN_LENGTH) {
    errors.message = `Message must be at least ${MESSAGE_MIN_LENGTH} characters`;
  }

  return errors;
}

function defaultSubmit(payload: ContactSubmitPayload): Promise<unknown> {
  return api.post('/contact', payload);
}

function messageFromError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function useContactForm(options: UseContactFormOptions): UseContactFormResult {
  const { source, initialValues, requireRecaptcha = false, submit } = options;

  const seededValues = useMemo<ContactFormValues>(
    () => ({ ...EMPTY_VALUES, ...initialValues }),
    [initialValues],
  );

  const [values, setValues] = useState<ContactFormValues>(seededValues);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<ContactFormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaTokenState] = useState<string | null>(null);

  const submitFn = submit ?? defaultSubmit;

  const setFieldValue = useCallback((field: keyof ContactFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const setRecaptchaToken = useCallback((token: string | null) => {
    setRecaptchaTokenState(token);
  }, []);

  const validate = useCallback((): boolean => {
    const fieldErrors = validateContactValues(values);
    const recaptchaMissing = requireRecaptcha && !recaptchaToken?.trim();
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0 && !recaptchaMissing;
  }, [values, requireRecaptcha, recaptchaToken]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    // Gate: never fire two submits at once.
    if (status === 'submitting') return false;

    // Gate: submission requires a valid form (incl. reCAPTCHA when required).
    const fieldErrors = validateContactValues(values);
    const recaptchaMissing = requireRecaptcha && !recaptchaToken?.trim();
    if (Object.keys(fieldErrors).length > 0 || recaptchaMissing) {
      setErrors(fieldErrors);
      return false;
    }

    setStatus('submitting');
    setErrorMessage(null);

    const payload: ContactSubmitPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
      source,
      ...(recaptchaToken ? { recaptchaToken } : {}),
    };

    try {
      await submitFn(payload);
      setStatus('success');
      return true;
    } catch (error) {
      setStatus('error');
      setErrorMessage(messageFromError(error));
      return false;
    }
  }, [status, values, requireRecaptcha, recaptchaToken, source, submitFn]);

  const reset = useCallback(() => {
    setValues(seededValues);
    setErrors({});
    setStatus('idle');
    setErrorMessage(null);
    setRecaptchaTokenState(null);
  }, [seededValues]);

  return {
    values,
    errors,
    status,
    isSubmitting: status === 'submitting',
    isSuccess: status === 'success',
    isError: status === 'error',
    errorMessage,
    setFieldValue,
    setRecaptchaToken,
    validate,
    handleSubmit,
    reset,
  };
}
