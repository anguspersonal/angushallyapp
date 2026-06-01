import { describe, it, expect } from 'vitest';
import { DEFAULT_SURFACE, attributionFor, withAttribution } from './attribution';

/**
 * Attribution tagging (issue #141): every event is tagged with the route-level
 * surface resolved via the real surface registry (#125). We deliberately use
 * the real resolveSurface so the tagging stays in lock-step with the registry.
 */
describe('attributionFor', () => {
  it('tags a persona surface from its pathname', () => {
    expect(attributionFor('/dev')).toEqual({
      surface: 'dev',
      surface_kind: 'fullBleed',
      pathname: '/dev',
    });
  });

  it('tags a persona sub-route to the same surface', () => {
    expect(attributionFor('/dev/privacy').surface).toBe('dev');
  });

  it('tags the editorial blog surface', () => {
    expect(attributionFor('/blog/some-post')).toEqual({
      surface: 'blog',
      surface_kind: 'editorial',
      pathname: '/blog/some-post',
    });
  });

  it('falls back to the default site surface for unmatched paths', () => {
    expect(attributionFor('/about')).toEqual({
      surface: DEFAULT_SURFACE,
      surface_kind: null,
      pathname: '/about',
    });
  });

  it('falls back to the default surface (and null pathname) for missing input', () => {
    expect(attributionFor(null)).toEqual({
      surface: DEFAULT_SURFACE,
      surface_kind: null,
      pathname: null,
    });
  });
});

describe('withAttribution', () => {
  it('merges surface attribution onto event properties', () => {
    expect(withAttribution('/dev', { cta: 'hire-me' })).toEqual({
      surface: 'dev',
      surface_kind: 'fullBleed',
      pathname: '/dev',
      cta: 'hire-me',
    });
  });

  it('lets explicit properties override derived attribution (non-destructive)', () => {
    const props = withAttribution('/dev', { surface: 'override' });
    expect(props.surface).toBe('override');
  });

  it('works with no properties supplied', () => {
    expect(withAttribution('/blog')).toEqual({
      surface: 'blog',
      surface_kind: 'editorial',
      pathname: '/blog',
    });
  });
});
