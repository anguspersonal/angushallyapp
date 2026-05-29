import { describe, it, expect } from 'vitest';
import { resolveSurface } from './surfaces';

describe('resolveSurface', () => {
  describe('persona surface owns its subtree', () => {
    // `/dev` is the reference persona surface: further personas
    // (/teacher, /strategist, /ai-pm) follow the same prefix matcher so their
    // sub-pages (e.g. /<persona>/privacy) render in the persona's own chrome.
    it('resolves the persona index to its full-bleed surface', () => {
      const def = resolveSurface('/dev');
      expect(def?.surface).toBe('dev');
      expect(def?.kind).toBe('fullBleed');
    });

    it('resolves a persona sub-route to the same surface', () => {
      const def = resolveSurface('/dev/privacy');
      expect(def?.surface).toBe('dev');
      expect(def?.kind).toBe('fullBleed');
    });

    it('resolves a deeper persona sub-route to the same surface', () => {
      const def = resolveSurface('/dev/projects/some-thing');
      expect(def?.surface).toBe('dev');
      expect(def?.kind).toBe('fullBleed');
    });

    it('does not match a sibling route that merely shares the persona prefix', () => {
      // `/development` must NOT be captured by the `/dev` surface — only the
      // exact path and paths under `/dev/` belong to the subtree.
      expect(resolveSurface('/development')).toBeUndefined();
    });
  });

  describe('/projects stays exact-match', () => {
    it('resolves the /projects index to the projects surface', () => {
      const def = resolveSurface('/projects');
      expect(def?.surface).toBe('projects');
      expect(def?.kind).toBe('fullBleed');
    });

    it('lets a /projects sub-route fall through to default chrome', () => {
      // Project sub-pages are individual destinations, not a persona subtree, so
      // they get no surface entry and render in the default site chrome.
      expect(resolveSurface('/projects/strava')).toBeUndefined();
    });
  });

  describe('blog editorial surface', () => {
    it('resolves the /blog index to the editorial surface', () => {
      const def = resolveSurface('/blog');
      expect(def?.surface).toBe('blog');
      expect(def?.kind).toBe('editorial');
    });

    it('resolves a /blog sub-route to the same editorial surface', () => {
      const def = resolveSurface('/blog/some-post');
      expect(def?.surface).toBe('blog');
      expect(def?.kind).toBe('editorial');
    });
  });

  describe('unmatched paths', () => {
    it('returns undefined for an unknown path', () => {
      expect(resolveSurface('/about')).toBeUndefined();
    });

    it('returns undefined for the home path', () => {
      expect(resolveSurface('/')).toBeUndefined();
    });

    it.each([[null], [undefined], ['']])('returns undefined for %s', (input) => {
      expect(resolveSurface(input)).toBeUndefined();
    });
  });
});
