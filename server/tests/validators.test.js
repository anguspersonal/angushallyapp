const { validatePassword } = require('../../src/utils/validators');

describe('validatePassword', () => {
  it('returns false for missing password values', () => {
    expect(validatePassword(undefined)).toBe(false);
    expect(validatePassword(null)).toBe(false);
    expect(validatePassword('')).toBe(false);
  });

  it('returns false for non-string values', () => {
    expect(validatePassword(12345678)).toBe(false);
    expect(validatePassword({ password: 'abc' })).toBe(false);
  });

  it('enforces minimum length and required characters', () => {
    expect(validatePassword('short1!')).toBe(false);
    expect(validatePassword('longpassword')).toBe(false);
    expect(validatePassword('longpass!')).toBe(false);
  });

  it('returns true for valid passwords', () => {
    expect(validatePassword('password1!')).toBe(true);
  });
});
