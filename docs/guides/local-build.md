# Local Build

How to run `npm run build` locally without it failing on missing environment
variables.

## The error

If you clone the repo and run:

```bash
npm run build
```

without Supabase env vars set, the build fails during static prerendering of
routes that touch Supabase (today: `/contact`) with:

```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

This is annoying for first-time contributors and for autonomous agents that try
to verify a build before pushing. Tracked in
[issue #61](https://github.com/anguspersonal/angushallyapp/issues/61).

## The fix

Copy [`.env.example`](../../.env.example) to `.env.local` and fill in the
Supabase keys:

```bash
cp .env.example .env.local
```

At minimum, `next build` needs:

| Variable                                          | Notes |
| ------------------------------------------------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL`                        | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                   | Public anon/publishable key. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` is accepted as a fallback (code reads `ANON_KEY` first) |
| `SUPABASE_SECRET_KEY`                             | Server-only service-role key. `SUPABASE_SERVICE_ROLE_KEY` is accepted as a fallback (code reads `SECRET_KEY` first) |

`SUPABASE_URL` (no `NEXT_PUBLIC_` prefix) is also read as a fallback by the
admin client (`src/lib/supabase/admin.ts`).

### Where to get the values

Supabase dashboard → your project → Settings → API:

```
https://supabase.com/dashboard/project/<your-project-ref>/settings/api
```

`.env.example` is keys-only with placeholder values — real values are never
committed. Production/preview values live in the Vercel project dashboard, not
in this repo.

## Why not auto-skip prerender?

The cheapest fix is documentation, which is what this PR does. An option-2
follow-up — making routes that need Supabase fall back to dynamic rendering
when the env is missing — is on the backlog. If the friction persists or new
prerendered routes pick up Supabase dependencies, that's the next step.

## Related

- [`startup-commands.md`](./startup-commands.md) — full command matrix
- [`../adr/0010-env-config-management.md`](../adr/0010-env-config-management.md) — env-var conventions
- [`../../.env.example`](../../.env.example) — canonical list of env vars the app reads
