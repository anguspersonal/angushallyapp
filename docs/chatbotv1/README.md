# Chatbot v1 — operator's manual

Practical guide for running, editing, and operating the site-wide chat
assistant. For *why* it looks the way it does, see
[`requirements.md`](./requirements.md) and [`design.md`](./design.md).

---

## Local setup

1. Copy env vars from `.env.example` to `.env.local`. The chat block
   needs five:

   | Var                                              | Get from                                                                                  |
   | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
   | `ANTHROPIC_API_KEY`                              | <https://console.anthropic.com> → API keys                                                |
   | `CHAT_DAILY_SPEND_CAP_USD`                       | Pick a number. `5` is fine for dev.                                                       |
   | `CHAT_INPUT_PRICE_USD_PER_MILLION_TOKENS`        | Anthropic Haiku 4.5 pricing — currently `1.00`                                            |
   | `CHAT_OUTPUT_PRICE_USD_PER_MILLION_TOKENS`       | Anthropic Haiku 4.5 pricing — currently `5.00`                                            |
   | `CHAT_IP_HASH_PEPPER`                            | `openssl rand -hex 32`                                                                    |

2. Apply the Supabase migration that creates `chat.sessions` + `chat.messages`:

   ```bash
   supabase db reset                       # local
   # or: supabase db push                  # to a linked project
   ```

   **Prerequisite (one-time):** enable the `pg_cron` extension in the
   Supabase dashboard (Database → Extensions). The migration registers
   a daily retention job via `cron.schedule(...)` which fails without
   the extension.

3. Run the build steps once to generate the knowledge bundle + route
   allowlist:

   ```bash
   npm run build:chat
   ```

4. `npm run dev` — the chat bubble appears bottom-right on every
   public route (see *Visibility* below).

---

## Editing the knowledge bundle

The chatbot is grounded on a static bundle of site facts compiled at
build time. To add or change what it knows:

1. Edit [`scripts/chat-knowledge.config.mjs`](../../scripts/chat-knowledge.config.mjs).
   Each entry has `{ source, topic, extract(ctx) }`. The extractor
   returns plain text (no JSX); `ctx.readFile(rel)` loads files
   relative to the repo root.
2. Run `npm run build:chat`. This regenerates
   `src/lib/chat/knowledge.generated.ts` and prints the new token count.
3. The build fails if the bundle exceeds **8 000 tokens** (FR-KB-3).
   Tighten an entry rather than relaxing the cap; the bound exists to
   keep per-message cost and time-to-first-token predictable.

Knowledge is committed so PR reviewers see content diffs.

---

## Changing visibility (where the bubble appears)

The launcher's visibility is controlled by **one file**:
[`src/lib/chat/visibility.config.ts`](../../src/lib/chat/visibility.config.ts).

```ts
export const VISIBILITY = {
  allow:     ['/**'],                    // default: everywhere
  deny:      ['/login', '/auth/**'],     // never on these
  forceShow: [],                         // escape hatch
};
```

Precedence: `forceShow > deny > allow > default-deny`. Patterns are
minimatch-style: `*` matches one segment, `**` matches any sub-path
(see [`visibility.ts`](../../src/lib/chat/visibility.ts) for the
matcher). To hide the bubble on a sub-project, add its route pattern
to `deny`. No other file needs to change.

The `navigate` tool's allowlist (where the bot is *allowed to navigate
the user*) is derived from the same deny list — see
[`scripts/build-chat-routes.mjs`](../../scripts/build-chat-routes.mjs).

---

## Retention and privacy posture

- Conversations are stored in Supabase for **90 days**, then deleted by
  a `pg_cron` job (`chat-retention`) registered in the migration.
  Cascading FK deletes wipe the associated messages.
- **No raw IP** is ever stored. IPs are SHA-256 hashed with a server-
  side pepper (`CHAT_IP_HASH_PEPPER`) before any DB write
  (`src/lib/chat/ipHash.ts`).
- Lawful basis under UK/EU GDPR (FR-PERS-9) is **legitimate interest**
  with the FR-UI-11 in-chat disclosure. Full GDPR posture (DPIA, DPA
  with Anthropic, deletion-on-request flow) is v2 scope; see
  `requirements.md` §9.

### Rotating the IP-hash pepper

```bash
openssl rand -hex 32                       # generate new pepper
# update CHAT_IP_HASH_PEPPER in:
#   - .env.local (you)
#   - Vercel project settings (prod + preview)
```

Old hashes become un-correlatable with new ones after rotation. This is
the right behaviour: it limits the blast radius of any one pepper leak.

---

## Spend cap and the "resting" state

`CHAT_DAILY_SPEND_CAP_USD` is checked on every incoming request by
summing `tokens_in × input_price + tokens_out × output_price` over the
current UTC day from `chat.messages`. The aggregate is cached in
process memory for 60 seconds so the cap-check itself is cheap.

When the cap is exceeded:

- The route handler returns SSE `error: { code: 'budget_exhausted' }`.
- The chat panel switches to `<ChatRestingState />` — a static FAQ
  with a link to `/contact`.
- The next UTC day, the aggregate naturally drops back below the cap
  and normal service resumes.

To force-trip the cap during testing:

```
CHAT_DAILY_SPEND_CAP_USD=0.0001
```

…then send any message.

---

## Operational notes

- Rate limit: 20 messages / 5 min per hashed IP, in-memory bucket
  (FR-RATE-1). On a multi-instance host this would need a shared
  store; on Vercel's per-region pooling it's good enough for v1.
- Per-session cap: 50 user messages per `sessionId` (FR-RATE-2).
- Max input length: 1000 chars (FR-RATE-3) — enforced client-side
  in the composer and re-validated server-side.

---

## Pointers

- [`requirements.md`](./requirements.md) — what v1 must do.
- [`design.md`](./design.md) — how v1 is built.
- [`tasks.md`](./tasks.md) — implementation plan (11 PRs).
- [`../adr/0002-db-schema-separation.md`](../adr/0002-db-schema-separation.md) — `chat` schema rationale.
- [`../adr/0010-env-config-management.md`](../adr/0010-env-config-management.md) — env conventions.
- [`../adr/0032-responsive-layout-strategy.md`](../adr/0032-responsive-layout-strategy.md) — `--bp-*` tokens.
