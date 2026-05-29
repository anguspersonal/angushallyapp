# Chatbot knowledge folder

This is the **single source of truth** for what the chatbot knows. Each
`.md` file in this folder becomes one entry in the system-prompt
knowledge bundle.

## File shape

Every knowledge file is markdown with YAML-ish front-matter:

```
---
source: /about
topic: About Angus
priority: high
---

The body of the entry. Plain markdown — links, lists, bold all fine. No
front-matter beyond the three keys above (parser is intentionally tiny).
```

Front-matter fields:

| Key        | Required | Notes                                                                 |
| ---------- | -------- | --------------------------------------------------------------------- |
| `source`   | yes      | Either a site route (`/about`, `/projects/habit`) or a literal label  |
|            |          | (`heylina`, `github`). Routes are used by the page-aware system       |
|            |          | prompt: when the user is currently viewing `/about`, the matching     |
|            |          | entry is highlighted as "current page".                               |
| `topic`    | yes      | Short human label shown in the prompt's per-entry header.             |
| `priority` | yes      | `high` | `normal` | `low`. Pure ordering signal — `high` entries  |
|            |          | go first so they survive token-budget truncation.                     |

Body is plain markdown; the build script preserves it verbatim into the
bundle. Keep entries tight — the **whole bundle must fit in 8 000 tokens**
(FR-KB-3). The build fails on overage.

## Editing workflow

1. Edit (or add) a `.md` file under `docs/chatbot-knowledge/`.
2. Run `npm run build:chat` to regenerate `src/lib/chat/knowledge.generated.ts`.
3. The token count is printed at the end. If `≤ 8000`, you're good. If
   over, tighten the largest `priority: low` entries first.
4. Commit both the `.md` change AND the regenerated `.ts` file. Reviewers
   see content diffs that way.

## When to use a new file vs edit an existing one

- One file per **topic** the bot might be asked about.
- One file per **route** the bot can land on (for the page-aware context).
- External enrichment (HeyLina, GitHub activity) gets its own files —
  separation makes the source provenance clear.

Don't over-fragment. If two topics are tightly coupled (e.g. /cv and
skills summary) keep them in one file.

## Existing files

See the sibling `.md` files in this directory.
