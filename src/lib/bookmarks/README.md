# Bookmarks ecosystem — colocated module (stub)

Legacy implementation: `server/bookmark-api/*`, `server/routes/bookmarkRoute.js`, `raindropRoute.js`, `f5CertaintyRoute.js`, `instagramIntelligenceRoute.js`.

**Vercel:** Route Handlers under `src/app/api/bookmarks`, `raindrop`, `f5`, `instagram-intelligence` return **503** with `BOOKMARKS_CLUSTER_NOT_PORTED` until this domain is ported to Supabase + colocated `lib/bookmarks/`.

UI: `src/app/projects/bookmarks/` (currently deprecated in `projectList`).
