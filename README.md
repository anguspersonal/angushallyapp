# Angus Hally App

A personal website combining a blog, portfolio, and a playground for custom tools (habit tracker, Strava integration, FSA lookup, and more). Built as a full-stack monorepo using Next.js, Node.js/Express, and PostgreSQL.

## 🔍 Overview

* **Blog & Content**: Create, fetch, and display posts and authors with pagination and slugs.
* **Habit Tracking**: Log and visualize habits (e.g., alcohol, exercise) with per-user data isolation.
* **Strava Sync**: Fetch and store Strava activities.
* **FSA Hygiene Lookup**: Query UK Food Hygiene ratings by name & address.
* **Contact Form**: Secure submissions with Google reCAPTCHA; stores inquiries in CRM schema and sends email notifications.
* **Authentication**: Google OAuth 2.0 + JWT-based auth with role-based permissions.

---

## 🚀 Tech Stack

| Layer     | Technology                           |
| --------- | ------------------------------------ |
| Frontend  | Next.js 15, React 19, TypeScript    |
| Styling   | Mantine UI v7, responsive design    |
| Backend   | Node.js, Express                     |
| Database  | PostgreSQL, Knex.js (migrations)     |
| Auth      | Google OAuth 2.0, JWT                |
| Hosting   | Heroku                               |
| Utilities | Axios, Fuse.js, Dotenv, Rate-limiter |

---

## 📁 Repository Structure

```
├── server
│   ├── config/          # Environment & DB config
│   ├── migrations/      # Knex migration files
│   ├── routes/          # Express route handlers
│   ├── habit-api/       # Habit service logic
│   ├── strava-api/      # Strava sync logic
│   ├── fsa-data-sync/   # FSA lookup & matching
│   ├── utils/           # Helpers (email, logging)
│   ├── db.js            # DB pool & query utilities
│   ├── index.js         # Express server setup
│   └── knexfile.js      # Knex configs
│
└── web
    ├── public/         # Static assets
    ├── src/
    │   ├── app/        # Next.js App Router pages
    │   ├── components/ # Reusable UI components
    │   ├── utils/      # API client & auth helpers
    │   └── types/      # TypeScript type definitions
    └── package.json    # Frontend dependencies & scripts
```

---

## 🛠️ Quick Start

### Prerequisites

* **Node.js** v18+ and **npm**
* **PostgreSQL** (local or remote)
* A Google Cloud project for OAuth credentials

### Setup & Run

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Database migrations**

   ```bash
   npm run migrate
   ```

3. **Start development environment**

   ```bash
   # Full-stack development (Next.js + Express)
   npm run dev
   
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

4. **Access the application**

   ```bash
   # Main application
   http://localhost:5000
   
   # Next.js dev server (for development)
   http://localhost:3000
   ```

### 🎯 Quick Start Recommendations

**For most development work:**
```bash
npm run dev
```

**For backend-only work:**
```bash
npm run server
```

**For frontend component development:**
```bash
npm run client
```

📚 **For detailed command reference, see [Startup Commands Guide](docs/guides/startup-commands.md)**

---

## 📚 Documentation

Cross-cutting project docs live in [`docs/`](docs/README.md). Start there for the full index. Highlights:

* [`docs/README.md`](docs/README.md) — organisation principles, how to navigate and update docs.
* [`docs/vision.md`](docs/vision.md) — what we're building and why.
* [`docs/architecture.md`](docs/architecture.md) — how the system is structured at runtime and in the repo.
* [`docs/backlog.json`](docs/backlog.json) — fixes, tech debt, and future ideas.
* [`docs/implementation-plan.md`](docs/implementation-plan.md) — active modernization plan.
* [`docs/guides/`](docs/guides/README.md) — how-tos, runbooks, onboarding (database, startup commands, migration guides, testing, etc.).
* [`docs/adr/`](docs/adr/) — numbered architectural decision records and historical write-ups.
* [`CHANGELOG.md`](CHANGELOG.md) — chronological change log.

---

## 🔍 Testing

* **Vitest** (Next app): `npm test` — tests live under `src/` as `*.test.ts` / `*.test.tsx`; shared setup is [`src/test/setup.ts`](src/test/setup.ts).

---

## 📦 Deployment

### Heroku

1. **Push to Heroku**

   ```bash
   git push heroku main
   ```
2. **Automatic Migrations**: Ensure your `Procfile` includes a `release` process:

   ```Procfile
   web: npm start
   release: npx knex migrate:latest --knexfile server/knexfile.js
   ```
3. **Maintenance Mode (optional)**

   ```bash
   heroku maintenance:on
   heroku maintenance:off
   ```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Run tests locally
4. Submit a pull request with clear description

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.