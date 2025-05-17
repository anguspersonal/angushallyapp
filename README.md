# Angus Hally Application

A full-stack web application that combines multiple features including habit tracking, FSA data integration, and location-based services. The application provides a modern, responsive interface with Material-UI components and integrates with various external services.

## Application Overview

### Core Features
- User authentication via Google OAuth 2.0
- Habit tracking with Strava integration
- Food Standards Agency (FSA) data integration
- Google Maps integration for location services
- Data visualization and analytics
- Responsive web interface
- Dark/light theme support

### Tech Stack
- **Frontend**: React with Material-UI
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: Google OAuth 2.0
- **External APIs**: 
  - Strava API for exercise tracking
  - FSA API for food hygiene data
  - Google Maps API for location services

## Project Structure

```
.
├── react-ui/                 # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   │   └── projects/   # Project-specific pages
│   │   │       ├── habit/  # Habit tracking feature
│   │   │       └── data-value-game/ # Data value game
│   │   └── utils/          # Utility functions
│   └── README.md           # Frontend documentation
│
├── server/                  # Backend Node.js application
│   ├── habit-api/          # Habit tracking API
│   │   └── README.md       # Habit API documentation
│   ├── strava-api/         # Strava integration
│   │   └── README.md       # Strava API documentation
│   ├── fsa-data-sync/      # FSA data synchronization
│   │   └── README.md       # FSA sync documentation
│   ├── middleware/         # Backend middleware
│   │   └── README.md       # Middleware documentation
│   └── migrations/         # Database migrations
│       └── README.md       # Database schema documentation
│
└── README.md               # This file
```

## Documentation Structure

Each major component of the application has its own README file that follows a consistent structure:

1. **Overview**: Brief description of the component
2. **Features**: List of key features
3. **Setup**: Installation and configuration
4. **Implementation**: Technical details and code examples
5. **API/Interface**: Available endpoints or interfaces
6. **Development**: Guidelines for development
7. **Testing**: Testing procedures
8. **Contributing**: Guidelines for contributions

### Module Documentation
- [Frontend Documentation](./react-ui/README.md)
- [Habit API Documentation](./server/habit-api/README.md)
- [Strava Integration Documentation](./server/strava-api/README.md)
- [FSA Data Sync Documentation](./server/fsa-data-sync/README.md)
- [Authentication Middleware Documentation](./server/middleware/README.md)
- [Database Documentation Overview](./documentation/README_DATABASE.md)

### Project Planning & Tracking
- [Development Updates & Roadmap](./documentation/DEVELOPMENT.md)
- [Technical Debt Log](./documentation/TECH_DEBT.md)

