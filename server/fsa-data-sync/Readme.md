### **Updated README: FSA Data Sync Workflow**

This folder contains scripts and utilities for synchronizing data from the Food Hygiene Rating Scheme (FHRS) API and Open Data files into a PostgreSQL database. The workflow has been modularized to separate downloading, parsing, and insertion of data to enhance scalability and maintainability.

**Last Updated:** January 5, 2025

---

## **Workflow**

### **1. Fetch Local Authorities and Open Data File URLs**
- **Script**: `fetchOpenDataUrls.js`
- **Objective**: Retrieve metadata about local authorities and their Open Data file URLs.
- **Output**: Inserts data into the `local_authorities` table in the database, capturing:
  - `local_authority_id` (Primary Key)
  - `name`
  - `friendly_name`
  - `url`
  - `metadata`

### **2. Download Open Data Files**
- **Script**: `downloadOpenData.js`
- **Objective**: Download XML files from the URLs obtained in step 1 and store them locally.
- **Output**: XML files are stored in the `fsa-establishment-data` directory, with naming conventions:
  - Format: `<local_authority_id><friendly_name>.xml`
  - Example: `501barking-and-dagenham.xml`

### **3. Parse and Insert Establishment Data**
- **Script**: `parseAndInsertData.js`
- **Objective**: Parse the downloaded XML files and insert establishment data into the database.
- **Details**:
  - Key fields (e.g., `FHRSID`, `BusinessName`, `Address`) are stored in structured columns.
  - The entire JSON response is stored in a `JSONB` column for flexibility.

### **4. Automate Nightly Updates**
- **Script**: `scheduleCronJob.js`
- **Objective**: Automate the entire workflow to run nightly.
- **Details**:
  - Fetch updated Open Data files based on `extractDate`.
  - Parse and insert new establishment data.
  - Ensure the database remains up-to-date.

---

## **Folder Structure**

```
/fsa-data-sync
├── fetchOpenDataUrls.js        # Fetch authority names and Open Data file URLs.
├── downloadOpenData.js         # Download XML files from the fetched URLs.
├── parseAndInsertData.js       # Parse XML files and insert establishment data into the database.
├── scheduleCronJob.js          # Schedule nightly updates.
├── fsa-establishment-data/     # Directory to store downloaded XML files.
└── README.md                   # This README file.
```

---

## **Purpose of Modularization**

### **Separation of Downloading, Parsing, and Insertion**
1. **Scalability**:
   - Modular scripts make it easier to debug and extend functionality without disrupting the entire workflow.
   - Separate processes can run independently or in parallel, improving performance.

2. **Error Isolation**:
   - Errors during downloading (e.g., network issues) do not affect parsing and insertion.
   - Each script can log specific errors for targeted troubleshooting.

3. **Maintainability**:
   - Each script has a single responsibility, making it easier to understand and modify.

4. **Flexibility**:
   - XML files are stored locally, allowing for re-parsing or re-insertion without repeated API calls.

---

## **Database Schema Overview**

### **`local_authorities` Table**
Stores metadata about local authorities and their Open Data file URLs.
```sql
CREATE TABLE fsa.local_authorities (
    local_authority_id INTEGER PRIMARY KEY,   -- Unique ID for each local authority
    name TEXT,                                -- Full authority name
    friendly_name TEXT,                       -- Simplified name for filenames
    url TEXT,                                 -- Open Data file URL
    metadata JSONB,                           -- Full metadata from /Authorities endpoint
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **`establishments` Table**
Stores parsed establishment data from the downloaded XML files.
```sql
CREATE TABLE fsa.establishments (
    fhrs_id INTEGER PRIMARY KEY,             -- Unique ID for each establishment
    business_name TEXT,                      -- Name of the establishment
    business_type TEXT,                      -- Type of business
    address_line_1 TEXT,                     -- Address line 1
    address_line_2 TEXT,                     -- Address line 2
    address_line_4 TEXT,                     -- Address line 4
    post_code TEXT,                          -- Postcode
    rating_value TEXT,                       -- Hygiene rating value
    rating_date DATE,                        -- Date of the rating
    latitude FLOAT,                          -- Latitude coordinate
    longitude FLOAT,                         -- Longitude coordinate
    local_authority_id INTEGER REFERENCES fsa.local_authorities(local_authority_id),
    metadata JSONB,                          -- Full metadata for flexibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **Quick Check: What You’ve Achieved**
- **Database Setup**:
  - Structured the `local_authorities` and `establishments` tables effectively.
  - Optimized relationships between tables using `local_authority_id`.

- **Download Script**:
  - Wrote a modular script that fetches and stores all local authority XML data.
  - Ensured robust naming conventions for local storage.

- **Error Handling**:
  - Ensured database interactions handle conflicts gracefully with `ON CONFLICT`.
  - Isolated errors during downloads to avoid workflow disruptions.

---

## **Next Steps**
1. **Develop Parsing and Insertion Script**:
   - Parse the downloaded XML files and insert data into the `establishments` table.
   - Validate parsed data before insertion.

2. **Automate the Workflow**:
   - Schedule nightly updates for downloading, parsing, and database updates.

3. **Performance Optimization**:
   - Implement caching and batching strategies for large datasets.
   - Optimize database queries for read-heavy operations.