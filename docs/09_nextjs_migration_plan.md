````md
# 09_migration_plan.md

# 🚀 Next.js Migration Plan (High-Level)

This document outlines the **strategic overview** of migrating `angushallyapp` from Create React App to Next.js.

---

## 🎯 Goals

- ✅ Migrate away from deprecated CRA tooling
- ✅ Enable **server-side rendering (SSR)** for SEO and performance
- ✅ Standardize with **TypeScript + Mantine v7**
- ✅ Preserve **authentication, layout, and PWA functionality**
- ✅ Improve build speed, maintainability, and scalability

---

## 🛠️ Strategy

### 🧩 Architecture
- **Dual-app architecture**: CRA and Next.js run in parallel
- **Express proxy**: Serves migrated Next.js pages via `/next/*` route
- **Component pattern**: Copy → Convert → Test → Replace route

### ⚙️ Migration Pattern
1. Copy component/page from CRA → `next-ui/src/app/`
2. Convert JSX → TSX with type safety
3. Replace React Router with Next.js `Link` / `app router`
4. Move static assets and CSS modules
5. Test at `/next/[route]`
6. Add Express proxy rule when stable

---

## 🧭 Route Migration Process

Each route follows a consistent, zero-downtime migration path:

1. **Copy** CRA page/component into `next-ui/src/app/[route]/page.tsx`
2. **Convert** JSX → TSX, adapt imports and routing to Next.js
3. **Test Locally** at `/next/[route]` via Express proxy
4. **Test in Production (Optional)** by exposing `/next/[route]` safely
5. **Swap Routes**:
   - If stable, redirect canonical path (e.g. `/login`) to Next.js version
   - Remove CRA route once Next.js is confirmed
6. **Finalize** by moving route to `/[route]` in Next.js
7. **Repeat** for next component or route

This process ensures full SSR, styling, and functionality validation without risking production availability.

---

### ✅ Reusable Checklist Template

```md
### `/[route]` Migration

- [ ] Copy CRA component to `next-ui/src/app/[route]/page.tsx`
- [ ] Convert to TSX + use App Router
- [ ] Test locally at `/next/[route]`
- [ ] (Optional) Test in production at `/next/[route]`
- [ ] Redirect `/[route]` to Next.js version
- [ ] Remove CRA route
- [ ] Move page from `/next/[route]` → `/[route]`
````

Use this checklist format in `09_migration_tracker.md` to track individual route progress.

---

## 📦 Phases Overview

| Phase                    | Status         | Summary                                       |
| ------------------------ | -------------- | --------------------------------------------- |
| 1. Foundation            | ✅ Complete     | Next.js setup, Mantine v7, TS config          |
| 2. Shared Infrastructure | ✅ Complete     | AuthProvider, API client, shared types        |
| 3. Core Pages            | 🔄 In Progress | Home, About, Blog, Contact                    |
| 4. Layout + Auth         | ⏳ Pending      | Shared layout, login/logout, route protection |
| 5. Interactive Projects  | ⏳ Pending      | Habit, Strava, Eat Safe UK                    |
| 6. PWA Migration         | ⏳ Pending      | Service worker, offline caching (`next-pwa`)  |
| 7. Cleanup & Removal     | ⏳ Pending      | Remove CRA, optimize build and deploy flow    |

---

## ⚠️ Known Risks & Mitigations

| Risk                    | Mitigation                                |
| ----------------------- | ----------------------------------------- |
| OAuth redirect mismatch | Preconfigure correct redirect URIs        |
| SSR hydration issues    | Use dynamic imports for client-only logic |
| PWA SW cache mismatch   | Use `next-pwa` + versioned cache strategy |
| TypeScript friction     | Use shared types, strict mode, `ts-check` |
| Express MIME mismatch   | Set cache-busting headers in dev (done)   |

---

## 🔁 Related Working Docs

* [Migration Tracker](09_migration_tracker.md) – ✅ Active tasks, backlog, priorities
* [Migration Log](09_migration_log.md) – 📜 All completed migration work
* [Guidance](01_guidance.md) – 📚 How to maintain these docs

---

## 📋 Change History

| Date       | Change                                           |
| ---------- | ------------------------------------------------ |
| 2025-07-07 | Initial extraction from full migration file      |
| 2025-07-07 | Added layout, PWA, API & testing refinements     |
| 2025-07-09 | Added route-by-route iterative migration process |


```
```
