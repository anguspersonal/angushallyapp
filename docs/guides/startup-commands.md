Below is the canonical startup commands guide (previously `docs/11_startup_commands_guide.md`).
It removes all `react-ui` references, simplifies the command matrix, and folds in the newer build/deploy advice we just discussed.

````markdown
# Startup Commands Guide (Next UI + Express Server)

This guide is the single source of truth for **starting, building, and deploying** the
angushallyapp mono-repo, which now consists of:

| Folder | Purpose | Tech |
|--------|---------|------|
| **root** | Workspace manager, shared deps, build & deploy scripts | npm workspaces |
| **web/** | Main frontend (Next.js 15 + TypeScript) | SSR/SSG hybrid |
| **server/** | Backend API & auth | Express + PostgreSQL |

---

## 🚀 Quick-Reference Table

| Command (run from repo root) | What it starts | Ports | Typical use |
|------------------------------|----------------|-------|-------------|
| `npm run dev`               | **Server + Next UI** (concurrently) | 5000, 3000 | Daily development |
| `npm run server`            | Express API only (nodemon) | 5000 | Backend focus |
| `npm run client`            | Next dev server only | 3000 | Frontend focus |
| `npm run build`             | Production build (sync env → Next build) | — | Local prod test |
| `npm start`                 | **Server** in prod mode (serves built Next) | 5000 | Local prod run / Heroku dyno |
| `npm run compress-images`   | Auto-compress `/web/public` images | — | Keep slug small |

---

## 📋 Detailed Breakdown

### 1. Full-stack dev (`npm run dev`)

```bash
npm run dev
````

* Runs `scripts/sync-env:dev` 📥 → writes `web/.env`.
* Checks ports 5000 & 3000 (interactive kill if occupied).
* Starts:

  * `nodemon server/index.js` → [http://localhost:5000](http://localhost:5000)
  * `next dev` → [http://localhost:3000](http://localhost:3000)
    (UI fetches `/api/*` from port 5000)

### 2. Backend-only (`npm run server`)

*Hot-reloads Express. Perfect for DB work or API tests.*

### 3. Frontend-only (`npm run client`)

*Runs `next dev`; fastest feedback when you don’t need the API.*

---

## 🎯 Recommended Workflows

| Scenario                  | Steps                                                   |
| ------------------------- | ------------------------------------------------------- |
| **Daily dev**             | `git pull` → `npm install` (workspaces) → `npm run dev` |
| **Debug API**             | `npm run server` (separate tab)                         |
| **UI feature**            | `npm run client` only (+ tests)                         |
| **Pre-deploy smoke test** | `npm run build` → `NODE_ENV=production npm start`       |
| **Image hygiene**         | `npm run compress-images` after adding big JPG/PNG      |

When you **upgrade major deps** (e.g. React 19), wipe modules:

```bash
rm -rf node_modules web/node_modules package-lock.json
npm install
```

---

## 🛠️ Build & Deploy (Heroku)

### Local production smoke-test

```bash
npm run sync-env:prod           # writes web/.env
npm run build                   # Next build into web/.next
NODE_ENV=production npm start   # Express + SSR on :5000

### Deploy to Heroku

```bash
git add -u
git commit -m "feat: <your message>"
git push origin main            # keep GitHub in sync
git push heroku main            # trigger Heroku build

```

Heroku build flow:

1. **heroku-prebuild**
   `npm ci --omit=dev --workspaces --include-workspace-root`
2. **heroku-postbuild**
   `npm --workspaces prune --omit=dev && npm run build --workspace web`
3. Dyno runs `npm start` (Express + SSR)

Purge stale cache if the slug balloons:

```bash
heroku builds:cache:purge -a angushallyapp
```

---

## 🔄 Port Matrix

| Service         | Default Port |
| --------------- | ------------ |
| Express API     | **5000**     |
| Next dev server | **3000**     |

(Start scripts auto-check and offer to kill any process that blocks these ports.)

---

## 🐘 Database Commands

```bash
# Latest migrations
npm run migrate

# Roll back one
npm run migrate:rollback

# Status
npm run migrate:status

# Create new
npm run migrate:make
```

---

## 🧪 Testing

```bash
npm test           # Jest (server)
npm run lint --workspace web   # ESLint (frontend)
npx tsc --noEmit   # TypeScript check
```

---

## 🧹 Cleanup & Reset Commands  *(NEW)*

| Command | Scope | What it does |
|---------|-------|--------------|
| `npm run clean:node` | root | Deletes every `node_modules/**`, wipes `package-lock.json`, then runs `npm ci` with workspaces. |
| `npm run clean:next` | root | Removes `.next/` build & cache, then rebuilds UI. |
| `npm run clean:public` | root | Moves `*.original.*` images to `assets/archive` and deletes `*:Zone.Identifier` files in `web/public`. |
| `npm run clean:ports [<port> …]` | root | Kills any process on ports 5000 & 3000 (plus optional extra ports). |
| `npm run clean:heroku-cache` | root | Purges Heroku's build cache. |

---

## 🚑 Troubleshooting Cheatsheet

| Problem                  | Fix                                                                     |
| ------------------------ | ----------------------------------------------------------------------- |
| **Port conflict**        | `npm run kill-ports` or `lsof -i :3000` / `kill <PID>`                  |
| **Env not syncing**      | `npm run sync-env:dev`                                                  |
| **Node tree corruption** | Delete `node_modules` + `package-lock.json` → `npm install`             |
| **Slug > 300 MB**        | Run `npm run compress-images`; review `.slugignore`; purge Heroku cache |
| **Next build errors**    | `node scripts/fix-nextjs-build-errors.js --clean-deps`                  |
| **DB reset (dev only)**  | `npm run migrate:rollback --all && npm run migrate`                     |

---

## 🛡️ CI / Size Gates (suggested)

* Fail PR if any image in `web/public` > 500 kB.
* Fail PR if production `du -s` inside slug > 320 MB.

---

Made with ❤️ to keep development smooth and Heroku deployments tiny.

```
::contentReference[oaicite:0]{index=0}
```
