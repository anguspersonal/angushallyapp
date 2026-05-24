---
source: /projects/strava
topic: Strava dashboard (active)
priority: normal
---

> Source: `/projects/strava` — **active**

A personal Strava dashboard. Pulls Angus's real running data via the
Strava API (a daily Vercel cron sync stores activities in Postgres) and
renders:

- personal-best progression (PRs)
- weekly run summary
- recent activities

When the page first loads it fetches the cached data and shows a loading
state; if the fetch fails, an error message is shown rather than empty
charts.

This is one of the few personal projects on the site that still
actively syncs with a third-party service.
