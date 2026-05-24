/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { __resetEmailEnvValidationForTests, validateEmailEnvOnce } from './envValidation';

const ALL_KEYS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'RECIPIENT_EMAIL',
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REFRESH_TOKEN',
] as const;

describe('validateEmailEnvOnce', () => {
  const saved: Record<string, string | undefined> = {};
  let warnSpy: MockInstance<[message?: unknown, ...optionalParams: unknown[]], void>;

  beforeEach(() => {
    for (const k of ALL_KEYS) saved[k] = process.env[k];
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    __resetEmailEnvValidationForTests();
  });

  afterEach(() => {
    for (const k of ALL_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    warnSpy.mockRestore();
  });

  function clearAll() {
    for (const k of ALL_KEYS) delete process.env[k];
  }

  it('returns no warnings when password-mode is fully configured', () => {
    clearAll();
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'sender@example.com';
    process.env.SMTP_PASS = 'app-password';
    process.env.RECIPIENT_EMAIL = 'owner@example.com';

    const warnings = validateEmailEnvOnce();
    expect(warnings).toEqual([]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('returns no warnings when OAuth2 mode is fully configured', () => {
    clearAll();
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'sender@example.com';
    process.env.RECIPIENT_EMAIL = 'owner@example.com';
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'cid';
    process.env.GOOGLE_OAUTH_CLIENT_SECRET = 'csecret';
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN = 'rtoken';

    const warnings = validateEmailEnvOnce();
    expect(warnings).toEqual([]);
  });

  it('warns when nothing is configured', () => {
    clearAll();
    const warnings = validateEmailEnvOnce();
    // SMTP_HOST, SMTP_USER, RECIPIENT_EMAIL, SMTP auth — SMTP_PORT is optional
    expect(warnings.find((w) => w.name === 'SMTP_HOST')).toBeDefined();
    expect(warnings.find((w) => w.name === 'SMTP_USER')).toBeDefined();
    expect(warnings.find((w) => w.name === 'RECIPIENT_EMAIL')).toBeDefined();
    expect(warnings.find((w) => w.name === 'SMTP auth')).toBeDefined();
    expect(warnSpy).toHaveBeenCalled();
  });

  it('flags a non-numeric SMTP_PORT', () => {
    clearAll();
    process.env.SMTP_PORT = 'twenty';
    const warnings = validateEmailEnvOnce();
    expect(warnings.find((w) => w.name === 'SMTP_PORT' && /non-numeric/.test(w.message))).toBeDefined();
  });

  it('flags a RECIPIENT_EMAIL that is not an email', () => {
    clearAll();
    process.env.RECIPIENT_EMAIL = 'not-an-email';
    const warnings = validateEmailEnvOnce();
    expect(
      warnings.find((w) => w.name === 'RECIPIENT_EMAIL' && /does not look like/.test(w.message)),
    ).toBeDefined();
  });

  it('flags partial OAuth2 configuration', () => {
    clearAll();
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_USER = 'sender@example.com';
    process.env.RECIPIENT_EMAIL = 'owner@example.com';
    process.env.GOOGLE_OAUTH_CLIENT_ID = 'cid';
    // missing client secret + refresh token
    const warnings = validateEmailEnvOnce();
    const authWarning = warnings.find((w) => w.name === 'SMTP auth');
    expect(authWarning).toBeDefined();
    expect(authWarning!.message).toMatch(/GOOGLE_OAUTH_CLIENT_SECRET/);
    expect(authWarning!.message).toMatch(/GOOGLE_OAUTH_REFRESH_TOKEN/);
  });

  it('is a no-op on the second call within a process', () => {
    clearAll();
    validateEmailEnvOnce();
    const callsAfterFirst = warnSpy.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(0);
    validateEmailEnvOnce();
    expect(warnSpy.mock.calls.length).toBe(callsAfterFirst);
  });
});
