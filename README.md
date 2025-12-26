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
└── next-ui
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

📚 **For detailed command reference, see [Startup Commands Guide](docs/11_startup_commands_guide.md)**

---

## 📚 Documentation

For comprehensive documentation, please refer to the following resources:

* [Documentation Guidance](docs/01_guidance.md) - How to navigate and update docs
* [Project Roadmap](docs/02_roadmap.md) - High-level vision and milestones
* [Change Log](docs/03_updates.md) - Detailed, chronological change log
* [Database Schema](docs/04_schema.md) - Human-readable DB schema overview
* [Database Guide](docs/05_database.md) - Database setup and migrations guide
* [Technical Debt](docs/06_tech_debt.md) - Known architectural and code-quality debt
* [Feature Backlog](docs/07_backlog.md) - Feature wishlist and prioritization

---

## 🔍 Testing

* **Backend**: `npm test`
* **Frontend**: `cd next-ui && npm test`

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