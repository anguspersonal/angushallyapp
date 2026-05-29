/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useContactForm, validateContactValues, type ContactSubmitFn } from './useContactForm';

/**
 * Behaviour tests for the shared `useContactForm` hook (issue #127).
 *
 * Per the issue: assert observable behaviour with a FAKED submit — never a
 * real network. We exercise the hook via renderHook, not rendered pixels.
 */

const VALID = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Collaboration',
  message: 'I would love to work together on something.',
};

/** Fill every field with valid values via the hook's setters. */
function fillValid(
  result: { current: ReturnType<typeof useContactForm> },
  overrides: Partial<typeof VALID> = {},
) {
  const values = { ...VALID, ...overrides };
  act(() => {
    result.current.setFieldValue('name', values.name);
    result.current.setFieldValue('email', values.email);
    result.current.setFieldValue('subject', values.subject);
    result.current.setFieldValue('message', values.message);
  });
}

describe('validateContactValues', () => {
  it('passes for a well-formed form', () => {
    expect(validateContactValues(VALID)).toEqual({});
  });

  it('flags an empty name', () => {
    expect(validateContactValues({ ...VALID, name: '  ' })).toHaveProperty('name');
  });

  it('flags a malformed email', () => {
    expect(validateContactValues({ ...VALID, email: 'not-an-email' })).toHaveProperty('email');
  });

  it('flags a too-short message', () => {
    expect(validateContactValues({ ...VALID, message: 'hi' })).toHaveProperty('message');
  });

  it('does NOT require a subject (optional field, always sent)', () => {
    expect(validateContactValues({ ...VALID, subject: '' })).not.toHaveProperty('subject');
  });
});

