import { afterEach, describe, expect, it } from 'vitest';

import {
  PERSONA_CHAT_INSTRUCTIONS,
  buildPersonaInstructions,
} from './personaInstructions';

/**
 * Behavioural tests for the per-persona chat layer (#139, C0).
 *
 * The registry ships seeded EMPTY (the real per-persona text is authored in
 * #142 / #143 / #144), so these tests inject a temporary entry to exercise the
 * selection + wrapping behaviour, then restore the registry. We assert the
 * external contract — given a surface, the block that comes out — not the
 * literal text of any persona, which lives elsewhere.
 */
describe('buildPersonaInstructions', () => {
  const TEST_SURFACE = '__test_persona__';

  afterEach(() => {
    delete PERSONA_CHAT_INSTRUCTIONS[TEST_SURFACE];
  });

  describe('no-persona path (current behaviour preserved)', () => {
    it('returns null for missing / empty surface', () => {
      expect(buildPersonaInstructions(undefined)).toBeNull();
      expect(buildPersonaInstructions(null)).toBeNull();
      expect(buildPersonaInstructions('')).toBeNull();
    });

    it('returns null for a surface absent from the registry', () => {
      expect(buildPersonaInstructions('not-a-registered-surface')).toBeNull();
    });

    it('every registered entry is either blank (no block) or a well-formed block', () => {
      // Behaviour-additive promise of #139: a surface absent from the registry,
      // or present with blank text, yields NO persona block (chat behaves as it
      // does today). The C1 slices (#142/#143/#144) fill real entries; where one
      // exists it must come out wrapped in the stable heading rather than raw.
      for (const surface of Object.keys(PERSONA_CHAT_INSTRUCTIONS)) {
        const block = buildPersonaInstructions(surface);
        if (block !== null) {
          expect(block).toContain('# Persona behaviour');
        }
      }
    });

    it('treats a blank / whitespace-only entry as no persona', () => {
      PERSONA_CHAT_INSTRUCTIONS[TEST_SURFACE] = '   \n  ';
      expect(buildPersonaInstructions(TEST_SURFACE)).toBeNull();
    });
  });

  describe('persona-instruction selection by surface', () => {
    it('returns the matching surface block wrapped in a stable heading', () => {
      PERSONA_CHAT_INSTRUCTIONS[TEST_SURFACE] = 'Lean technical and reference shipping.';
      const block = buildPersonaInstructions(TEST_SURFACE);
      expect(block).not.toBeNull();
      expect(block).toContain('# Persona behaviour');
      expect(block).toContain('Lean technical and reference shipping.');
    });

    it('selects the entry for the given surface and no other', () => {
      PERSONA_CHAT_INSTRUCTIONS[TEST_SURFACE] = 'Persona A voice.';
      PERSONA_CHAT_INSTRUCTIONS['__other_persona__'] = 'Persona B voice.';
      try {
        const block = buildPersonaInstructions(TEST_SURFACE)!;
        expect(block).toContain('Persona A voice.');
        expect(block).not.toContain('Persona B voice.');
      } finally {
        delete PERSONA_CHAT_INSTRUCTIONS['__other_persona__'];
      }
    });

    it('is pure — same surface yields the same block', () => {
      PERSONA_CHAT_INSTRUCTIONS[TEST_SURFACE] = 'Stable text.';
      expect(buildPersonaInstructions(TEST_SURFACE)).toBe(
        buildPersonaInstructions(TEST_SURFACE),
      );
    });

    it('stays small relative to the cached prompt (preserves caching gain)', () => {
      PERSONA_CHAT_INSTRUCTIONS[TEST_SURFACE] = 'A concise persona instruction.';
      // Same rationale as buildPageContext: this is a small tail appended after
      // the cache breakpoint, not a meaningful fraction of the cached prefix.
      const block = buildPersonaInstructions(TEST_SURFACE)!;
      expect(block.length).toBeLessThan(2000);
    });
  });

  describe('ai-pm persona entry (#144 · C1)', () => {
    it('produces a voice/framing block wrapped in the stable heading', () => {
      const block = buildPersonaInstructions('ai-pm');
      expect(block).not.toBeNull();
      expect(block).toContain('# Persona behaviour');
      // First-draft voice/framing for the AI-PM "field notes" page.
      expect(block).toContain('field notes');
    });

    it('stays a small tail (caching gain preserved)', () => {
      const block = buildPersonaInstructions('ai-pm')!;
      expect(block.length).toBeLessThan(2000);
    });
  });
});
