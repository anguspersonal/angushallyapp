# Persona page design philosophy

> Companion to [persona-page-workflow.md](./persona-page-workflow.md). The workflow doc is the *process* (5 phases: Define → Research → Curate → Render → Propagate). This doc is the *design brief* — per-persona buyer, aesthetic direction, references, and copy positioning. It fills in the v2 backlog the workflow doc flagged ("Custom hero per persona", "Custom components per persona", "Per-persona colour identity").

## The strategic frame

Persona pages are **separate sites that share bones**. Each one is designed as if it's the only thing Angus does. The cohesion that matters lives **below the visual layer** — not in matching aesthetics.

### Why

Realistic entry paths almost never start at `/`. Visitors arrive directly at a persona page from LinkedIn, Google, Slack shares, or community channels — with one question in mind:

| Visitor | Came from | Lands on | Their question |
|---|---|---|---|
| Non-technical founder | LinkedIn / referral | `/dev` | "Can this person build my app?" |
| AI-tools tastemaker | Twitter / blog share | `/harness` | "Is this person actually deep in this?" |
| VP Product / VP Eng | Slack share | `/ai-pm` | "Can they ship AI features that don't embarrass us?" |
| Director-level corporate | Google "data strategist" | `/strategist` | "Is this credible data work?" |
| Parent of teenager | Word of mouth + Google | `/teacher` | "Would I leave my Year 11 kid with him?" |
| Conference organiser | Twitter / community | `/debate` | "Will this person be a credible judge / speaker?" |

In zero common journeys does the visitor need to know there are five other versions of Angus. **The cohesion question is "does this page convince this specific buyer," not "does this page look like its siblings."**

### What stays cohesive

| Layer | Cohere? | Why |
|---|---|---|
| URL pattern (`/dev`, `/teacher`…) | Yes | One brain, one site |
| Footer (`Work with me` column) | Yes | The cross-promotion surface |
| Chatbot knowledge bundle | Yes | Single AI, one Angus, knows all six |
| Component primitives (Button, Paper, Stat, Section) | Yes | Same Mantine theme tokens; just used differently per persona |
| Design tokens (spacing, radii, type scale) | Yes | Cheap consistency, invisible to users |
| Contact backend (submission, spam, email pipeline) | Yes | Same plumbing serves every persona's form |
| `/personas` hub | Yes | The ONE surface where family resemblance must show |

### What diverges

| Layer | Diverge? | Why |
|---|---|---|
| Hero design | Yes | Audience-specific |
| Colour palette | Yes | Buyer-tuned tonal register |
| Voice / copy register | Yes | Non-technical founder ≠ AI tastemaker ≠ debate organiser |
| Hero asset (3D / photo / type) | Yes | Audience-tuned |
| CTA shape | Yes | Different products |
| Contact form fields, CTA copy, placement | Yes | Buyer-specific qualifying questions |

## Per-persona buyer × direction matrix

