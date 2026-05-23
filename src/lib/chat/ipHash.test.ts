import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { hashIp } from './ipHash';

const PEPPER_KEY = 'CHAT_IP_HASH_PEPPER';

describe('hashIp', () => {
  const originalPepper = process.env[PEPPER_KEY];

  beforeEach(() => {
    process.env[PEPPER_KEY] = 'test-pepper-A-32-chars-aaaaaaaa';
  });

  afterEach(() => {
    if (originalPepper === undefined) {
      delete process.env[PEPPER_KEY];
    } else {
      process.env[PEPPER_KEY] = originalPepper;
    }
  });

  it('returns the same digest for the same (ip, pepper)', () => {
    const a = hashIp('203.0.113.42');
    const b = hashIp('203.0.113.42');
    expect(a).toBe(b);
  });

  it('returns different digests for different IPs under the same pepper', () => {
    expect(hashIp('203.0.113.42')).not.toBe(hashIp('203.0.113.43'));
  });

  it('returns different digests for the same IP under different peppers', () => {
    const withPepperA = hashIp('203.0.113.42');
    process.env[PEPPER_KEY] = 'test-pepper-B-32-chars-bbbbbbbb';
    const withPepperB = hashIp('203.0.113.42');
    expect(withPepperA).not.toBe(withPepperB);
  });

  it('produces a 64-char lowercase hex sha256 digest', () => {
    const digest = hashIp('203.0.113.42');
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });

  it('throws when CHAT_IP_HASH_PEPPER is missing', () => {
    delete process.env[PEPPER_KEY];
    expect(() => hashIp('203.0.113.42')).toThrow(/CHAT_IP_HASH_PEPPER/);
  });

  it('throws when CHAT_IP_HASH_PEPPER is empty string', () => {
    process.env[PEPPER_KEY] = '';
    expect(() => hashIp('203.0.113.42')).toThrow(/CHAT_IP_HASH_PEPPER/);
  });
});
