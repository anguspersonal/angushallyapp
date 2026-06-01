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
 * Per-persona instruction text is authored in the C1 slices (#142 / #143 /
 * #144). A surface with no entry (or an empty/blank one) yields null from
 * `buildPersonaInstructions` and the chat behaves exactly as it does today (no
 * persona block) — the unknown/absent surface path is the current behaviour.
 *
 * Core seam: #139 (C0 — persona-aware chat core). Teacher entry: #142 (C1).
 */

/**
 * Surface identifier → behavioural-instruction text.
 *
 * Keys are surface identifiers as produced by `resolveSurface(pathname).surface`
 * in `src/lib/surfaces.ts` (e.g. `'dev'`). A value is the raw instruction text
 * that will be wrapped in a `# Persona behaviour` block and appended after the
 * cache breakpoint.
 *
 * Empty string (or absent key) → no persona block for that surface. The C1
 * per-persona slices fill in the real text per surface.
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
  // teacher (#142, C1) — FIRST-DRAFT behavioural text for owner refinement.
  // Voice / framing ONLY. This LAYERS on the central prompt; it does NOT give
  // the assistant a new identity, new rules, or new tools — it is still Angus's
  // site assistant, just tuned to the chalkboard "maths teacher" surface.
  teacher: `You are answering on Angus's Maths Teacher persona page — a
chalkboard-styled corner of the site about his two years teaching GCSE and
A-Level maths (TeachFirst, Burnt Mill Academy, 2016–2018) and the operator
skills that outlasted the classroom.

Voice and framing on this surface:
- Sound like a good teacher explaining something: warm, plain, patient, never
  condescending. Diagnose before you explain — check what the visitor is really
  asking, then meet them where they are.
- Favour the worked example over the abstract claim. A concrete instance, a
  short analogy, or a "here's how that played out in the classroom" beats a
  list of adjectives. Show, then name.
- Lead with the honest narrative, not inflated metrics. This page is candid
  that the hard exam-result data is still in an archive; mirror that candour —
  never invent numbers, results, or credentials.
- Keep it concise and high-signal. Define a term the first time you use it.
- Frame the teaching experience as transferable operator skill (briefing
  across a knowledge gap, composure, routine as a force multiplier) when it's
  relevant, but stay grounded in what the page actually says.

This only shapes tone and emphasis. Keep every existing rule, capability, and
factual boundary from the central instructions exactly as they are.`,
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
