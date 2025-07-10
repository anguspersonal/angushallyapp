# 09_migration_tracker.md

# 🛠️ Next.js Migration Tracker

This is the **working task board** for the CRA → Next.js migration of `angushallyapp`.

---

## 🔄 In Progress

- [ ] `/contact` – Form page migration, reCAPTCHA integration
- [ ] Shared Layout (`layout.tsx`) – Port `Header`, `Footer`, and wrappers
- [ ] Auth Flow – Login page, Google OAuth redirect, SSR token sync
- [ ] Footer Conditional Logic – Replace `hideFooterRoutes` check with layout prop

---

### `/login` Migration

- [x] Copy CRA component to `next-ui/src/app/login/page.tsx`
- [x] Convert to TSX + use App Router
- [x] Test locally at `/next/login`
- [ ] (Optional) Test in production at `/next/login`
- [ ] Redirect `/login` to Next.js version in Express
- [ ] Remove CRA login page
- [ ] Move page from `/next/login` → `/login`

---

## ⏭️ Next Priority

- [ ] `/projects` – Static overview page of all projects
- [ ] `/blog` – Dynamic blog index page (list, tags, metadata)
- [ ] `/blog/:slug` – Blog post page with SSG (`generateStaticParams`)
- [ ] `/cv` – Static resume page

---

## 🔃 Backlog

### 🔥 High Complexity (SSR, State-heavy)
- [ ] `/projects/habit` – Complex UI state + goal tracking
- [ ] `/projects/strava` – Strava API integration, graph display
- [ ] `/projects/eat-safe-uk` – Google Maps + hygiene score SSR

### 🔁 PWA & Offline
- [ ] Migrate Service Worker – Switch to `next-pwa`, match CRA logic
- [ ] Offline Route Handling – Ensure fallback behavior and cache versioning

### 🧼 Cleanup
- [ ] Remove CRA App – Fully delete CRA when all routes are migrated
- [ ] Optimize Express Routing – Remove CRA proxy rules, compress static
- [ ] Final Lighthouse Audit – Performance & SEO pass
- [ ] Consolidate types + utils – Move final shared files to `/shared`

---

## ✅ Completed

See [`09_migration_log.md`](09_migration_log.md) for full changelog.

---

## 🧠 Notes

- When you complete an item:
  - [x] Check it off here
  - ➕ Add it to `09_migration_log.md` with date + details
- When moving a task:
  - Backlog → Next → In Progress → Log
- Review and update this tracker at the **start and end of each work session**

> Maintained per [01_guidance.md](01_guidance.md) documentation rules.
