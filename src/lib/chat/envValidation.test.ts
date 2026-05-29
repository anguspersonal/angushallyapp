/** @vitest-environment node */
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { __resetEnvValidationForTests, validateChatEnvOnce } from './envValidation';

const ALL_KEYS = [
  'ANTHROPIC_API_KEY',
  'CHAT_IP_HASH_PEPPER',
  'CHAT_DAILY_SPEND_CAP_USD',
  'CHAT_INPUT_PRICE_USD_PER_MILLION_TOKENS',
  'CHAT_OUTPUT_PRICE_USD_PER_MILLION_TOKENS',
] as const;

describe('validateChatEnvOnce', () => {
  const saved: Record<string, string | undefined> = {};
  // Match the exact shape spyOn returns for console.warn (varargs → void).
  let warnSpy: MockInstance<
    [message?: unknown, ...optionalParams: unknown[]],
    void
  >;

  beforeEach(() => {
    for (const k of ALL_KEYS) saved[k] = process.env[k];
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    __resetEnvValidationForTests();
  });

  afterEach(() => {
    for (const k of ALL_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
    warnSpy.mockRestore();
  });

  it('returns no warnings when every var is well-formed', () => {
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-1234567890';
    process.env.CHAT_IP_HASH_PEPPER = 'a'.repeat(32);
    process.env.CHAT_DAILY_SPEND_CAP_USD = '5';
    process.env.CHAT_INPUT_PRICE_USD_PER_MILLION_TOKENS = '1.00';
    process.env.CHAT_OUTPUT_PRICE_USD_PER_MILLION_TOKENS = '5.00';

    const warnings = validateChatEnvOnce();
    expect(warnings).toEqual([]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('warns on every missing var', () => {
    for (const k of ALL_KEYS) delete process.env[k];
    const warnings = validateChatEnvOnce();
    expect(warnings).toHaveLength(ALL_KEYS.length);
    expect(warnSpy).toHaveBeenCalledTimes(ALL_KEYS.length);
  });

  it('flags a key that does not start with sk-ant-', () => {
    for (const k of ALL_KEYS) delete process.env[k];
    process.env.ANTHROPIC_API_KEY = 'eyJ-this-is-an-openai-key';
    const warnings = validateChatEnvOnce();
    expect(warnings.some((w) => w.name === 'ANTHROPIC_API_KEY' && /sk-ant-/.test(w.message))).toBe(
      true,
    );
  });

  it('flags a short pepper', () => {
    for (const k of ALL_KEYS) delete process.env[k];
    process.env.CHAT_IP_HASH_PEPPER = 'too-short';
    const warnings = validateChatEnvOnce();
    expect(warnings.some((w) => w.name === 'CHAT_IP_HASH_PEPPER' && /16/.test(w.message))).toBe(
      true,
    );
  });

  it('flags non-numeric or non-positive cap/prices', () => {
    for (const k of ALL_KEYS) delete process.env[k];
    process.env.CHAT_DAILY_SPEND_CAP_USD = 'free';
    process.env.CHAT_INPUT_PRICE_USD_PER_MILLION_TOKENS = '-1';
    process.env.CHAT_OUTPUT_PRICE_USD_PER_MILLION_TOKENS = 'NaN';
    const warnings = validateChatEnvOnce();
    expect(warnings.find((w) => w.name === 'CHAT_DAILY_SPEND_CAP_USD')).toBeDefined();
    expect(warnings.find((w) => w.name === 'CHAT_INPUT_PRICE_USD_PER_MILLION_TOKENS')).toBeDefined();
    expect(warnings.find((w) => w.name === 'CHAT_OUTPUT_PRICE_USD_PER_MILLION_TOKENS')).toBeDefined();
  });

  it('is a no-op on the second call within a process', () => {
    for (const k of ALL_KEYS) delete process.env[k];
    validateChatEnvOnce();
    const callsAfterFirst = warnSpy.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(0);
    validateChatEnvOnce();
    expect(warnSpy.mock.calls.length).toBe(callsAfterFirst); // no new warnings
  });
});
