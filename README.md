# Angus Hally App

A personal website combining a blog, portfolio, and a playground for custom tools (habit tracker, Strava integration, FSA lookup, and more). Built as a full-stack monorepo using React, Node.js/Express, and PostgreSQL.

---

## 🔧 Features

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

## 🛠️ Getting Started

### Prerequisites

* **Node.js** v14+ and **npm** or **Yarn**
* **PostgreSQL** (local or remote)
* A Google Cloud project for OAuth credentials
* (Optional) Heroku CLI for deployment

### Environment Variables

Create a `.env` in `server/`:

```ini
# Database (development)
DEV_DB_HOST=localhost
DEV_DB_PORT=5432
DEV_DB_NAME=angushallyapp_dev
DEV_DB_USER=your_db_user
DEV_DB_PASSWORD=your_db_password

# Production (Heroku will set DATABASE_URL automatically)
# DATABASE_URL=postgres://user:pass@host:port/dbname

# Auth & APIs
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RECAPTCHA_SECRET_KEY=your_recaptcha_secret

# Strava & FSA (optional)
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
FSA_API_KEY=...
```

Create a `.env` in `react-ui/`:

```ini
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### Setup & Run

1. **Install dependencies**

   ```bash
   # In root
   npm install

   # Or individually
   cd server && npm install
   cd ../react-ui && npm install
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