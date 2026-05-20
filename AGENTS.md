# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a single-package Next.js 15 app at the repo root (App Router, React 19, Mantine UI, Supabase). Previously a monorepo with `web/` and `server/` workspaces; the `web/` workspace was flattened into the repo root in commit `a63c2d0` ("refactor: flatten web/ into repo root"). There is no `server/` workspace anymore — it's a single Next app.

Node version: **20.x** (see `.nvmrc`). Package manager: **npm**.

### Quick reference

| Task | Command | Notes |
|------|---------|-------|
| Install deps | `npm install` | From repo root |
| Dev server | `npm run dev` | Starts Next.js on `:3000` |
| Lint | `npm run lint` | Wraps `next lint`; warnings only, no blocking errors expected |
| Tests | `npm test` | Vitest + jsdom; runs once and exits (`vitest run`) |
| Tests (watch) | `npm run test:watch` | Vitest in watch mode |
| Build | `npm run build` | Runs `next build` |
| Type-check | `npx tsc --noEmit` | Run separately — see Gotchas re. build-time TS |

### Environment variables

- The Next.js app reads a `.env.local` at the repo root. Minimum for boot: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (or the legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Placeholder values are fine for local dev.
- The full env template is in `.env.example` at the repo root.
- Supabase clients gracefully return `null` when env vars are missing, so the app boots without a real Supabase instance.
- **reCAPTCHA**: The contact form (`/contact`) requires both client and server keys. For local dev, use [Google's test keys](https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha): `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI` and `RECAPTCHA_SECRET_KEY=6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`. The test site key renders a widget that auto-passes; the test secret key accepts any token.
- **Email (SMTP)**: Contact form submission will pass reCAPTCHA but fail at the email step without SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` or Google OAuth2 tokens). This is expected in dev without mail config.

### Gotchas

- **TypeScript and ESLint are skipped at build time.** `next.config.mjs` sets `typescript: { ignoreBuildErrors: true }` and `eslint: { ignoreDuringBuilds: true }`. These are **known tech-debt** (the `typescript` flag is annotated "Keep while Mantine + @types/react alignment is fragile"), not a green light to push broken types. Run `npx tsc --noEmit` and `npm run lint` separately during development; only flag *new* errors introduced by your changes.
- React is hoisted to the repo root `node_modules/`; `vitest.config.ts` explicitly aliases `react` and `react-dom` to the root to avoid duplicate React errors.
- If port 3000 is busy, run `npm run clean:ports` (uses `scripts/clean-ports.js`) before `npm run dev`.
- Service worker (`next-pwa`) is disabled in dev and enabled in production builds — see `next.config.mjs`.

### Documentation

- Architecture: `docs/architecture.md`
- Startup commands: `docs/guides/startup-commands.md`
- Database schema: `docs/guides/database-schema.md`
- ADRs: `docs/adr/` (start with `docs/adr/0001-tech-stack.md`)
- Backlog (small items): `docs/backlog.json`
