---
source: /harness
topic: Harness Engineer — narrative pitch
audience: model labs, agent-tooling startups, MCP-ecosystem maintainers, internal AI-tooling teams
companion: harness-engineer-cv.md
---

# Angus Hally — Harness Engineer

> Companion to [`harness-engineer-cv.md`](./harness-engineer-cv.md). The CV is the inventory; this is the story.

## What is a harness engineer?

Harness engineering is the meta-discipline that emerged once prompt engineering hit its ceiling. A harness engineer builds the system *around* an LLM — the context it carries, the tools it can reach for, the environments it runs in, and the evaluations that tell you whether it's getting better or worse — so that an agent can perform complex work over long horizons and self-correct as it goes.

The progression:

- **March 2023 — GPT-4.** Prompt engineering becomes a sought-after role. People realise model output varies wildly with how you ask.
- **Through 2024 — context.** Context windows are the binding constraint. The question becomes *what should the model always know, vs. look up on demand?* Tools and retrieval emerge as the answer.
- **August 2025 — harness engineering gains prominence.** Competitive use pushes people past what the model alone can do. MCP standardises tool access. Evaluation becomes a first-class concern. Context + tools + evals = harness.

## The pitch

I came up through data consulting at Anmut — boutique data shop in south London, clients like Land Rover and National Highways — where the lesson was that no model, statistical or LLM, outperforms the quality of the context you feed it. *Shit data in, shit insight out* was already gospel to any data professional. LLMs are next-token predictors trained on text; if you want one to act as your secretary, it has to know your tone, your schedule, your priorities. So when GPT-4 landed, I went straight at the context problem.

My first project was a personal knowledge-management tool: read a file, classify it into Tasks / Areas (finance, household, work, social) / Resources / Archive, file it. Two benefits — the experience of building the categoriser, and the structured output became rocket fuel for the LLMs I used afterwards, because they could now reach for context that already understood me.

That grew into a full second-brain harness running my day-to-day:

- **`/capture`** — one entry point, two orthogonal dials (urgency × content type), context inference (HeyLina vs personal) from chat cues with explicit fallback chains, deprecation aliasing for retired skills, and an "echo first so the capture is never lost" safety net.
- **`/whatsapp-blast`** — burn through a WhatsApp backlog one chat at a time. Per-*action* routing, not per-chat, because work/personal classification at the chat level mis-routes spinoff actions. Hard-abort rule on the Composio routing trap, where the default-loaded `Google Calendar:` and `Gmail:` MCP namespaces look generic but are bound to the work account — confirming a personal Composio connection doesn't re-route them. I learned that one by writing to the wrong calendar and then instrumenting against it.
- **`/dos-eod`** — end-of-day synthesis ritual. Reads the day's Inbox and the State Doc, pushes back on ambiguities, writes a Daily Log entry, proposes State Doc diffs section by section, marks Inbox entries consumed with a back-relation. Hard mode adds drift detection and asks the question I'm avoiding. The State Doc has bounded caps (~10 Open Actions, ~10 Recent Communications) with explicit overflow routing to Tasks DB and Meetings DB — I'm treating the State Doc as a bounded context window for the *user*, not just the model.

On the eval side, at HeyLina we benchmarked Lina against a frontier GPT model for human-soundness. I built the rubric, sourced test prompts from Hugging Face, and used a separate evaluator agent across 500 simulations. Lina hit 95%; GPT scored 54% — judged by its own family.

## The three legs

I treat tools, context, and evaluation as the three legs of the agent stool, and I've shipped real systems on all three:

| Leg | Evidence |
|---|---|
| **Context** | Personal KM categoriser; `/capture` routing; State Doc as bounded user-side context window; per-action HeyLina/personal classification |
| **Tools** | MCP orchestration across Notion, Slack, Gmail, Google Calendar, Composio, Dex, Supabase, Vercel; hard-abort rules on silent-failure surfaces; session-level vs per-call schema loading as a token-budget discipline |
| **Evaluation** | HeyLina vs GPT human-soundness benchmark (rubric design + LLM-as-judge across 500 simulations); Lina Lab production prompt-evaluation engine with provenance and a promotion pipeline; AHKMS webhook-driven orchestration pipeline |

Most of these are load-bearing in my own day-to-day — which is the harshest eval there is. If the harness drifts, my actual calendar, inbox, and second brain feel it before any dashboard does.

## What makes this harness-engineering rather than scripting

Four moves recur across the skills:

1. **Workspace boundaries as safety properties.** `/dos-eod` refuses to run if the chat isn't unambiguously HeyLina-related. `/whatsapp-blast` aborts personal calendar writes if the planned tool call resolves to the work-bound MCP namespace. Boundaries aren't hints — they're enforced.
2. **Explicit failure-mode instrumentation from real incidents.** The Composio hard-abort exists because I wrote to the wrong calendar once. The capture-echo safety net exists because tool calls fail and working memory of the prior conversation is more valuable than a clean confirmation message.
3. **Token-budget discipline at the user level and the model level.** State Doc caps with overflow routing for the user; session-level schema reads (not per-chat) for the model.
4. **Eval hooks even when evals aren't running yet.** Marking Inbox entries `Consumed` with a back-relation to the Daily Log is a write-side audit trail: I can later check whether every captured item made it into synthesis. The hook is there before the dashboard is.

## What I want next

A role where the harness *is* the product — model labs building agent platforms, MCP-ecosystem maintainers, agent-tooling startups, or an internal AI-tooling team at an AI-heavy org. Somewhere the question on the table is "how do we make this agent meaningfully more capable over time" — context, tools, evals — and the answer needs to be built, not just specified.
