/**
 * Per-persona behavioural layer for the chat assistant.
 *
 * The chat keeps ONE central system prompt (`buildSystemPrompt`). To make the
 * assistant persona-aware *without* touching that cached prompt, this module
 * provides a single-source registry mapping a surface identifier (from the
 * surface registry — `resolveSurface(pathname).surface`) to a block of
 * behavioural instructions, and `buildPersonaInstructions(surface)` to render
 * it.
 *
 * The rendered block is appended in `route.ts` AFTER the prompt-cache
 * breakpoint — the same seam used by `buildPageContext` — so cached-prefix
 * hits on the bulk static prompt are preserved (see route.ts §9 / the
 * "Two-block system" comment). It NEVER modifies `buildSystemPrompt()`.
 *
 * Single source of truth: this registry is the only place surface →
 * behavioural-instruction text is declared. To make a persona behave
 * distinctly in chat, add or fill an entry here — no other file changes.
 *
 * SEEDED EMPTY by design. The actual per-persona instruction text is authored
 * separately in the C1 slices (#142 / #143 / #144). Until a surface has a
 * non-empty entry here, `buildPersonaInstructions` returns null and the chat
 * behaves exactly as it does today (no persona block) — the unknown/absent
 * surface path is the current behaviour.
 *
 * Closes part of #139 (C0 — persona-aware chat core).
 */

/**
 * Surface identifier → behavioural-instruction text.
 *
 * Keys are surface identifiers as produced by `resolveSurface(pathname).surface`
 * in `src/lib/surfaces.ts` (e.g. `'dev'`). A value is the raw instruction text
 * that will be wrapped in a `# Persona behaviour` block and appended after the
 * cache breakpoint.
 *
 * Empty string (or absent key) → no persona block for that surface. Seeded
 * empty here; the C1 per-persona slices fill in the real text.
 */
export const PERSONA_CHAT_INSTRUCTIONS: Record<string, string> = {
  // Per-persona behavioural text is authored in #142 / #143 / #144. Each entry
  // is voice/framing ONLY — it layers on the central system prompt and must not
  // introduce a new identity, new rules, or new tools.
  //
  //   dev: `You are answering on the Developer persona page. Lean technical:
  //   reference shipping, systems thinking, and the projects on this site.`,

  // strategist (#143) — FIRST DRAFT for owner refinement (voice/brand). Frames
  // the assistant in the data-strategist's register: business-outcome led,
  // value-of-data framing, plain-English over jargon. Voice only; the central
  // prompt still owns who the assistant is, what it can do, and its guardrails.
  strategist: [
    'You are answering on the Data Strategist page. Speak in the register of a',
    'senior data-strategy consultant: calm, precise, outcome-led. Frame data in',
    'terms of business value — the chain from data to decision to revenue or',
    'cost impact — rather than as technology for its own sake. Lean on the',
    'themes this surface showcases: data valuation, data maturity, pricing, and',
    'governance/GDPR, plus the rarer angle that this strategist can also read',
    'the schema and stand up the system downstream of the strategy. Prefer',
    'plain English over jargon; when a concept needs a term, define it in a',
    'few words. Be concise and structured — short paragraphs or tight bullets.',
    'This is framing only: do not invent engagements, clients, numbers, or',
    'services, and defer to the central instructions on what you can do and how',
    'to get the visitor in touch.',
  ].join(' '),
};

/**
 * Build the per-request persona behavioural block for a given surface.
 *
 * Returns `null` when:
 *   - no surface was provided (the client may omit `surface` in the body, or
 *     the route resolved to no surface — the default site chrome), or
 *   - the surface has no entry in the registry, or its entry is empty/blank.
 *
 * In all of those cases the assistant gets NO persona block and behaves
 * exactly as it does today (current behaviour preserved).
 *
 * When a non-empty entry exists, the block is returned wrapped in a stable
 * `# Persona behaviour` heading. It is intentionally small and is appended
 * AFTER the cached static prompt in route.ts (the same seam as
 * `buildPageContext`), so it does not invalidate the cached prefix and no
 * cache-hit regression occurs.
 *
 * Pure function — no I/O, no env reads — so the same input always produces the
 * same output (what makes the selection test meaningful).
 */
export function buildPersonaInstructions(
  surface: string | null | undefined,
): string | null {
  if (!surface) return null;
  const instructions = PERSONA_CHAT_INSTRUCTIONS[surface];
  if (!instructions) return null;
  const trimmed = instructions.trim();
  if (!trimmed) return null;
  return ['# Persona behaviour', trimmed].join('\n');
}
