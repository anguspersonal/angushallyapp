import { describe, it, expect } from 'vitest';
import { validateInstagramAnalyzeBody } from './validateInstagramAnalyzeBody';

describe('validateInstagramAnalyzeBody', () => {
  it('accepts a valid Instagram URL and trims whitespace', () => {
    const result = validateInstagramAnalyzeBody({
      instagramUrl: '  https://www.instagram.com/p/abc/  ',
    });
    expect(result).toEqual({
      ok: true,
      data: { instagramUrl: 'https://www.instagram.com/p/abc/' },
    });
  });

  it('rejects when instagramUrl is missing', () => {
    expect(validateInstagramAnalyzeBody({})).toMatchObject({
      ok: false,
      status: 400,
    });
  });

  it('rejects when instagramUrl is not a string', () => {
    expect(validateInstagramAnalyzeBody({ instagramUrl: 42 })).toMatchObject({
      ok: false,
      status: 400,
    });
  });

  it('rejects URLs that do not contain instagram.com', () => {
    expect(
      validateInstagramAnalyzeBody({ instagramUrl: 'https://tiktok.com/foo' }),
    ).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects an empty string after trimming', () => {
    expect(validateInstagramAnalyzeBody({ instagramUrl: '   ' })).toMatchObject({
      ok: false,
      status: 400,
    });
  });

  it('handles a null body without throwing', () => {
    expect(validateInstagramAnalyzeBody(null)).toMatchObject({
      ok: false,
      status: 400,
    });
  });
});
