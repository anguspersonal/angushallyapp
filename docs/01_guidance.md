# Documentation Guidance

Welcome to the documentation hub for **angushallyapp**. This guide explains how the docs are organized, how to navigate them, and best practices for keeping them up to date.

---

## 1. Documentation Structure

```
/
├── README.md               ← Project overview & quick start
├── react-ui/
│   └── README.md           ← Frontend overview & quick start
├── server/
│   └── README.md           ← Backend overview & quick start
└── docs/
    ├── 01_guidance.md      ← This document (how to use the docs)
    ├── 02_roadmap.md       ← High-level vision & milestones
    ├── 03_updates.md       ← Detailed, chronological change log
    ├── 04_schema.md        ← Human-readable DB schema overview
    ├── 05_database.md      ← Database setup & migrations guide
    ├── 06_tech_debt.md     ← Known architectural & code-quality debt
    ├── 07_backlog.md       ← Feature wishlist & prioritization
    ├── 08_module_development_flow.md  ← Module development workflow guide
    ├── adr/                ← Architecture Decision Records
    │   └── *.md           ← Individual ADR documents
    └── assets/             ← Diagrams, exports, and other visuals
```

## 2. Application Hierarchy

**angushallyapp** follows a clear three-tier hierarchy:

### App → Sub-project → Module/Component

- **App**: angushallyapp (the monolithic application)
- **Sub-project**: Domain-specific areas like bookmark, eat-safe-uk, habit-tracking, strava, etc.
- **Module**: Individual components within sub-projects (e.g., "B3 - Canonical Content Registry" within the bookmark sub-project)

**Examples:**
- App: `angushallyapp`
  - Sub-project: `bookmark` (located in `/server/bookmark-api/`)
    - Module: "B3 - Canonical Content Registry"
    - Module: "Raindrop Integration"
  - Sub-project: `eat-safe-uk` (located in `/server/fsa-data-sync/`)
    - Module: "Authority Data Fetcher"
    - Module: "Establishment Processor"

## 3. Documentation Hierarchy

This is a **monolith application** that combines multiple sub-projects. Documentation follows a three-tier hierarchy:

### Global Level (`/docs`)
- Application-wide documentation
- Cross-system architecture and decisions
- Database schemas and migrations
- Roadmap and backlog

### Project Level
- **Backend**: `/server/[subProjectName]/README.md` (comprehensive)
- **Frontend**: `react-ui/src/pages/projects/[subProjectName]/README.md` (minimal, references backend)

### File Level
- In-file documentation for JSX/JS files following best practices

## 4. Reference-Based Documentation Approach

**Frontend documentation should be minimal and reference backend documentation:**

- Frontend READMEs should contain only frontend-specific information
- Include reference: "For backend documentation, see `/server/[subProjectName]/README.md`"
- Backend READMEs contain the comprehensive sub-project documentation

**Example sub-project structure:**
```
/server/
└── fsa-data-sync/
    ├── README.md           ← Comprehensive documentation
    ├── fetchEstablishments.js
    └── processRatingValue.js

react-ui/src/pages/projects/
└── eat-safe-uk/
    ├── README.md           ← Minimal, references backend
    ├── EatSafeUK.jsx
    └── GMapsSearchBar.jsx
```

## 5. File Naming & Order

* **Numeric Prefix**: Global docs are prefixed with `01_`, `02_`, etc., to enforce a logical reading order.
* **Descriptive Names**: Use clear, concise filenames matching their content (e.g., `03_updates.md`).
* **Assets Folder**: Store images, DB diagrams, and other binary assets under `docs/assets/`.
* **ADR Files**: Architecture Decision Records are numbered sequentially (e.g., `0001-tech-stack.md`).

## 6. Doc File Purposes

### Global Documentation (`/docs`)