### Backend
- [API Documentation](./server/README.md)
- [Database Schema Documentation](./documentation/README_DATABASE.md)
- [Detailed DBML Schema](./documentation/schema.dbml)
- [DBML for dbdiagram.io](./documentation/schema-dbdiagram.dbml)
- [Visual Schema Diagram](./documentation/20250512_schema-angushallyapp.png)
- [Authentication Flow](./server/middleware/README.md)

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- WSL2 with Ubuntu (or similar Linux distribution)
- PostgreSQL (v12 or higher) installed *inside WSL*
- Google Cloud Platform account
- Strava API access (for habit tracking)
- FSA API access (for food hygiene data)

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../react-ui
   npm install
   cd .. # Return to project root
   ```

3. Set up PostgreSQL in WSL (if not already done):
   ```bash
   # Install PostgreSQL
   sudo apt update
   sudo apt install postgresql postgresql-contrib -y
   sudo service postgresql start

   # Create database and dedicated user
   sudo -u postgres psql -c "CREATE DATABASE angushallyapp_dev;"
   sudo -u postgres psql -c "CREATE USER angus_dev WITH PASSWORD 'YourPasswordHere';" # Choose a strong password
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE angushallyapp_dev TO angus_dev;"
   sudo -u postgres psql -c "ALTER USER angus_dev WITH SUPERUSER;" # For running migrations initially

   # Configure pg_hba.conf for md5 authentication (see PostgreSQL docs if needed)
   # Example: sudo nano /etc/postgresql/16/main/pg_hba.conf 
   # Ensure a line like 'local all all md5' exists
   # Then: sudo service postgresql restart
   ```

4. Set up environment variables:
   ```bash
   # Backend (.env file in server/ directory)
   cp server/.env.example server/.env 
   # Then edit server/.env with your WSL PostgreSQL details:
   # DEV_DB_HOST=127.0.0.1
   # DEV_DB_PORT=5432
   # DEV_DB_NAME=angushallyapp_dev
   # DEV_DB_USER=angus_dev
   # DEV_DB_PASSWORD=YourPasswordHere

   # Frontend (.env file in react-ui/ directory)
   cp react-ui/.env.example react-ui/.env
   # Then edit react-ui/.env with API keys etc.
   ```

5. Run database migrations (from the project root, or `cd server` first):
   ```bash
   cd server
   npx knex migrate:latest --env development
   cd ..
   ```

6. Start the development servers:
   ```bash
   # Start backend server (from server/ directory)
   cd server
   npm run dev # Or your usual start script
   # Keep this terminal open
   
   # Start frontend server (from react-ui/ directory, in a new terminal)
   cd ../react-ui
   npm start
   ```

## Development Guidelines

### Code Style
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful comments
- Use JSDoc comments for all functions, modules, and complex types, especially in backend JavaScript files (e.g., `/** @module myModule */`, `/** @param {string} myParam - Description */`, `/** @returns {Promise<Object[]>} */`).
- Follow component documentation guidelines

### Testing
- Write unit tests for new features
- Maintain test coverage
- Run tests before submitting PRs

### Documentation & Planning
- Keep README files up to date (see [Documentation Structure](#documentation-structure) and module-specific READMEs).
- Update [Development Updates](./documentation/DEVELOPMENT.md) with current status and next steps.
- Log new issues and track progress in the [Technical Debt Log](./documentation/TECH_DEBT.md).
- Document new features and include code examples in relevant READMEs.
- Update API documentation for any backend changes.

## Deployment

### Production Setup (Heroku)
1. **Database Backup**
   ```bash
   heroku pg:backups:capture --app YOUR_APP_NAME
   heroku pg:backups:download --app YOUR_APP_NAME
   ```

2. **Environment Variables**
   ```bash
   # Core Database
   DATABASE_URL          # Set by Heroku PostgreSQL addon
   NODE_ENV=production   # Set by Heroku

   # API Keys
   GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   STRAVA_CLIENT_ID
   STRAVA_CLIENT_SECRET
   ```

3. **Database Migrations**
   - Migrations run automatically during deployment via Heroku release phase
   - Configure in `Procfile`:
     ```
     web: node server/index.js
     release: NODE_ENV=production npx knex migrate:latest --knexfile server/knexfile.js
     ```

4. **Deployment Process**
   ```bash
   # Enable maintenance mode
   heroku maintenance:on --app YOUR_APP_NAME

   # Deploy
   git push heroku main

   # Monitor logs
   heroku logs --tail --app YOUR_APP_NAME

   # Disable maintenance mode after successful deployment
   heroku maintenance:off --app YOUR_APP_NAME
   ```

5. **Post-Deployment**
   - Verify database migrations
   - Test all affected functionality
   - Monitor application logs
   - Check database performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update documentation
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Updated Project README

```markdown
# React App with Node Backend on Heroku

