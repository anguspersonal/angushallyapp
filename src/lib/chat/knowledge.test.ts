import { describe, expect, it } from 'vitest';
import { KNOWLEDGE_BUNDLE, KNOWLEDGE_TOKEN_COUNT } from './knowledge.generated';

/**
 * Property 3 (docs/chatbotv1/tasks.md §3.4): the knowledge bundle stays
 * under the 8000-token budget set in FR-KB-3. The build script already
 * fails fast on overage; this test is a belt-and-braces guard if the
 * generated file is checked in stale (e.g. someone edits the .ts by hand).
 */
describe('knowledge bundle', () => {
  it('stays within the 8000-token budget', () => {
    expect(KNOWLEDGE_TOKEN_COUNT).toBeLessThanOrEqual(8000);
  });

  it('has at least one entry', () => {
    expect(KNOWLEDGE_BUNDLE.length).toBeGreaterThan(0);
  });

  it('declares every entry with the expected shape', () => {
    for (const entry of KNOWLEDGE_BUNDLE) {
      expect(typeof entry.source).toBe('string');
      expect(entry.source.length).toBeGreaterThan(0);
      expect(typeof entry.topic).toBe('string');
      expect(entry.topic.length).toBeGreaterThan(0);
      expect(typeof entry.content).toBe('string');
      expect(entry.content.length).toBeGreaterThan(0);
    }
  });
});