1. **01\_guidance.md**: This guide—how to navigate and update the docs.
2. **02\_roadmap.md**: High‐level project phases, goals, and timelines.
3. **03\_updates.md**: Chronological changelog for cross-system changes; include an **Unreleased** section at the top for "Current Focus."
4. **04\_schema.md**: Concise DB schema summary; link to `.dbml` files or ER diagrams.
5. **05\_database.md**: Detailed database setup, migrations, and maintenance.
6. **06\_tech\_debt.md**: List of known technical debt items, rationale, and references.
7. **07\_backlog.md**: Prioritized feature backlog, grouped by area.
8. **08\_module\_development\_flow.md**: Step-by-step workflow guide for developing modules with server and frontend contexts.
9. **adr/**: Architecture Decision Records documenting significant technical decisions.

### Project-Level Documentation

- **Backend**: Comprehensive sub-project documentation in `/server/[subProjectName]/README.md`
- **Frontend**: Minimal documentation in `react-ui/src/pages/projects/[subProjectName]/README.md`

### Module-Level Documentation

- **Within Sub-project READMEs**: Module details are documented within their parent sub-project's README.md
- **Dedicated Module Files**: For complex modules, create dedicated documentation files within the sub-project directory

## 7. When & How to Update

Documentation updates follow the hierarchy:

### Global Documentation Updates
* **02\_roadmap.md**: Review & revise quarterly (or per major sprint). Reflect strategic shifts.
* **03\_updates.md**: Add entries for **CROSS-SYSTEM** changes, merges, or hotfixes. Use the format:

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

### Project-Level Documentation Updates
- **Backend**: Update `/server/[subProjectName]/README.md` for any sub-project changes
- **Frontend**: Update `react-ui/src/pages/projects/[subProjectName]/README.md` for frontend-specific changes
- **New routes**: Update API documentation in `/server/routes/` folder

### Module-Level Documentation Updates
- **Within Sub-project**: Update module documentation within the parent sub-project's README.md
- **Dedicated Files**: Update dedicated module documentation files as needed

## 8. Sub-Project README Guidelines

Each sub-project should include its own `README.md` within its directory:

### Backend Sub-Project README Template

```md
# [Sub-Project Name]

**Location:** `/server/[subProjectName]`

## Purpose
Describe the sub-project's responsibilities and boundaries.

## Modules
List and describe the individual modules within this sub-project:
- **Module A**: Description and purpose
- **Module B**: Description and purpose

## Interfaces / Exports
List the public functions, classes, or endpoints this sub-project exposes, including method signatures and expected inputs/outputs.

## Dependencies & Integrations
Detail any interactions with other sub-projects, external services, or database schemas.

## Configuration & Usage
Explain required configuration (e.g., environment variables) and include basic usage examples or code snippets.

## Security & Permissions
Outline any authentication, authorization, or other security considerations.

## API Endpoints
Document any REST endpoints or API routes exposed by this sub-project.

## Change History
- YYYY-MM-DD: Created
- YYYY-MM-DD: Updated to include …
```

### Frontend Sub-Project README Template

```md
# [Sub-Project Name] - Frontend

**Location:** `react-ui/src/pages/projects/[subProjectName]`

## Purpose
Brief description of the frontend components for this sub-project.

## Components
List and briefly describe the main React components.

## Dependencies
Frontend-specific dependencies and integrations.

## For Backend Documentation
See `/server/[subProjectName]/README.md` for comprehensive sub-project documentation.

## Change History
- YYYY-MM-DD: Created
- YYYY-MM-DD: Updated to include …
```

**Best Practices**:

* Ship every new sub-project with a `README.md` in both backend and frontend locations.
* Keep frontend READMEs minimal and focused on frontend-specific concerns.
* Always reference backend documentation from frontend READMEs.
* Refer to sub-project READMEs from the top-level `README.md` or relevant docs for easy navigation.

## 9. Contribution Workflow

1. **Add or modify code** as needed.
2. **Update relevant docs**:

   * New feature → update `07_backlog.md` & `03_updates.md` (if cross-system).
   * Schema change → update `04_schema.md` & `05_database.md`.
   * Tech debt item discovered → update `06_tech_debt.md`.
   * Sub-project changes → update appropriate sub-project README.md.
   * Module changes → update module documentation within sub-project README.md.
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

**What the project is and how to start** (README.md)

**Why it's going where it's going** (docs/02_roadmap.md)

**What's changed and what's next** (docs/03_updates.md)

**How it works under the hood** (docs/04_schema.md, sub-project READMEs)

**What's still owed** (docs/06_tech_debt.md)