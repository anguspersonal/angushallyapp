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

### **`fsa.local_authorities` Table**
Stores metadata about local authorities, their Open Data file URLs, and processing metrics for establishment data.
```sql
CREATE TABLE fsa.local_authorities (
    local_authority_id INTEGER PRIMARY KEY,
    name TEXT NULLABLE,
    friendly_name TEXT NULLABLE,
    url TEXT NULLABLE,
    metadata JSONB NULLABLE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estab_success_count INTEGER NULLABLE,
    estab_skipped_count INTEGER NULLABLE,
    estab_error_count INTEGER NULLABLE,
    processing_duration DOUBLE PRECISION NULLABLE,
    process_successful BOOLEAN NULLABLE,
    processing_status TEXT NULLABLE DEFAULT 'Pending',
    process_message TEXT NULLABLE
);
```

### **`fsa.establishments` Table**
Stores parsed establishment data from the downloaded XML files.
```sql
CREATE TABLE fsa.establishments (
    id INTEGER PRIMARY KEY DEFAULT nextval('fsa.establishments_id_seq'::regclass),
    fhrs_id INTEGER UNIQUE NULLABLE, -- FHRSID, often used as a primary business identifier from FSA
    local_authority_business_id TEXT NULLABLE,
    business_name TEXT NULLABLE,
    business_type TEXT NULLABLE,
    business_type_id INTEGER NULLABLE,
    address_line_1 TEXT NULLABLE,
    address_line_2 TEXT NULLABLE,
    address_line_4 TEXT NULLABLE, -- Assuming address_line_3 might be missing or combined
    post_code TEXT NULLABLE,
    address TEXT NULLABLE, -- Combined address field
    rating_value_str TEXT NULLABLE,    -- Text representation of rating (e.g., '5', 'AwaitingInspection')
    rating_value_num INTEGER NULLABLE, -- Numerical representation of rating if applicable
    rating_key TEXT NULLABLE,
    rating_date DATE NULLABLE,
    rating_status_id INTEGER NULLABLE REFERENCES fsa.ratings(id),
    local_authority_code TEXT NULLABLE,
    local_authority_name TEXT NULLABLE, -- Redundant if joining with local_authorities but often present in raw data
    local_authority_website TEXT NULLABLE,
    local_authority_email_address TEXT NULLABLE,
    hygiene_score INTEGER NULLABLE,
    structural_score INTEGER NULLABLE,
    confidence_in_management INTEGER NULLABLE,
    scheme_type TEXT NULLABLE,
    new_rating_pending BOOLEAN NULLABLE,
    longitude DOUBLE PRECISION NULLABLE,
    latitude DOUBLE PRECISION NULLABLE,
    postcode_id INTEGER NULLABLE REFERENCES fsa.postcodes(postcode_id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- metadata JSONB from original README was not in live schema, can be added if needed.
);
```

### **`fsa.postcodes` Table**
Lookup table for postcodes.
```sql
CREATE TABLE fsa.postcodes (
    postcode_id INTEGER PRIMARY KEY DEFAULT nextval('fsa.postcodes_postcode_id_seq'::regclass),
    postcode VARCHAR(10) NOT NULL UNIQUE
);
```

### **`fsa.ratings` Table**
Lookup table for rating values.
```sql
CREATE TABLE fsa.ratings (
    id INTEGER PRIMARY KEY DEFAULT nextval('fsa.ratings_id_seq'::regclass),
    rating_value_str TEXT UNIQUE NULLABLE
);
```

### **`fsa.scheduled_jobs` Table**
Tracks scheduled jobs for FSA data synchronization.
```sql
CREATE TABLE fsa.scheduled_jobs (
    job_id INTEGER PRIMARY KEY DEFAULT nextval('fsa.scheduled_jobs_job_id_seq'::regclass),
    job_name TEXT NOT NULL,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NULLABLE,
    status TEXT NOT NULL,
    remarks TEXT NULLABLE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## **Quick Check: What You've Achieved**
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