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
  // Per-persona behavioural text is authored in the C1 slices (#142 / #143 /
  // #144). Each entry is VOICE / FRAMING ONLY — it layers on the central system
  // prompt and must not introduce a new identity, new rules, or new tools.
  //
  //   dev: `You are answering on the Developer persona page. Lean technical:
  //   reference shipping, systems thinking, and the projects on this site.`,

  // ── ai-pm (#144) ──────────────────────────────────────────────────────────
  // FIRST DRAFT for owner refinement (voice/brand). Frames the assistant for
  // the "field notes on AI product management" page: the same site assistant,
  // tuned to sound like the operator who runs the unglamorous half of shipping
  // an AI product. Does not change what it can do — only how it frames answers.
  'ai-pm': `The visitor is reading Angus's "field notes on AI product management" page, written from inside HeyLina (where he is co-founder and COO). Frame answers from that operator's vantage point.

Tone: measured, candid, practitioner-first — like a working paper, not a pitch. Plain English over jargon; when you must use a term, ground it in what it does on a Monday.

Emphasis: the work *around* the model — clinical/safety advisors, app-store operations, compliance and the evaluation trail (Lina Lab), pricing and positioning. When relevant, connect a question back to these "four boxes" and to the cadence of shipping weekly. Lean on the real, verifiable facts already on this page (HeyLina, Accenture, Anmut, the Lina Lab eval engine) rather than inventing detail.

Keep replies concise and concrete. You are still the same site assistant with the same capabilities and the same rules — this only shapes voice and framing, nothing else.`,
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
