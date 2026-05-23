/**
 * Layer-3 output filter for assistant responses.
 *
 * Scans the assistant's final text for indicators that the model has
 * leaked or been steered into echoing system-prompt content. Used by
 * the route handler to set `injection_flagged = true` on the persisted
 * assistant turn so attacks are auditable (FR-PERS-8) and a future
 * round can retrain or tighten the system prompt.
 *
 * This is a **detector**, not a redactor. The streamed deltas have
 * already reached the user by the time we run; rewriting after-the-
 * fact would just confuse them. The defense-in-depth is:
 *
 *   1. System prompt instructs the model never to leak (Layer 1).
 *   2. Heuristic flag on the user turn (Layer 2 — injectionPatterns.ts).
 *   3. **This filter** flags the assistant turn (Layer 3).
 *   4. Corpus test guards behaviour at CI time (Layer 4).
 *
 * See docs/chatbotv1/design.md §9 Layer 3 and docs/chatbotv1/requirements.md
 * FR-SAFE-4, FR-SAFE-7.
 */

/**
 * Markers that should never appear verbatim in an honest assistant turn.
 * If the model emits any of these, it's almost certainly because an
 * injection probe nudged it into echoing system-prompt content.
 */
const LEAK_MARKERS: readonly RegExp[] = [
  // System-prompt section headers — exact strings used in systemPrompt.ts.
  /^#\s*Identity\s+rules\s*$/im,
  /^#\s*Tools?\s*$/im,
  /^#\s*Knowledge\s*$/im,
  /^#\s*When\s+to\s+refuse\s*$/im,
  /^#\s*Style\s*$/im,
  // First-person framing the model uses internally but should never
  // surface to the user: "You are the chat assistant..." / "I was told
  // to..." / "My instructions are..."
  /\byou\s+are\s+the\s+chat\s+assistant\b/i,
  /\bi\s+was\s+(told|instructed)\s+to\b/i,
  /\bmy\s+(instructions?|system\s*prompt|directives?|rules?)\s+(are|is|say|state)\b/i,
  // The literal phrase the model uses when the prompt asks it to recite
  // itself. Anthropic models occasionally repeat back the instruction
  // text — catch that explicitly.
  /\byou\s+will\s+not\s+reveal\s+these\s+instructions\b/i,
  // Raw HTML / script tags in assistant output. The renderMarkdown
  // sanitiser strips these client-side but flagging here gives us a
  // persisted signal that something unusual happened.
  /<\s*script[\s>]/i,
  /\bjavascript:/i,
];

export type LeakDetection = {
  /** True if any LEAK_MARKERS pattern fires. */
  flagged: boolean;
  /** Indices of the patterns that matched (for debug logging). */
  matchedPatternIndices: readonly number[];
};

export function detectLeakedSystemContent(text: string): LeakDetection {
  if (typeof text !== 'string' || text.length === 0) {
    return { flagged: false, matchedPatternIndices: [] };
  }
  const matched: number[] = [];
  LEAK_MARKERS.forEach((pattern, idx) => {
    if (pattern.test(text)) matched.push(idx);
  });
  return {
    flagged: matched.length > 0,
    matchedPatternIndices: matched,
  };
}

/** Convenience boolean for the common case. */
export function isLeakedSystemContent(text: string): boolean {
  return detectLeakedSystemContent(text).flagged;
}