| Persona | Buyer | Aesthetic direction | Primary references | Copy positioning |
|---|---|---|---|---|
| `/dev` | Non-technical founder looking for "someone techy" | Dark, 3D, Matrix-spirit (not literal katakana), fast count-up stats, live-metrics HUD, on-scroll motion. Fun-but-not-overdone. | Bruno Simon, Active Theory, Basement Studio, Robin Noguier, Lusion + VOIDFORM mock | "Full-stack builder for non-technical founders" (TBD — buyer-recognised role) |
| `/harness` | Tech tastemaker over-saturated on devtool slick | Handwritten notebook, palette colours, camomile-tea minimal. **Substance must stay visible**: real `settings.json` snippets, real skill diagrams, real prompt fragments — not generic squiggles. | iA, Robin Sloan, Gwern, Tom Critchlow, Are.na | TBD — audience self-identifies; "Claude Code power user" / similar |
| `/ai-pm` | Traditional Head of Product / VP Eng | Anthropic + scientific-journal restraint; serif-led editorial; stats welcome but quiet. | Anthropic, Quanta Magazine, Asimov Press, Stripe Press | "AI Product Manager" |
| `/strategist` | Director-level corporate buying *data* strategy | AIR Center brutal-luxury hero; premium without apology. **One** named-portrait-with-quote surface lower in the page so the human gets through (Floema's Fernando Pinto move). Stats minimal, slow count-ups if any. | AIR Center, Aesop, The Row, A24 | "Data Strategist" (not "Strategist" — buyer Googles the specific term) |
| `/teacher` | Parent of secondary-school teenager (KS3–KS5, not primary) | Juan Mora warm photo + small portrait + teenager-parent trust register. | Juan Mora, 3Blue1Brown, Synthesis School | "GCSE & A-Level maths tutor" (or similar buyer-recognised role) |
| `/debate` | Conference organiser / school | Paris Review literary; prestige-via-content; austere. | The Paris Review, Granta, The Drift, n+1, LRB | "Debate coach & judge" |

## Reference filter

Two filters that have produced sharper references than the obvious ones:

1. **Adjacent industry, not the obvious one.** The strongest reference for a persona is almost never another portfolio in the same field. Copying competitor portfolios is the fast track to a generic site. Juan Mora (designer portfolio), AIR Center (premium real estate), Floema (sustainable furniture) are all from adjacent industries — that's why they read as sharp.
2. **Award-winning creative, not design-industry-respectable.** Linear and Pentagram are competent benchmarks; Bruno Simon and Robin Noguier are *memorable* ones. Pull from Awwwards / FWA / SOTD territory, not safe-industry catalogues.

## Three guiding pushbacks

Decisions captured during reference-gathering that prevent foreseeable failure modes:

### 1. `/strategist` — brutal luxury without a face risks selling agency, not individual

AIR Center has zero people on it. That works for a real-estate brand selling a building. It does **not** work for a personal consultant selling Angus Hally. A director hiring a named consultant wants to see who they're getting.

**Fix:** Keep the brutal-luxury hero unchanged. Introduce *one* Floema-style named-portrait-with-quote surface lower in the page. The brand stays premium; the human gets through.

### 2. `/harness` — aesthetic must not mute substance

Camomile-tea visual register is exactly right for the audience (tech tastemakers post-slick). The risk is going full Pinterest-mood-board and losing the engineering credibility.

**Fix:** Aesthetic = camomile tea. Content stays rigorous. The "notebook" contains:

- Real `settings.json` snippets (or representative fragments)
- Real harness diagrams (skill graphs, agent flows)
- Real prompt fragments from published skills
- Real plugin counts, real skill names

Pretty handwriting is the canvas; engineering substance is the content.

### 3. Positioning copy uses buyer-recognised role, not internal shorthand

The persona slugs (`/strategist`, `/teacher`, `/dev`) are internal taxonomy. The hero copy must name the role *the buyer types into Google*. Examples:

- `/strategist` → "Data Strategist" (not "Strategist" — too generic, no one searches it)
- `/dev` → "Full-stack builder for non-technical founders" (specific, names the buyer)
- `/teacher` → "GCSE & A-Level maths tutor" (the school level the buyer's child is at)

Audit hero copy across all six before v2 design work hardens.

## Reference set — banked

| Reference | URL | Industry | Contributes to |
|---|---|---|---|
| VOIDFORM | (Awwwards-tier mock — not a real shipped site) | Engineering studio (fictional) | `/dev` tonal baseline |
| Juan Mora | juanmora.co | Designer portfolio | `/teacher` structural + warm-photo register |
| AIR Center | aircenter.space | Premium real estate | `/strategist` hero; `CLASS (A)` spec-callout potentially reusable |
| Floema | floema.com | Sustainable furniture brand | `/personas` hub structure; named-quote pattern across personas |

## Per-persona aesthetic anchors (one-line each)

A single-line anchor for each persona, useful when designing or briefing:

- **`/dev`** — *"What a non-technical founder thinks 'cool techy person' looks like."*  Cinematic dark, 3D, count-up, scroll-driven, fun-but-not-overdone.
- **`/harness`** — *"Notebook on the desk of someone deep in the craft."* Quiet, handwritten, palette, no slick, substance over polish.
- **`/ai-pm`** — *"A paper that earned its peer review."* Serif, structured, restrained, stats quiet.
- **`/strategist`** — *"The Class (A) brand asset for a single person."* Brutal-luxury minimalism with one human surface.
- **`/teacher`** — *"Warm, trustworthy, here's a small photo of me at the front of a classroom."* Juan Mora structure, teenager-parent register.
- **`/debate`** — *"A literary magazine masthead, but it's about debating."* Paris Review austere; named results.

## Per-persona contact funnel

Each persona page carries its own contact / capture flow, so that a visitor can complete the full conversion journey without leaving the persona page. This is a direct consequence of the "separate sites that share bones" principle — sending a visitor from `/dev` to a generic `/contact` would break the "this is my main thing" illusion.

### What stays shared

Infrastructure stays shared even where the user-facing form diverges:

- Same backend submission endpoint
- Same spam protection (reCAPTCHA + rate-limit + classifier)
- Same email pipeline (existing Brevo SMTP flow)
- Same TypeScript types for the underlying submission payload

### What diverges per persona

Sketches — actual shape will fall out of the Claude Design mocks:

| Persona | Form fields (qualifying questions) | Placement | Primary CTA copy |
|---|---|---|---|
| `/dev` | App idea + stage (idea / prototype / live) + rough budget | In-page modal triggered by hero CTA | `START A PROJECT` |
| `/harness` | (Possibly a Calendly + Twitter DM rather than a form — audience is post-form) | TBD | TBD |
| `/ai-pm` | Role + stage of company + AI surface area | Inline lower on page | `START A CONVERSATION` |
| `/strategist` | Company + engagement type + timeline | Separate surface lower on page so brutalist hero stays uncluttered | `BOOK A CONSULTATION` |
| `/teacher` | Year group + exam board + frequency needed | Inline form near the bottom, warm and inviting | `BOOK A SESSION` |
| `/debate` | School / event name + date + format (judging / coaching / training) | Inline | `BOOK ANGUS` |

Treat this section as the **contract** (shared backend, divergent fields/copy/placement), not a specification. Mocks will refine it.

## Implementation workflow (v2)

The v2 design pass uses a **design-tool-first, hand-merge-second** workflow:

1. **Design in Claude Design** (claude.ai/design) — one HTML mock per persona, working through the per-persona aesthetic anchor and reference set above. Content can be approximate; design direction is the point.
2. **Hand off HTML to this repo** — Angus delivers HTML mock per persona (e.g. `/dev` first, others to follow).
3. **Implementation reconciliation** — the integrator (Claude Code) merges the HTML mock into the existing Next.js + Mantine codebase, preserving the shared component primitives, design tokens, and contact-backend plumbing. Content is rewritten from the persona's `docs/cvs/<persona>-cv.md` research markdown (not from the mock's placeholder copy).
4. **Per-persona contact funnel** is wired during integration using the shared backend, with form fields and CTA copy per the matrix above.

This is a one-off workflow for the v2 visual refresh, not a replacement for the canonical [persona-page-workflow.md](./persona-page-workflow.md) (which remains the long-term process for building new persona pages from scratch).

## Out of scope for this doc

- Per-persona component specs (lives in the page implementation; future shared `<PersonaHero>` etc.)
- Code-stats refresh cadence (lives in [persona-page-workflow.md § Phase 5](./persona-page-workflow.md))
- The specific contents of each persona's research substrate (lives in `docs/cvs/<persona>-cv.md`)
- Implementation order — see workflow doc's v2 backlog
