# Documentation Guidance

Welcome to the documentation hub for **angushallyapp**. This guide explains how the docs are organized, how to navigate them, and best practices for keeping them up to date.

---

## 1. Directory Structure

```
/
├── README.md               ← Project overview & quick start
└── docs/
    ├── 01_guidance.md      ← This document (how to use the docs)
    ├── 02_roadmap.md       ← High-level vision & milestones
    ├── 03_updates.md       ← Detailed, chronological change log
    ├── 04_schema.md        ← Human-readable DB schema overview
    ├── 05_database.md      ← Database setup & migrations guide
    ├── 06_tech_debt.md     ← Known architectural & code-quality debt
    ├── 07_backlog.md       ← Feature wishlist & prioritization
    ├── adr/                ← Architecture Decision Records
    │   └── *.md           ← Individual ADR documents
    └── assets/             ← Diagrams, exports, and other visuals
```

## 2. File Naming & Order

* **Numeric Prefix**: Files are prefixed with `01_`, `02_`, etc., to enforce a logical reading order.
* **Descriptive Names**: Use clear, concise filenames matching their content (e.g., `03_updates.md`).
* **Assets Folder**: Store images, DB diagrams, and other binary assets under `docs/assets/`.
* **ADR Files**: Architecture Decision Records are numbered sequentially (e.g., `0001-tech-stack.md`).

## 3. Doc File Purposes

1. **01\_guidance.md**: This guide—how to navigate and update the docs.
2. **02\_roadmap.md**: High‐level project phases, goals, and timelines.
3. **03\_updates.md**: Chronological changelog; include an **Unreleased** section at the top for "Current Focus."
4. **04\_schema.md**: Concise DB schema summary; link to `.dbml` files or ER diagrams.
5. **05\_database.md**: Detailed database setup, migrations, and maintenance.
6. **06\_tech\_debt.md**: List of known technical debt items, rationale, and references.
7. **07\_backlog.md**: Prioritized feature backlog, grouped by area.
8. **adr/**: Architecture Decision Records documenting significant technical decisions.

## 4. When & How to Update

* **02\_roadmap.md**: Review & revise quarterly (or per major sprint). Reflect strategic shifts.
* **03\_updates.md**: Add entries for every release, merge, or hotfix. Use the format:

  ```md
  ## [Unreleased] – YYYY-MM-DD
  ### 🚧 Current Focus
  - ...

  ## X.Y.Z – YYYY-MM-DD
  - ...
  ```
* **04\_schema.md**: Update alongside any DB schema or model changes.
* **05\_database.md**: Update when migrations are added or altered, or when setup steps change.
* **06\_tech\_debt.md**: Add new debt items as they are discovered; mark off or remove items when addressed.
* **07\_backlog.md**: Keep as a living wishlist; update when new feature ideas arise or priorities shift.
* **adr/**: Create new ADRs for significant architectural decisions. Each ADR should include:
  - Status (Proposed/Accepted/Deprecated/Superseded)
  - Context (why the decision was needed)
  - Decision (what was decided)
  - Consequences (pros and cons)
  - Related ADRs or documents

## 5. Module-Level README Guidelines

Each major module—whether an API router, service layer, or distinct component—should include its own `README.md` within its module directory. For example:

```bash
/server/
└── habit/
    ├── habitService.js
    ├── alcoholService.js
    └── README.md
```

**README Template**:

```md
# [Module Name]

**Location:** `/path/to/module`

## Purpose
Describe the module's responsibilities and boundaries.

## Interfaces / Exports
List the public functions, classes, or endpoints this module exposes, including method signatures and expected inputs/outputs.

## Dependencies & Integrations
Detail any interactions with other modules, external services, or database schemas.

## Configuration & Usage
Explain required configuration (e.g., environment variables) and include basic usage examples or code snippets.

## Security & Permissions
Outline any authentication, authorization, or other security considerations.

## Change History
- YYYY-MM-DD: Created
- YYYY-MM-DD: Updated to include …
```

**Best Practices**:

* Ship every new module with a `README.md`.
* Keep module READMEs focused: cover responsibilities, APIs/interfaces, and usage.
* Refer to module READMEs from the top-level `README.md` or relevant docs for easy navigation.

## 6. Contribution Workflow Contribution Workflow

1. **Add or modify code** as needed.
2. **Update relevant docs**:

   * New feature → update `07_backlog.md` & `03_updates.md`.
   * Schema change → update `04_schema.md` & `05_database.md`.
   * Tech debt item discovered → update `06_tech_debt.md`.
3. **Submit PR** including both code & doc changes.
4. **Reviewers**: verify code functionality and documentation completeness.

---

## Environment Variable Management

We centralise all of our environment‐specific settings in a single place and propagate them to both server and client via a lightweight sync script.  This ensures:

- **One source of truth**: root `.env` files control _all_ variables for server and client  
- **Zero-if-possible**: application code never contains `if (NODE_ENV === ...)`; it only reads `process.env.*`  
- **CRA-friendly**: client‐side env vars live in `react-ui/.env.development` and `react-ui/.env.production` (plus optional `.env.local`)  
- **Express-friendly**: server reads root `.env`, `.env.development` or `.env.production`, and `.env.local` via our existing `config/env.js`

When you need full details on the why and how, see our ADR:  
[ADR 0010 – Environment Configuration Management](./adr/0010-env-config-management.md)


---

With this structure, any contributor—or future you—can easily find the right documentation at the right level of detail.
This layered approach ensures that anyone—from a new contributor to future you—can instantly find:

What the project is and how to start (README.md)

Why it's going where it's going (docs/02_roadmap.md)

What's changed and what's next (docs/03_updates.md)

How it works under the hood (docs/04_schema.md, module READMEs)

What's still owed (docs/06_tech_debt.md)