describe('useContactForm', () => {
  let submit: ReturnType<typeof vi.fn> & ContactSubmitFn;

  beforeEach(() => {
    submit = vi.fn().mockResolvedValue({ message: 'ok' }) as never;
  });

  it('starts idle with empty values', () => {
    const { result } = renderHook(() => useContactForm({ source: 'dev', submit }));
    expect(result.current.status).toBe('idle');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.values).toEqual({ name: '', email: '', subject: '', message: '' });
    expect(result.current.errors).toEqual({});
  });

  it('seeds from initialValues (e.g. a chat hand-off draft)', () => {
    const { result } = renderHook(() =>
      useContactForm({
        source: 'dev',
        submit,
        initialValues: { name: 'Grace', message: 'Prefilled message body.' },
      }),
    );
    expect(result.current.values.name).toBe('Grace');
    expect(result.current.values.message).toBe('Prefilled message body.');
    expect(result.current.values.email).toBe('');
  });

  // --- validation gating -------------------------------------------------

  it('gates submit on validation: invalid form does NOT call submit', async () => {
    const { result } = renderHook(() => useContactForm({ source: 'dev', submit }));

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.handleSubmit();
    });

    expect(returned).toBe(false);
    expect(submit).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
    // Field errors are surfaced for the empty fields.
    expect(result.current.errors.name).toBeTruthy();
    expect(result.current.errors.email).toBeTruthy();
    expect(result.current.errors.message).toBeTruthy();
  });

  it('validate() returns false and sets errors for an empty form', () => {
    const { result } = renderHook(() => useContactForm({ source: 'dev', submit }));
    let ok: boolean | undefined;
    act(() => {
      ok = result.current.validate();
    });
    expect(ok).toBe(false);
    expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
  });

  it('setFieldValue clears that field’s error', () => {
    const { result } = renderHook(() => useContactForm({ source: 'dev', submit }));
    act(() => {
      result.current.validate();
    });
    expect(result.current.errors.name).toBeTruthy();
    act(() => {
      result.current.setFieldValue('name', 'Ada');
    });
    expect(result.current.errors.name).toBeUndefined();
  });

  // --- happy path: idle -> submitting -> success -------------------------

  it('transitions idle -> submitting -> success on a resolving submit', async () => {
    let resolveSubmit: (v: unknown) => void = () => {};
    const pending = new Promise((res) => {
      resolveSubmit = res;
    });
    const slowSubmit = vi.fn().mockReturnValue(pending) as never as ContactSubmitFn;

    const { result } = renderHook(() => useContactForm({ source: 'dev', submit: slowSubmit }));
    fillValid(result);

    let submitPromise: Promise<boolean>;
    act(() => {
      submitPromise = result.current.handleSubmit();
    });

    // Mid-flight: we are submitting.
    expect(result.current.status).toBe('submitting');
    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSubmit(undefined);
      await submitPromise;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
  });

  // --- error path: idle -> submitting -> error ---------------------------

  it('transitions to error and captures the message when submit rejects', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('Email service unavailable')) as never as ContactSubmitFn;
    const { result } = renderHook(() => useContactForm({ source: 'dev', submit: failing }));
    fillValid(result);

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.handleSubmit();
    });

    expect(returned).toBe(false);
    expect(result.current.status).toBe('error');
    expect(result.current.isError).toBe(true);
    expect(result.current.errorMessage).toBe('Email service unavailable');
  });

  // --- passes source + subject ------------------------------------------

  it('passes source + subject (and the other fields) through to submit', async () => {
    const { result } = renderHook(() => useContactForm({ source: 'strategist', submit }));
    fillValid(result, { subject: 'Data strategy engagement' });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).toHaveBeenCalledTimes(1);
    const payload = submit.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Data strategy engagement',
      message: VALID.message,
      source: 'strategist',
    });
  });

  it('trims field values in the submitted payload', async () => {
    const { result } = renderHook(() => useContactForm({ source: 'dev', submit }));
    fillValid(result, { name: '  Ada  ', subject: '  Hi  ' });

    await act(async () => {
      await result.current.handleSubmit();
    });

    const payload = submit.mock.calls[0][0];
    expect(payload.name).toBe('Ada');
    expect(payload.subject).toBe('Hi');
  });

  // --- reCAPTCHA gating --------------------------------------------------

  it('gates submit on reCAPTCHA when required, then allows it once a token is set', async () => {
    const { result } = renderHook(() =>
      useContactForm({ source: 'dev', submit, requireRecaptcha: true }),
    );
    fillValid(result);

    // No token yet → blocked, no submit.
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(submit).not.toHaveBeenCalled();

    // Provide a token → submit proceeds and the token is forwarded.
    act(() => {
      result.current.setRecaptchaToken('recaptcha-token-xyz');
    });
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0][0].recaptchaToken).toBe('recaptcha-token-xyz');
  });

  // --- double-submit guard ----------------------------------------------

  it('ignores a second submit while one is in flight', async () => {
    let resolveSubmit: (v: unknown) => void = () => {};
    const pending = new Promise((res) => {
      resolveSubmit = res;
    });
    const slowSubmit = vi.fn().mockReturnValue(pending) as never as ContactSubmitFn;
    const { result } = renderHook(() => useContactForm({ source: 'dev', submit: slowSubmit }));
    fillValid(result);

    let first: Promise<boolean>;
    act(() => {
      first = result.current.handleSubmit();
    });
    // Second call while submitting must be a no-op.
    let second: boolean | undefined;
    await act(async () => {
      second = await result.current.handleSubmit();
    });
    expect(second).toBe(false);
    expect(slowSubmit).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSubmit(undefined);
      await first;
    });
    expect(result.current.status).toBe('success');
  });

  // --- reset -------------------------------------------------------------

  it('reset() returns to idle and clears values/errors back to the seed', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('boom')) as never as ContactSubmitFn;
    const { result } = renderHook(() =>
      useContactForm({ source: 'dev', submit: failing, initialValues: { name: 'Seed' } }),
    );
    fillValid(result, { name: 'Changed' });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(result.current.status).toBe('error');

    act(() => {
      result.current.reset();
    });
    expect(result.current.status).toBe('idle');
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.values.name).toBe('Seed');
  });
});
