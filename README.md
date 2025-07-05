# Angus Hally App

A personal website combining a blog, portfolio, and a playground for custom tools (habit tracker, Strava integration, FSA lookup, and more). Built as a full-stack monorepo using React, Node.js/Express, and PostgreSQL.

## 🔥 PRIORITY ITEMS (Next Session - 2025-01-27)

**HIGH PRIORITY:**
1. **Create Centralized Frontend Test Centre**
   - Frontend testing infrastructure is currently fragmented/missing
   - Need centralized location: `/react-ui/tests/` similar to `/server/tests/`
   - Install missing dependencies: `@testing-library/react`, etc.
   - Standardize testing patterns across frontend and backend

---

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
| Frontend  | React, Material-UI, React Router     |
| Styling   | Material-UI, responsive design       |
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
└── react-ui
    ├── public/         # Static assets
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Feature-specific pages
    │   ├── utils/      # API client & auth helpers
    │   └── App.js      # Root React component
    └── package.json    # Frontend dependencies & scripts
```

---

## 🛠️ Quick Start

### Prerequisites

* **Node.js** v14+ and **npm** or **Yarn**
* **PostgreSQL** (local or remote)
* A Google Cloud project for OAuth credentials

### Setup & Run

1. **Install dependencies**

   ```bash
   # In root
   npm install
   ```

2. **Database migrations**

   ```bash
   cd server
   npx knex migrate:latest --env development
   ```

3. **Start backend**

   ```bash
   cd server
   npm start        # or NODE_ENV=development npm run dev
   ```

4. **Start frontend**

   ```bash
   cd react-ui
   npm start
   ```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📚 Documentation

For comprehensive documentation, please refer to the following resources:

* [Documentation Guidance](documentation/01_guidance.md) - How to navigate and update docs
* [Project Roadmap](documentation/02_roadmap.md) - High-level vision and milestones
* [Change Log](documentation/03_updates.md) - Detailed, chronological change log
* [Database Schema](documentation/04_schema.md) - Human-readable DB schema overview
* [Database Guide](documentation/05_database.md) - Database setup and migrations guide
* [Technical Debt](documentation/06_tech_debt.md) - Known architectural and code-quality debt
* [Feature Backlog](documentation/07_backlog.md) - Feature wishlist and prioritization

---

## 🔍 Testing

* **Backend**: `cd server && npm test`
* **Frontend**: `cd react-ui && npm test`

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