This project integrates a Node.js backend (API server) with a [React frontend](https://github.com/facebookincubator/create-react-app), both hosted on Heroku. The backend handles API requests, database interactions, and serves the React app.

---

## Table of Contents
* 📐 [Design Points](#design-points)
* 🕺 [Demo](#demo)
* 🚀 [Deploy to Heroku](#deploy-to-heroku)
* ⤵️ [Switching from create-react-app-buildpack](#switching-from-create-react-app-buildpack)
* 🎛 [Runtime Config](#runtime-config)
* 💻 [Local Development](#local-development)
* 🗂 [FSA Data Sync Workflow](#fsa-data-sync-workflow)

---

## Design Points

The project combines two npm projects:
1. **Node API Server**:
   - Handles routing, API calls, and serves static files.
   - Deployed via [heroku/nodejs buildpack](https://devcenter.heroku.com/articles/nodejs-support).
2. **React UI**:
   - Created with [create-react-app](https://github.com/facebookincubator/create-react-app).
   - Built and served via the Node server.

The architecture supports:
- Node Cluster: [Node Cluster](https://nodejs.org/docs/latest-v8.x/api/cluster.html) implementation for utilizing multiple CPU cores.
- Modular Design: Separate directories for API and frontend code.
- Optimized Workflow: Supports automated jobs for data synchronization.

---

## Demo

Check the [live demo](https://cra-node.herokuapp.com/). Example API call from the React UI fetches data from a backend endpoint.

---

## Deploy to Heroku

To deploy the app:
```bash
git clone https://github.com/your-repo/your-app.git
cd your-app/
heroku create
git push heroku main
```

This deployment:
- Detects the Node buildpack and runs `npm install`.
- Builds the React app (`npm run build`) and serves it as static files.
- Launches the server (`npm start`).

---

## Switching from create-react-app-buildpack

If transitioning from [create-react-app-buildpack](https://github.com/mars/create-react-app-buildpack), follow the migration guide in the original README.

---

## Runtime Config

Set runtime environment variables for the React app by configuring Heroku's environment variables (`heroku config:set`). Use runtime injection for dynamic updates if required.

---

## Local Development

Run the backend and frontend locally:
1. **Node API Server**:
   ```bash
   npm install
   npm start
   ```
2. **React UI**:
   ```bash
   cd react-ui/
   npm install
   npm start
   ```

---

## FSA Data Sync Workflow

### Purpose
The backend synchronizes data from the Food Hygiene Rating Scheme (FHRS) API and Open Data files. It uses modular scripts for fetching, downloading, parsing, and storing establishment data.

### Workflow
1. **Fetch Local Authorities**:
   - Script: `fetchOpenDataUrls.js`.
   - Retrieves local authority metadata (ID, name, URL) and inserts it into the database.

2. **Download Establishment Data**:
   - Script: `downloadOpenData.js`.
   - Downloads XML files for each local authority and stores them in the `fsa-establishment-data` folder using a naming convention: `<LocalAuthorityID>-<FriendlyName>.xml`.

3. **Parse and Insert Establishment Data**:
   - Script: `parseAndInsert.js`.
   - Parses downloaded XML files and inserts establishment data into the database.

4. **Automate Updates**:
   - Script: `scheduleCronJob.js`.
   - Schedules the entire workflow to run nightly.

### XML File Management
- **Folder Structure**: XML files are stored in `fsa-data-sync/fsa-establishment-data/`.
- **Naming Convention**: `<LocalAuthorityID>-<FriendlyName>.xml` (e.g., `501-Barking-and-Dagenham.xml`).
- Existing files are overwritten during updates to maintain freshness.

---

## Achievements
- **Database Setup**:
  - Well-structured tables for local authorities and establishments.
  - Local Authority ID is the primary key for consistency.
- **Error Handling**:
  - Scripts manage database conflicts and API failures gracefully.
- **Separation of Concerns**:
  - Downloading, parsing, and insertion are modular for flexibility and error isolation.
```

---

### **Summary of Updates**
- Added the **FSA Data Sync Workflow** section.
- Explained XML file management (naming conventions, folder structure).
- Highlighted achievements and project improvements.
- Simplified instructions for deploying and running the app locally.

This updated README ensures the documentation reflects your project's current state and provides clear instructions for contributors.



--- 

### **Database Query Behavior**

#### **Important Note on db.query**
The db.query function in this application is implemented in db.js using the PostgreSQL pg library.
The db.query function has been customized to return only the rows property of the query result.

### **Example Usage**

// Correct Usage
const response = await db.query("SELECT * FROM habit.drink_catalog;");
console.log(response); // Logs the array of rows directly

// Incorrect Usage
const response = await db.query("SELECT * FROM habit.drink_catalog;");
console.log(response.rows); // ❌ This will cause an error because `.rows` is not available

Why This Matters:
This approach simplifies the application code by eliminating the need to access the `.rows` property explicitly, reducing boilerplate code. 
It also ensures consistency across all database queries, making the codebase easier to maintain and less prone to errors caused by incorrect property access.
This simplifies the application code and ensures consistency across all database queries.
You can directly use the response from db.query as an array of rows.

## Database Architecture

The application uses PostgreSQL with four distinct domains, each serving a specific purpose:

### Identity Domain (Core User Management)
- Manages user authentication and authorization
- Handles user roles and permissions
- Tracks access requests and approvals
- Located in the `identity` schema
- Primary user table with OAuth support
- Role-based access control (RBAC)

### CRM Domain
- Manages customer inquiries and interactions
- Handles contact form submissions with captcha
- Tracks inquiry status and assignments
- Links inquiries to authenticated users
- Located in the `crm` schema
- Supports multiple inquiry statuses
- Automated assignment workflow

### Content Domain (Blog & Authors)
- Manages blog content and authors
- Links authors to identity system
- Handles post metadata and content
- Supports markdown and rich text
- Located in the `content` schema
- UUID-based relationships
- Timestamp tracking

### FSA Data Domain
- Stores food hygiene ratings data
- Manages establishment information
- Tracks local authority data
- Handles scheduled data synchronization
- Located in the `fsa` schema
- Automated data updates
- Geolocation support

### Habit Domain
- Manages user habit tracking
- Stores exercise and activity data
- Handles Strava integration
- Links to identity system for user data
- Located in the `habit` schema
- Activity type support
- Measurement tracking

Each domain is isolated with its own schema and tables, providing clear separation of concerns and data integrity. All user-related data is linked to the central identity system through UUID-based foreign keys.

For detailed schema information:
- [Database Schema Documentation](./documentation/README_DATABASE.md)
- [Detailed DBML Schema](./documentation/schema.dbml)
- [Visual Schema Diagram](./documentation/20250512_schema-angushallyapp.png)

## Application Architecture

### Overview
```
[Client SPA: React] 
  ↕ (HTTPS, JWT)
[Node/Express API Gateway]
  ├─ /auth          → login, callback, token issue
  ├─ /identity      → request access, admin approval
  ├─ /crm           → inquiries, customer CRM
  ├─ /fsa           → food-safety data
  ├─ /habit         → personalised habit logs
  └─ /public        → blog, posts, authors
```

### Authentication & Authorization

#### Authentication Service (/auth)
- Issues JWT on successful login from any method
- Rejects if users.is_active = false
- Supports "Remember me" functionality
- Handles token refresh and expiration

#### Authorization Middleware
- Parses JWT and loads user data
- Enforces role-based access control (RBAC)
- Protects routes based on user roles
- Handles token validation and refresh

#### Data Isolation
- Every domain API filters on user ID for private data
- Public data exposed based on user roles
- Guest access for public endpoints
- Secure data access patterns

### API Domains

#### Auth Domain
- Handles user authentication
- Manages JWT tokens
- Processes login/logout
- Handles token refresh

#### Identity Domain
- Manages user roles and permissions
- Handles access requests
- Processes admin approvals
- Maintains user status

#### CRM Domain
- Manages customer inquiries
- Tracks customer interactions
- Handles contact form submissions
- Maintains customer data

#### FSA Domain
- Manages food safety data
- Handles establishment information
- Processes ratings data
- Manages data synchronization

#### Habit Domain
- Manages user habit tracking
- Handles exercise data
- Processes Strava integration
- Maintains user-specific logs

#### Public Domain
- Manages blog content
- Handles public inquiries
- Maintains author information
- Processes public-facing data
