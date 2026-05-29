import { describe, expect, it } from 'vitest';
import { isChatVisible, type VisibilityRule } from './visibility';

const ALL: VisibilityRule = { allow: ['/**'], deny: [], forceShow: [] };
const NONE: VisibilityRule = { allow: [], deny: [], forceShow: [] };

describe('isChatVisible', () => {
  describe('default-deny baseline', () => {
    it('hides when no list matches', () => {
      expect(isChatVisible('/anywhere', NONE)).toBe(false);
    });
  });

  describe('allow patterns', () => {
    it('shows under a broad /** allow', () => {
      expect(isChatVisible('/', ALL)).toBe(true);
      expect(isChatVisible('/about', ALL)).toBe(true);
      expect(isChatVisible('/projects/habit', ALL)).toBe(true);
      expect(isChatVisible('/a/b/c/d/e', ALL)).toBe(true);
    });

    it('* matches a single segment but not slashes', () => {
      const rules: VisibilityRule = { allow: ['/projects/*'], deny: [], forceShow: [] };
      expect(isChatVisible('/projects/habit', rules)).toBe(true);
      expect(isChatVisible('/projects/habit/details', rules)).toBe(false);
    });

    it('** matches zero or more segments', () => {
      const rules: VisibilityRule = { allow: ['/projects/**'], deny: [], forceShow: [] };
      expect(isChatVisible('/projects', rules)).toBe(true);
      expect(isChatVisible('/projects/habit', rules)).toBe(true);
      expect(isChatVisible('/projects/habit/details', rules)).toBe(true);
    });
  });

  describe('deny overrides allow', () => {
    it('hides /login even though /** allows', () => {
      const rules: VisibilityRule = {
        allow: ['/**'],
        deny: ['/login'],
        forceShow: [],
      };
      expect(isChatVisible('/login', rules)).toBe(false);
      expect(isChatVisible('/anywhere-else', rules)).toBe(true);
    });

    it('hides /auth/** subtree including the prefix itself', () => {
      const rules: VisibilityRule = {
        allow: ['/**'],
        deny: ['/auth/**'],
        forceShow: [],
      };
      // Trailing `/**` matches the prefix and any sub-path — see FR-VIS-3.
      expect(isChatVisible('/auth', rules)).toBe(false);
      expect(isChatVisible('/auth/callback', rules)).toBe(false);
      expect(isChatVisible('/auth/google/callback', rules)).toBe(false);
    });
  });

  describe('forceShow overrides deny', () => {
    it('shows the explicitly forced path even when deny would hide it', () => {
      const rules: VisibilityRule = {
        allow: ['/**'],
        deny: ['/auth/**'],
        forceShow: ['/auth/preview'],
      };
      expect(isChatVisible('/auth/preview', rules)).toBe(true);
      expect(isChatVisible('/auth/callback', rules)).toBe(false);
    });
  });

  describe('path normalisation', () => {
    it('treats trailing-slash paths the same as their unslashed form', () => {
      const rules: VisibilityRule = { allow: ['/about'], deny: [], forceShow: [] };
      expect(isChatVisible('/about', rules)).toBe(true);
      expect(isChatVisible('/about/', rules)).toBe(true);
    });

    it('prepends a leading slash if missing', () => {
      const rules: VisibilityRule = { allow: ['/about'], deny: [], forceShow: [] };
      expect(isChatVisible('about', rules)).toBe(true);
    });

    it('handles empty string as root', () => {
      const rules: VisibilityRule = { allow: ['/'], deny: [], forceShow: [] };
      expect(isChatVisible('', rules)).toBe(true);
    });
  });
});
