# FSA Data Sync Workflow

This folder contains scripts and utilities for synchronizing data from the Food Hygiene Rating Scheme (FHRS) API and Open Data files into a PostgreSQL database. The workflow has been optimized to use JSON data for establishment records, avoiding the need for XML parsing.

**Last Updated:** January 3, 2025

## **Updated Workflow**

### **1. Fetch Local Authorities and Open Data File URLs**
- **Script**: `fetchOpenDataUrls.js`
- **Objective**: Retrieve metadata about local authorities and their Open Data file URLs.
- **Output**: Inserts data into the `local_authorities` table in the database.

### **2. Download Open Data Files**
- **Script**: `downloadOpenData.js`
- **Objective**: Download JSON files from the URLs obtained in step 1.
- **Output**: JSON files are saved or directly processed for the next step.

### **3. Store Establishment Data in Database**
- **Script**: `updateDatabase.js`
- **Objective**: Parse JSON files and insert establishment data into the database.
- **Details**:
  - Key fields (e.g., `name`, `address`, `rating`) are stored in structured columns.
  - The entire JSON response is stored in a `JSONB` column for flexibility.

### **4. Automate Nightly Updates**
- **Script**: `scheduleCronJob.js`
- **Objective**: Automate the entire workflow to run nightly.
- **Details**:
  - Fetch updated Open Data files based on `extractDate`.
  - Ensure the database remains up-to-date.

---

## **Updated Folder Structure**
```
/fsa-data-sync
├── fetchOpenDataUrls.js    # Fetch authority names and Open Data file URLs.
├── downloadOpenData.js     # Download JSON files from the fetched URLs.
├── updateDatabase.js       # Insert parsed establishment data into the database.
├── scheduleCronJob.js      # Schedule nightly updates.
└── README.md               # This README file.
```

---

## **Removed Files**
- **`parseXML.js`**:
  - **Reason for Removal**: The workflow now uses JSON data directly from the Open Data files, eliminating the need for XML parsing.
  - **Impact**: Simplifies the workflow and reduces dependencies.

---

## **Database Schema Overview**

### **`local_authorities` Table**
Stores metadata about local authorities and their Open Data file URLs.
```sql
CREATE TABLE local_authorities (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE,          -- Authority name
    url TEXT,                  -- Open Data file URL
    metadata JSONB,            -- Full response from /Authorities
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **`establishments` Table**
Stores establishment data parsed from the Open Data JSON files.
```sql
CREATE TABLE establishments (
    id SERIAL PRIMARY KEY,
    name TEXT,                -- Establishment name
    address TEXT,             -- Establishment address
    local_authority TEXT,     -- Associated local authority
    rating TEXT,              -- Hygiene rating
    metadata JSONB,           -- Full JSON response
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **Next Steps**
- Test each script independently to ensure proper functionality.
- Set up the cron job to automate the workflow.
