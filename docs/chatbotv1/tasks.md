# Implementation Plan

Generated from [`requirements.md`](./requirements.md) and [`design.md`](./design.md). Tasks follow the 11-PR phasing in design §15; each top-level task is intended to land as its own PR against `dev` per `docs/agents/branching.md`. Test tasks (marked `*`) are property-style tests kept next to the risky logic they validate.

---

- [ ] 1. Supabase persistence foundation (schema, write path, IP hashing)
  - [ ] 1.1 Create the `chat` schema and tables migration
    - Add `supabase/migrations/<timestamp>_create_chat_tables.sql` using the SQL drafted in design §8.
    - Create `chat` schema; create `chat.sessions` and `chat.messages` with the exact column set in design §8 (including `injection_flagged`, `tool_name`, `tool_args jsonb`).
    - Add indexes: `idx_chat_sessions_anon_id`, `idx_chat_sessions_ip_hash`, `idx_chat_sessions_created_at`, `idx_chat_messages_created_at`, `idx_chat_messages_session`, partial `idx_chat_messages_flagged` (WHERE `injection_flagged = true`).
    - Enable RLS on both tables; ship no policies (service-role bypasses; anon is denied by default).
    - Wrap statements in `BEGIN; ... COMMIT;` and add header comment matching the convention in `supabase/migrations/20260520154800_add_hot_path_indexes.sql`.
    - _Requirements: FR-PERS-1, FR-PERS-2, FR-PERS-4_

  - [ ] 1.2 Schedule the 90-day retention job in the same migration
    - Append a `SELECT cron.schedule('chat-retention', '0 3 * * *', $$DELETE FROM chat.sessions WHERE created_at < now() - interval '90 days'$$);` call.
    - Rely on `ON DELETE CASCADE` from `chat.messages.session_id` to clean messages.
    - **human input required**
    - Verify `pg_cron` extension is enabled in the Supabase project dashboard before applying. If not, enable it from Database → Extensions; document the step in `docs/chatbotv1/README.md` (created in task 11).
    - _Requirements: FR-PERS-6_

  - [ ] 1.3 Apply the migration and verify the schema
    - Run `supabase db reset` (or the project's equivalent migration runner).
    - Inspect via `supabase studio` or `psql` that `chat.sessions`, `chat.messages`, the six indexes, and the `chat-retention` cron entry all exist.
    - _Requirements: AC8, FR-PERS-1_

  - [ ] 1.4 Implement IP hashing helper at `src/lib/chat/ipHash.ts`
    - Export `hashIp(ip: string): string` using `node:crypto` `createHash('sha256').update(\`${ip}|${pepper}\`)`.
    - Read pepper from `process.env.CHAT_IP_HASH_PEPPER`; throw if missing.
    - _Requirements: FR-PERS-7, FR-RATE-5_

  - [ ]* 1.5 Property test for `hashIp` determinism and pepper requirement
    - **Property 1: Deterministic & pepper-bound IP hash**
    - Assert same `(ip, pepper)` always returns same digest; different peppers produce different digests; missing pepper throws.
    - **Validates: Requirements FR-PERS-7**

  - [ ] 1.6 Implement persistence helpers at `src/lib/chat/persistence.ts`
    - Use `getSupabaseAdmin()` from `@/lib/supabase/admin`.
    - Export `upsertSession({ sessionId, anonId, ipHash, userAgent, referrer, route })` — idempotent insert.
    - Export `writeTurn({ sessionId, role, content, model?, tokensIn?, tokensOut?, latencyMs?, route?, toolName?, toolArgs?, injectionFlagged? })`.
    - Both functions log errors via `console.error` and return `void`; they never throw to the caller (FR-PERS-3).
    - _Requirements: FR-PERS-3, FR-PERS-4_

- [ ] 2. Visibility configuration and matcher
  - [ ] 2.1 Implement the glob matcher at `src/lib/chat/visibility.ts`
    - Define `type VisibilityRule = { allow: string[]; deny: string[]; forceShow: string[] }`.
    - Export `isChatVisible(pathname: string, rules: VisibilityRule): boolean` implementing precedence: forceShow > deny > allow > default-deny (design §7).
    - Support `*` (single segment) and `**` (zero-or-more segments). No new dependency.
    - _Requirements: FR-VIS-2, FR-VIS-3, FR-VIS-5_

  - [ ] 2.2 Ship the v1 config at `src/lib/chat/visibility.config.ts`
    - Export `VISIBILITY` constant with `allow: ['/**']`, `deny: ['/login', '/auth/**']`, `forceShow: []`.
    - File must be the only place visibility decisions live (FR-VIS-1, FR-VIS-8).
    - _Requirements: FR-VIS-1, FR-VIS-4, FR-VIS-8_

  - [ ]* 2.3 Property test for matcher precedence
    - **Property 2: forceShow > deny > allow > default-deny**
    - Assert: any path in `forceShow` shows even if also in `deny`; any path in `deny` (and not `forceShow`) hides; any path matching `allow` shows; path matching nothing hides.
    - Cover `/**` semantics with at least three depths.
    - **Validates: Requirements FR-VIS-2, FR-VIS-7**

- [ ] 3. Knowledge-bundle build step
  - [ ] 3.1 Author the bundle config at `scripts/chat-knowledge.config.mjs`
    - List sources: `/about`, `/cv`, `docs/vision.md`, `src/app/HomePageClient.tsx` "now" section, each `/projects/*` page, `/blog` index, `/contact`, `/work-with-me`, README skills section.
    - Each entry: `{ source, topic, extractor }` where `extractor` is a small function that produces clean text from the file.
    - _Requirements: FR-KB-1, FR-KB-2_

  - [ ] 3.2 Implement `scripts/build-chat-knowledge.mjs`
    - Read the config; run each extractor; collect into an ordered array.
    - Token-count the joined bundle (vendor a small BPE table or use `@anthropic-ai/tokenizer` if added — design §5.2).
    - Fail (`process.exit(1)`) if total tokens > 8000 (FR-KB-3).
    - Emit `src/lib/chat/knowledge.generated.ts` with `KNOWLEDGE_BUNDLE` (typed `as const`) and `KNOWLEDGE_TOKEN_COUNT`.
    - Deterministic output order so diffs are reviewable.
    - _Requirements: FR-KB-1, FR-KB-2, FR-KB-3_

  - [ ] 3.3 Wire the build step into npm scripts
    - Add `"prebuild": "node scripts/build-chat-knowledge.mjs && node scripts/build-chat-routes.mjs"` to `package.json` (route step added in task 4; prebuild chains them).
    - Add a standalone `"build:chat": "node scripts/build-chat-knowledge.mjs"` for local iteration.
    - Commit `knowledge.generated.ts` so reviewers see content diffs.
    - _Requirements: FR-KB-1_

  - [ ]* 3.4 Build-time test that the bundle stays under budget
    - **Property 3: Knowledge bundle ≤ 8000 tokens**
    - Add a Vitest case that imports `KNOWLEDGE_TOKEN_COUNT` and asserts `≤ 8000`.
    - **Validates: Requirements FR-KB-3**

- [ ] 4. Route allowlist build step
  - [ ] 4.1 Implement `scripts/build-chat-routes.mjs`
    - Crawl `src/app/**/page.tsx`; derive route paths (handle `(group)` segments and `[param]` placeholders correctly — drop dynamic-param routes from the allowlist for v1).
    - Apply the deny list from `visibility.config.ts` so denied routes never end up in the allowlist.
    - Emit `src/lib/chat/tools.allowlist.generated.ts` exporting `ROUTE_ALLOWLIST` (typed `as const`).
    - _Requirements: FR-AGENT-2_

  - [ ]* 4.2 Property test: allowlist never contains denied routes
    - **Property 4: Allowlist disjoint from deny list**
    - Assert no path in `ROUTE_ALLOWLIST` matches any pattern in `VISIBILITY.deny`.
    - **Validates: Requirements FR-AGENT-2, FR-VIS-4**

- [ ] 5. Streaming Route Handler `/api/chat`
  - [ ] 5.1 Define shared types at `src/lib/chat/types.ts`
    - `ChatRequestBody`, `ToolUseRecord`, `StreamEvent` (union of `ready` | `delta` | `tool_use` | `done` | `error`).
    - Field shapes match design §4.1 and §4.2.
    - _Requirements: FR-CONV-2_

  - [ ] 5.2 Implement tool schemas at `src/lib/chat/tools.ts`
    - Export `NAVIGATE_TOOL` and `DRAFT_CONTACT_TOOL` matching design §6.
    - `NAVIGATE_TOOL.input_schema.properties.path.enum` reads from `ROUTE_ALLOWLIST`.
    - `DRAFT_CONTACT_TOOL.input_schema` enforces `subject ≤ 120`, `body ≤ 2000` (FR-AGENT-11).
    - _Requirements: FR-AGENT-1, FR-AGENT-2, FR-AGENT-6, FR-AGENT-11_

  - [ ] 5.3 Build the system prompt at `src/lib/chat/systemPrompt.ts`
    - Export `buildSystemPrompt()` returning the template in design §5.1 with `{KNOWLEDGE_BUNDLE}` substituted from `KNOWLEDGE_BUNDLE`.
    - Inject identity rules, tool list, refusal list, and style guide as in design §5.1.
    - _Requirements: FR-SAFE-1, FR-SAFE-2, FR-SAFE-5, FR-SAFE-6, FR-KB-2_

  - [ ] 5.4 SSE framing helpers at `src/lib/chat/streamServer.ts`
    - Export `sseFrame(event: string, data: unknown): string` that emits `event: ...\ndata: ...\n\n`.
    - Export `createSseStream()` returning a `{ stream, send, close, abort }` over `ReadableStream`.
    - _Requirements: FR-CONV-1_

  - [ ] 5.5 Implement the POST handler at `src/app/api/chat/route.ts`
    - `export const runtime = 'nodejs'` (design §2).
    - Validate `ChatRequestBody` (uuid sessionId, message ≤ 1000 chars per FR-RATE-3, history token budget); 400 on malformed input.
    - Resolve client IP (`request.headers.get('x-forwarded-for')?.split(',')[0]` first, fallback to `request.headers.get('x-real-ip')`); call `hashIp`.
    - Call `upsertSession` once per new session, `writeTurn` for the user message.
    - Initialise Anthropic client with `process.env.ANTHROPIC_API_KEY`; model `claude-haiku-4-5-20251001`; no extended thinking (TC-4).
    - Open `messages.stream({ model, system: buildSystemPrompt(), messages: [...history, userMessage], tools: [NAVIGATE_TOOL, DRAFT_CONTACT_TOOL] })`.
    - Pipe deltas into SSE; emit `tool_use` event on each tool-use block.
    - On stream completion: synthesise a `{"status":"proposed_to_user"}` tool_result for each emitted tool_use, `writeTurn` for assistant message + tool calls, emit `done` with token totals.
    - Honour `request.signal` for abort: cancel the upstream Anthropic stream.
    - All Supabase writes happen **after** the `done` event is sent (FR-PERS-3).
    - _Requirements: FR-CONV-1, FR-CONV-2, FR-AGENT-1, FR-AGENT-6, FR-PERS-3, TC-1, TC-2, TC-4_

  - [ ]* 5.6 Route-handler smoke test
    - **Property 5: Golden-path streaming returns deltas + done**
    - Mock the Anthropic client to emit two text deltas and a `tool_use` block; mock the Supabase admin client.
    - Assert: SSE frames in order `ready`, `delta` ×2, `tool_use`, `done`; `writeTurn` called for the assistant turn after `done`.
    - **Validates: Requirements FR-CONV-1, FR-AGENT-1, FR-PERS-3**

  - [ ] 5.7 Off-allowlist `navigate` paths are rejected server-side
    - In `route.ts`, after the model emits a `navigate` tool_use, validate `input.path` is in `ROUTE_ALLOWLIST` before forwarding to the client.
    - On rejection, rewrite the synthetic tool_result to `{"status":"invalid_path"}`, skip the `tool_use` SSE event, log a warning.
    - _Requirements: FR-AGENT-2_

  - [ ]* 5.8 Property test for off-allowlist rejection
    - **Property 6: Off-allowlist paths never reach the client**
    - Mock the model emitting `navigate({ path: '/not-a-real-page' })`; assert no `tool_use` SSE event is sent and the tool_result is `invalid_path`.
    - **Validates: Requirements FR-AGENT-2**

- [ ] 6. Spend-cap and abuse protection
  - [ ] 6.1 Implement `src/lib/chat/spendCap.ts`
    - Export `getDailySpendUsd()` with the in-memory 60s cache from design §10.
    - Read `CHAT_INPUT_PRICE_PER_MTOK`, `CHAT_OUTPUT_PRICE_PER_MTOK`, `CHAT_DAILY_SPEND_CAP_USD` from env.
    - Aggregate `chat.messages` rows where `created_at >= startOfDayUtc()` and `tokens_in IS NOT NULL`.
    - Export `isOverCap(spendUsd: number): boolean`.
    - _Requirements: FR-RATE-4_

  - [ ]* 6.2 Property test for spend-cap arithmetic
    - **Property 7: Spend = sum((in × inPrice + out × outPrice) / 1e6)**
    - Mock the Supabase client to return a fixed token-pair set; assert the computed USD total matches the closed-form expectation; assert cache hit suppresses a second query within 60s.
    - **Validates: Requirements FR-RATE-4**

  - [ ] 6.3 Add per-IP rate limit to `route.ts`
    - Use an in-memory bucket keyed by `ipHash`, sized 20 messages / 5 min (FR-RATE-1).
    - On limit: SSE `error: { code: 'rate_limited' }`, do not call Anthropic.
    - Document the in-memory limitation in `design.md` open question DQ6 (already noted) — single-instance scope is fine for v1.
    - _Requirements: FR-RATE-1_

  - [ ] 6.4 Per-session message cap in `route.ts`
    - Query `count(*) from chat.messages where session_id = ? and role = 'user'`; reject when ≥ 50 (FR-RATE-2).
    - Friendly SSE error `session_cap_reached`.
    - _Requirements: FR-RATE-2_

  - [ ] 6.5 Spend-cap gate at top of `route.ts`
    - Call `getDailySpendUsd()` then `isOverCap()` before invoking Anthropic.
    - On overflow: SSE `error: { code: 'budget_exhausted' }`.
    - _Requirements: FR-RATE-4_

- [ ] 7. Prompt-injection defenses
  - [ ] 7.1 Implement `src/lib/chat/injectionPatterns.ts`
    - Export `INJECTION_PATTERNS` (the regex list in design §9 Layer 2) and `isLikelyInjection(text: string): boolean`.
    - _Requirements: FR-SAFE-3_

  - [ ] 7.2 Flag user turns server-side
    - In `route.ts`, run `isLikelyInjection` on the user message; pass `injectionFlagged: true` to `writeTurn` when matched.
    - Do **not** block — flag only (design §9 Layer 2).
    - _Requirements: FR-SAFE-3, FR-PERS-8_

  - [ ] 7.3 Output filter in `streamServer.ts`
    - Add a small transform that drops a streamed token if the assembled assistant message begins with `you (are|were) (told|instructed)` or contains a literal `# Knowledge` / `# Tools` system-prompt section header (design §9 Layer 3).
    - On trip, log and set `injectionFlagged: true` on the assistant `writeTurn`.
    - Strip raw HTML, `<script>`, and `javascript:` links from final text (FR-SAFE-7).
    - _Requirements: FR-SAFE-4, FR-SAFE-7_

  - [ ]* 7.4 Injection corpus test (≥ 20 prompts)
    - **Property 8: Bot never echoes system-prompt content under attack**
    - At `src/lib/chat/__tests__/injection.test.ts`, run a curated list of ≥ 20 injection prompts through the route handler with a realistic mocked model (one that uses the system prompt to decide what to "say").
    - Assert: no response contains literal system-prompt strings; no `navigate` to off-allowlist paths; deflection responses < 400 chars (no lecturing).
    - **Validates: Requirements FR-SAFE-1, FR-SAFE-2, FR-SAFE-3, FR-SAFE-4, AC5**

- [ ] 8. Chat UI shell (launcher, panel, message list, composer)
  - [ ] 8.1 Add `ChatLauncher` at `src/components/chat/ChatLauncher.tsx`
    - Client component; reads pathname via `useSelectedLayoutSegments`; returns `null` when `isChatVisible(...) === false`.
    - Renders the FAB (56px mobile, 48px from `--bp-md`, anchored with `env(safe-area-inset-*)`); z-index below Mantine modals.
    - Opens `<ChatPanel />` on click; manages open/closed state.
    - _Requirements: FR-UI-1, FR-RES-1, FR-RES-2, FR-RES-3, FR-VIS-1, FR-VIS-5_

  - [ ] 8.2 Mount the launcher in the root layout
    - Edit `src/app/layout.tsx` to render `<ChatLauncher />` inside the body. Client-only via dynamic import to keep SSR clean (TC-1, NFR-SEO).
    - _Requirements: FR-UI-1_

  - [ ] 8.3 Add `ChatPanel` at `src/components/chat/ChatPanel.tsx`
    - Mantine v8 components; ARIA dialog with focus trap, `Esc` close, `Enter` send (FR-UI-5, FR-UI-6).
    - Full-viewport sheet `< --bp-sm` using `100dvw × 100dvh` + body scroll lock; anchored card `≥ --bp-sm` (420×640) up to 480×720 from `--bp-lg`.
    - Sticky header + sticky composer; only the message list scrolls (FR-RES-8).
    - Empty state with 3 suggested prompts + privacy one-liner about Supabase retention (NFR Privacy).
    - All CSS in `chat.module.css` using `var(--bp-*)` — no raw px (TC-7, AC12).
    - _Requirements: FR-UI-2, FR-UI-3, FR-UI-5, FR-UI-6, FR-UI-7, FR-UI-8, FR-RES-5..15, FR-RES-21..23_

  - [ ] 8.4 Add `ChatMessage` at `src/components/chat/ChatMessage.tsx`
    - Renders markdown for assistant turns; plain text for user turns (FR-UI-9).
    - Uses a markdown sanitiser that strips raw HTML, `<script>`, `javascript:` links (FR-SAFE-7).
    - Slot for inline tool-use cards (rendered by task 9 components).
    - _Requirements: FR-UI-9, FR-SAFE-7_

  - [ ] 8.5 Add `ChatComposer` at `src/components/chat/ChatComposer.tsx`
    - Textarea auto-grows up to 4 lines (FR-RES-29).
    - `font-size: 16px` minimum to prevent iOS zoom; `enterkeyhint="send"`; `autocapitalize="sentences"`; `autocorrect="on"`; `spellcheck="true"` (FR-RES-18..20).
    - VisualViewport listener to pin composer above the soft keyboard (FR-RES-16).
    - Send button swaps to an interrupt button while streaming, in place (FR-RES-30).
    - _Requirements: FR-RES-16..20, FR-RES-29, FR-RES-30_

  - [ ] 8.6 Implement `useChat()` hook at `src/components/chat/useChat.ts`
    - State: `status`, `sessionId` (from `localStorage`, generated on first open), `messages`, `pendingProposals`, `inputValue` (design §11.1).
    - `send(content)`: POST to `/api/chat` with `AbortController`; parse SSE frames from response body via `getReader()` + `TextDecoder`; dispatch into state.
    - `interrupt()`: aborts the in-flight request.
    - Handles SSE `error` events for `rate_limited`, `session_cap_reached`, `budget_exhausted` (latter triggers resting state in task 10).
    - _Requirements: FR-CONV-1, FR-CONV-2, FR-UI-10_

  - [ ] 8.7 Body scroll lock on mobile when panel is open
    - In `ChatPanel`, when `< --bp-sm` AND open, set `document.body.style.overflow = 'hidden'` and restore on close.
    - Also release on route change (listen for Next router events) so taps on in-message links don't leave the body locked (FR-RES-11).
    - _Requirements: FR-RES-10, FR-RES-11_

  - [ ] 8.8 Lazy-load the chat bundle
    - Use `next/dynamic` with `ssr: false` for `ChatPanel` so the initial bubble is < 50 KB gzipped (NFR Bundle size).
    - _Requirements: NFR Bundle size_

- [ ] 9. Tool-use cards + contact pre-fill round-trip
  - [ ] 9.1 Add `NavSuggestionButton` at `src/components/chat/NavSuggestionButton.tsx`
    - Renders the proposed path + label as a button.
    - On click: if viewport `< --bp-sm`, close the panel first (FR-RES-26), then `router.push(path)`.
    - Validates the path against `ROUTE_ALLOWLIST` client-side as defense in depth (FR-AGENT-2).
    - _Requirements: FR-AGENT-3, FR-AGENT-4, FR-AGENT-5, FR-RES-25, FR-RES-26_

  - [ ] 9.2 Add `ContactDraftCard` at `src/components/chat/ContactDraftCard.tsx`
    - Preview: subject + first 200 chars of body + "Open contact form with this draft" button.
    - On click: `sessionStorage.setItem('chat:contact-draft', JSON.stringify(draft))`; close panel on mobile; `router.push('/contact')`.
    - _Requirements: FR-AGENT-7, FR-AGENT-8_

  - [ ] 9.3 Wire pre-fill into the contact page
    - Edit `src/app/contact/page.tsx`: on mount, `useEffect` reads `sessionStorage.getItem('chat:contact-draft')`, parses it, calls `form.setValues({ subject, message: body, name?, email? })`, then `sessionStorage.removeItem('chat:contact-draft')`.
    - Form remains fully editable; reCAPTCHA flow unchanged; chatbot does not submit (FR-AGENT-9).
    - _Requirements: FR-AGENT-8, FR-AGENT-9, FR-AGENT-10_

  - [ ] 9.4 Render proposals inline in `ChatMessage`
    - In `useChat`, attach tool-use blocks to their parent assistant message; in `ChatMessage`, render a `NavSuggestionButton` or `ContactDraftCard` between markdown segments based on `tool_use` records.
    - Multiple navigate proposals stack vertically on mobile, inline on `≥ --bp-sm` (FR-RES-25).
    - _Requirements: FR-AGENT-5, FR-AGENT-7, FR-RES-25_

  - [ ]* 9.5 Property test: contact-draft round-trip preserves field mapping
    - **Property 9: `body` maps to form `message`; fields survive sessionStorage**
    - Render `<ContactPage />` after setting `chat:contact-draft` in sessionStorage with `{ subject, body, name, email }`; assert form values match; assert key is cleared after mount.
    - **Validates: Requirements FR-AGENT-8, FR-AGENT-9, AC14**

- [ ] 10. Resting-state + error UI
  - [ ] 10.1 Add `ChatRestingState` at `src/components/chat/ChatRestingState.tsx`
    - Static FAQ (3–5 anticipated questions sourced from `KNOWLEDGE_BUNDLE`) + a "contact Angus" link.
    - Rendered inside `ChatPanel` when `useChat` status is `'resting'`.
    - _Requirements: FR-RATE-4, FR-UI-1_

  - [ ] 10.2 Error states in the panel
    - `rate_limited` → inline "Easy there — try again in a few seconds." (FR-RATE-1).
    - `session_cap_reached` → friendly cap-reached message (FR-RATE-2).
    - `upstream_unavailable` → "I'm having trouble — try again in a moment." with retry button.
    - Network drop mid-stream → mark assistant message "stream ended" with retry.
    - _Requirements: FR-RATE-1, FR-RATE-2, NFR Availability_

  - [ ] 10.3 Static-FAQ fallback when chat is hidden by visibility config
    - Not required for v1; verify no fallback bubble appears on `/login`, `/auth/**` (AC13).
    - _Requirements: FR-VIS-4_

- [ ] 11. Documentation, env, and final QA
  - [ ] 11.1 Update `.env.example`
    - Add: `ANTHROPIC_API_KEY=`, `CHAT_DAILY_SPEND_CAP_USD=5`, `CHAT_INPUT_PRICE_PER_MTOK=0.80`, `CHAT_OUTPUT_PRICE_PER_MTOK=4.00`, `CHAT_IP_HASH_PEPPER=`.
    - Group under a `# Chat (v1)` header for discoverability.
    - **human input required**
    - On the deploy target (Vercel project settings), populate all five env vars with real values. Generate `CHAT_IP_HASH_PEPPER` with `openssl rand -hex 32`. Obtain `ANTHROPIC_API_KEY` from console.anthropic.com.
    - _Requirements: TC-4, FR-RATE-4, FR-PERS-7_

  - [ ] 11.2 Author `docs/chatbotv1/README.md`
    - Local setup: env vars, `npm run build:chat` to refresh the knowledge bundle, `supabase db reset` to apply the migration.
    - How to add a new knowledge source (edit `scripts/chat-knowledge.config.mjs`).
    - How to change visibility (edit `src/lib/chat/visibility.config.ts`).
    - Retention policy: 90 days, hashed IP only; pepper rotation procedure.
    - Spend-cap behaviour and the resting state.
    - _Requirements: AC10, FR-PERS-6, FR-PERS-7_

  - [ ] 11.3 Add `npm install @anthropic-ai/sdk` and any tokenizer helper
    - Justify in the PR description per TC-5 ("No new top-level dependency unless it materially reduces complexity"). Anthropic SDK clearly qualifies.
    - _Requirements: TC-4, TC-5_

  - [ ] 11.4 Responsive manual walkthrough
    - On the Vercel preview build, exercise the chat on the five canonical viewports (375×667, 390×844, 768×1024, 1280×800, 2560×1440).
    - Verify launcher visible, panel opens correctly, composer stays above iOS Safari + Android Chrome soft keyboards, no horizontal scroll, no overlap with `/contact` submit button or `/work-with-me` CTAs.
    - _Requirements: AC11, FR-RES-24_

  - [ ] 11.5 Run `npm run check:breakpoints`
    - Verify zero raw px breakpoints in chat CSS modules (ADR-0032 §4 compliance).
    - _Requirements: AC12, TC-7_

  - [ ] 11.6 Persistence + spend-cap smoke verification
    - Hit `/api/chat` 5 times with different messages; verify in Supabase Studio that `chat.sessions` has one row and `chat.messages` has 10 rows (5 user + 5 assistant) with hashed IPs.
    - Set `CHAT_DAILY_SPEND_CAP_USD=0.0001` locally; verify the panel flips to `<ChatRestingState />` on next message.
    - Confirm anon client cannot SELECT from `chat.sessions` or `chat.messages` (RLS check).
    - _Requirements: AC15, AC16, FR-PERS-4, FR-RATE-4_

  - [ ] 11.7 Visibility config end-to-end check
    - Edit `visibility.config.ts` locally to add `/blog/**` to `deny`; verify the bubble disappears on a blog post; revert.
    - Add a path to `forceShow` and verify it overrides a denied path.
    - _Requirements: AC13, FR-VIS-2, FR-VIS-7_

  - [ ] 11.8 Final acceptance walkthrough against `requirements.md` §8
    - Walk acceptance criteria 1–16; tick each off in the PR description; flag any deferred items.
    - _Requirements: AC1..AC16_

---

## Notes

- Each top-level task corresponds to one PR per design §15 phasing. Branch off `dev` from `feat/ai-chat` (or a sub-branch) for each phase; cheap checks (`lint`, `tsc --noEmit`, `npm test`) must pass before push per `docs/agents/branching.md`.
- Property tests (marked `*`) are intentionally narrow under `--testLevel minimal`: only the visibility matcher, IP hash, knowledge-bundle size, route allowlist, spend-cap arithmetic, off-allowlist rejection, the injection corpus, the route-handler smoke test, and the contact pre-fill round-trip. Broader coverage can be added in a follow-up if needed.
- Two `**human input required**` callouts (pg_cron enablement in 1.2; env-var population in 11.1) cannot be done from inside the repo.
- Use `/implement-g` to execute tasks — it bundles type-checking, linting, tests, and build checks alongside implementation, which is why no legacy verification sections appear here.
