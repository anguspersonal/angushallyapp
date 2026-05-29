# Analytics (PostHog, consent-gated)

Issue #141 · PRD #123 · Feature E (analytics) · Foundation

This is the angushallyapp analytics layer: PostHog, stood up **consent-gated**
behind the D0 consent platform (#140) and tagged per-surface via the surface
registry (#125). It is designed to ship **keyless today** and light up the
instant the owner provisions a key — no code change.

## Owner action (required to go live)

Analytics is inert until **both** of these are true:

1. **A PostHog project + key exists.** Create a dedicated PostHog project for
   **angushallyapp** (its OWN project — not the HeyLina one), then set
   `NEXT_PUBLIC_POSTHOG_KEY` (and optionally `NEXT_PUBLIC_POSTHOG_HOST`) in
   `.env.local` for local dev and on the **Vercel** project for preview/prod.
2. **The visitor has granted the Analytics consent category.** Until then —
   and after a revoke — PostHog is never initialised and nothing is captured.

Without a key the whole layer is a deliberate **no-op**: no posthog-js is loaded,
no network calls are made. This is intentional so the feature can merge and sit
dormant until the owner is ready.

## Environment variables

| Var | Required? | Default | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | To go live | — | Project API key (`phc_...`). Absent ⇒ analytics no-ops. |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | `https://eu.i.posthog.com` | Ingestion host. Use `https://us.i.posthog.com` for US cloud, or a reverse-proxy host. |

Both are `NEXT_PUBLIC_` (client-readable) — the project API key is not a secret;
it only allows ingestion, governed by PostHog project settings.

## How it works

- **Config** (`src/lib/analytics/config.ts`) — pure reader of the env key/host.
  The key is the load-bearing toggle.
- **Client** (`src/lib/analytics/client.ts`) — the single wrapper around
  posthog-js. `posthog-js` is imported **dynamically** so it only enters the
  bundle when analytics actually initialises. Enforces the guardrails:
  - `initAnalytics()` no-ops without a key or on the server.
  - `captureEvent()` / `capturePageview()` no-op until initialised.
  - `shutdownAnalytics()` resets PostHog and drops the instance so a consent
    revoke stops capture.
- **Consent binding + pageviews** (`src/providers/AnalyticsProvider.tsx`) — the
  ONLY place that calls init/teardown. It reads `useConsentGate('analytics')`:
  grant → init, revoke → shutdown. It captures an App Router `$pageview` on every
  `usePathname()` change (posthog's own `capture_pageview` is disabled so SPA
  navigations aren't missed). Mounted once in `ClientLayout`, inside
  `ConsentProvider`.
- **Typed events** (`src/lib/analytics/events.ts`) — a `noun_verb` event
  catalogue mapping event name → typed property bag, so call sites are
  type-checked and event names stay consistent.
- **Per-persona / source attribution** (`src/lib/analytics/attribution.ts`) —
  every event is tagged with the route-level **surface** resolved from the
  pathname via `resolveSurface` (#125): `surface`, `surface_kind`, `pathname`.
  Unmatched paths fall back to `surface: 'site'`. This is what lets analytics be
  sliced per persona / source. The B1 persona shells (#129/#130/#131) consume
  this attribution.

## Capturing events

From a client component, use the hook — it auto-tags the current surface:

```tsx
'use client';
import { useAnalytics } from '@/lib/analytics';

function HireMeButton() {
  const { capture } = useAnalytics();
  return <button onClick={() => capture('cta_clicked', { cta: 'hire-me' })}>Hire me</button>;
}
```

Add a new event by extending `AnalyticsEventMap` in `events.ts`; the property
shape is then enforced at every call site.

## Consent categorisation

PostHog sits under the **Analytics** consent category — see
[`docs/consent-categorisation.md`](../consent-categorisation.md). It is never
loaded until that category is consented, and revoking it stops capture.
