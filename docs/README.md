# Docs

This folder is the canonical home for project documentation. It follows the organisation principles below so that docs stay discoverable, current, and low-maintenance.

## Organisation Principles

1. **Historical records live in `adr/`** (Architectural Decision Records). They do not sit at the top level of `docs/`. Anything that is a snapshot of past reasoning, an incident write-up, a migration log, or a "how we decided X" record belongs in an ADR.
2. **Top level is evergreen + intent.** At minimum, the top level contains:
   - `vision.md` — evergreen, updated: what we're building and why.
   - `architecture.md` — evergreen, updated: how the system is structured.
   - `backlog.json` — ideally present: both small fixes and future ideas, in a single structured file.
3. **`guides/` holds all onboarding, guides, how-tos, and runbooks.** One folder, one purpose: teach or walk through a task.
4. **No other folders, ideally.** The only expected subfolders are `adr/` and `guides/`. Resist creating new ones.
5. **Minimise top-level files.** Every top-level file is a liability; fewer is better.
6. **Top-level files are either evergreen-updated or WIP.** WIP files eventually move into a subfolder (typically `adr/`) or are consolidated into a section of an existing subfolder doc. Nothing stale should linger at the top level.
7. **All files in `docs/` are `.md` or `.json`.** No other formats.
8. **ADRs are numbered.** Use a zero-padded sequential prefix (e.g. `0001-title.md`, `0002-title.md`) so ordering and references are stable.

## Target Structure

```
docs/
  README.md             # this file
  vision.md             # evergreen — what we're building and why
  architecture.md       # evergreen — how the system is structured
  backlog.json          # evergreen — fixes, tech debt, ideas, polish
  implementation-plan.md  # WIP — active modernization sequencing
  adr/
    0001-*.md … 0030-*.md
  guides/
    README.md           # guides index
    *.md                # onboarding, how-tos, runbooks, migration guides
  assets/               # exception: binary + non-md/json schema artifacts
    *.png, *.dbml
```

### Exceptions

- **`assets/`** currently holds the ERD PNG and `.dbml` schema files referenced by `guides/database-schema.md` and `guides/database.md`. These can't be `.md` or `.json`, so this folder is a pragmatic exception to principle 7. Keep it narrow — assets only, no narrative docs.

## Classifying a Doc

When adding or reviewing a doc, ask:

- **Evergreen?** Keep it at the top level and commit to updating it.
- **Working / WIP?** Keep it at the top level temporarily; plan its landing place (ADR, guide section, or deletion).
- **Historical record?** Move it into `adr/` with a number.
- **Teaching / procedural?** Move it into `guides/`.

If a doc doesn't fit any of the above, it probably shouldn't exist.

## Update Cadence

- **`vision.md`** — review when strategic direction shifts (typically quarterly or at major sprint boundaries).
- **`architecture.md`** — update alongside any change that affects system structure, module boundaries, or tech stack.
- **`backlog.json`** — living list; add items as ideas or small fixes surface, and remove / move them as they're completed.
- **`adr/`** — create a new, numbered ADR for any significant architectural decision. Each ADR includes: Status (Proposed / Accepted / Deprecated / Superseded), Context, Decision, Consequences, and links to related ADRs or docs.
- **`guides/`** — update whenever the workflow or runbook it describes changes. If a guide goes stale and no one will maintain it, delete it.

## Contribution Workflow

1. Make the code change.
2. Update the relevant doc in the same PR:
   - Architectural change → `architecture.md` (and a new ADR if the decision is significant).
   - New idea or small fix → `backlog.json`.
   - New workflow / runbook / how-to → add or update a file in `guides/`.
   - Closed-out investigation, migration, or incident write-up → new numbered ADR in `adr/`.
3. Reviewers verify both code and docs.

## Documentation Beyond `docs/`

Project-level documentation lives alongside the code it describes, not in this folder:

- **Root [`README.md`](../README.md)** — project overview, quick start, top-level pointers.
- **Root [`CHANGELOG.md`](../CHANGELOG.md)** — chronological release/update log.
- **Sub-project / module `README.md`** — lives next to the code (e.g. `src/lib/<module>/README.md`).
- **Archived knex migrations** live in `server/migrations/archive/knex-history/` — schema artifacts, not documentation.

This folder is for cross-cutting, project-wide documentation only.

## Quick index

- **Start here:** [`vision.md`](./vision.md), [`architecture.md`](./architecture.md)
- **Work in flight:** [`implementation-plan.md`](./implementation-plan.md), [`backlog.json`](./backlog.json)
- **Guides & runbooks:** [`guides/README.md`](./guides/README.md)
- **Decisions & history:** [`adr/`](./adr/) (ADRs 0001–0033)
