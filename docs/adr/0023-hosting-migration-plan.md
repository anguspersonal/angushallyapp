# 10_hosting_plan.md

## 🎯 Purpose

This document outlines the hosting and deployment plan for the **Next.js migration of angushallyapp**. It assumes that the migration work tracked in `09_migration_plan.md` has been **fully completed and verified locally**.

Hosting decisions will be made with the goals of:
- Ensuring reliability and developer experience
- Minimizing deployment complexity during transition
- Preserving backend functionality and existing auth/session logic

---

## ✅ Prerequisites

This plan is triggered **only after** the following criteria from `09_migration_plan.md` are complete:

- [ ] Frontend fully migrated to Next.js App Router (with TypeScript)
- [ ] Local development environment fully functional
- [ ] All dynamic and static routes tested
- [ ] Auth flow (OAuth + JWT) validated locally
- [ ] API calls from frontend to backend tested using Heroku endpoint

---

## 🌐 Hosting Options Overview

| Option                        | Frontend Hosting | Backend Hosting | Notes |
|------------------------------|------------------|------------------|-------|
| **A. All on Heroku**         | Heroku           | Heroku           | Keeps monolith together; more manual config for Next.js SSR |
| **B. Split: Vercel + Heroku**| Vercel           | Heroku           | Recommended; easier deployment for Next.js + keeps backend |
| **C. All on Vercel**         | Vercel           | Vercel API Routes or replatformed | Higher lift — requires migrating backend logic to API routes |

We will proceed with **Option B**: deploying the **frontend to Vercel** and **keeping the backend on Heroku**.

---

## 🔁 Deployment Flow (Option B)

### 🟢 Frontend (Next.js) → Vercel
- Connect GitHub repo to Vercel
- Set build command: `next build`
- Set output command: `next start`
- Set `NEXT_PUBLIC_API_URL=https://your-heroku-backend.herokuapp.com`
- Add any required OAuth vars (e.g., `GOOGLE_CLIENT_ID`)
- Enable automatic deploys from `main` branch

### 🟠 Backend (Node/Express) → Heroku
- Keep as-is (no immediate changes)
- Confirm:
  - CORS allows Vercel frontend
  - Environment variables are correct
  - API routes return expected responses

---

## 🔒 Security Notes
- Ensure CORS on Heroku backend includes `https://*.vercel.app`
- Review JWT cookie/session config for `SameSite`, `Secure`, and domain scope
- Add staging secrets/environment variables in Vercel + Heroku dashboards

---

## 🛠 Follow-Up Tasks

- [ ] Create `vercel.json` or update `next.config.js` for any rewrites or redirects
- [ ] Validate all routes (static + dynamic) after deploy
- [ ] Monitor logs for API errors or auth failures
- [ ] Update documentation to reflect deployment endpoints

---

## 🗂 Related Files

- `09_migration_plan.md` — must be completed before executing this plan
- `.env.local` (local dev)
- Vercel dashboard (for frontend)
- Heroku dashboard (for backend)

---

## 🧭 Phase Tracking

| Phase             | Status  |
|------------------|---------|
| Migration (09)   | ⬜ In Progress / ✅ Complete |
| Hosting (10)     | ⬜ Not Started |
| Integration Test | ⬜ Pending |
| Cleanup / Polish | ⬜ Pending |

