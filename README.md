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

Set runtime environment variables for the React app by configuring Heroku’s environment variables (`heroku config:set`). Use runtime injection for dynamic updates if required.

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

### Database Query Behavior

#### Important Note on db.query
The db.query function in this application is implemented in db.js using the PostgreSQL pg library.
The db.query function has been customized to return only the rows property of the query result.

### Example Usage

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