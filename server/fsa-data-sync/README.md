# FSA Data Synchronization

This module handles the synchronization of data from the Food Hygiene Rating Scheme (FHRS) API and Open Data files into a PostgreSQL database. The workflow is modularized to separate downloading, parsing, and insertion of data for enhanced scalability and maintainability.

## Overview

The FSA data sync system:
- Fetches local authority metadata and Open Data file URLs
- Downloads XML files containing establishment data
- Parses and stores establishment information
- Automates nightly updates
- Maintains data integrity and consistency

## Workflow

### 1. Fetch Local Authorities
- **Script**: `fetchOpenDataUrls.js`
- **Purpose**: Retrieve metadata about local authorities and their Open Data file URLs
- **Output**: Inserts data into the `local_authorities` table
- **Fields**:
  - `local_authority_id` (Primary Key)
  - `name`
  - `friendly_name`
  - `url`
  - `metadata`

### 2. Download Open Data Files
- **Script**: `downloadOpenData.js`
- **Purpose**: Download XML files from the URLs obtained in step 1
- **Storage**: XML files stored in `fsa-establishment-data` directory
- **Naming Convention**: `<local_authority_id>-<friendly_name>.xml`
- **Example**: `501-barking-and-dagenham.xml`

### 3. Parse and Insert Data
- **Script**: `parseAndInsertData.js`
- **Purpose**: Parse XML files and insert establishment data
- **Process**:
  - Parse XML structure
  - Extract key fields
  - Store in database
  - Handle updates and conflicts

### 4. Automated Updates
- **Script**: `scheduleCronJob.js`
- **Purpose**: Automate the entire workflow
- **Schedule**: Nightly updates
- **Features**:
  - Error handling
  - Logging
  - Data validation

## Data Format

### XML Structure
```xml
<FHRSEstablishment>
    <Header>
        <ExtractDate>2025-01-04</ExtractDate>
        <ItemCount>1354</ItemCount>
        <ReturnCode>Success</ReturnCode>
    </Header>
    <EstablishmentCollection>
        <EstablishmentDetail>
            <FHRSID>1583332</FHRSID>
            <BusinessName>Example Business</BusinessName>
            <BusinessType>Restaurant/Cafe/Canteen</BusinessType>
            <AddressLine1>123 Example Street</AddressLine1>
            <AddressLine2>Example Area</AddressLine2>
            <AddressLine4>Example City</AddressLine4>
            <PostCode>EX1 2AB</PostCode>
            <RatingValue>4</RatingValue>
            <RatingDate>2024-03-13</RatingDate>
            <Geocode>
                <Longitude>0.1642449</Longitude>
                <Latitude>51.5523755</Latitude>
            </Geocode>
        </EstablishmentDetail>
    </EstablishmentCollection>
</FHRSEstablishment>
```

## Database Schema

### Local Authorities Table
```sql
CREATE TABLE fsa.local_authorities (
    local_authority_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    friendly_name TEXT,
    url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Establishments Table
```sql
CREATE TABLE fsa.establishments (
    fhrs_id INTEGER PRIMARY KEY,
    business_name TEXT,
    business_type TEXT,
    address_line_1 TEXT,
    address_line_2 TEXT,
    address_line_4 TEXT,
    post_code TEXT,
    rating_value TEXT,
    rating_date DATE,
    latitude FLOAT,
    longitude FLOAT,
    local_authority_id INTEGER REFERENCES fsa.local_authorities(local_authority_id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Details

### Modular Design Benefits
1. **Scalability**
   - Independent processes
   - Parallel execution possible
   - Easy to extend functionality

2. **Error Handling**
   - Isolated error domains
   - Specific error logging
   - Graceful failure recovery

3. **Maintainability**
   - Single responsibility per script
   - Clear separation of concerns
   - Easy to modify individual components

4. **Flexibility**
   - Local XML storage
   - Re-parsing capability
   - Data validation options

## Development

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Access to FSA API

### Setup
1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```env
FSA_API_KEY=your_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

3. Run initial sync:
```bash
node fetchOpenDataUrls.js
node downloadOpenData.js
node parseAndInsertData.js
```

### Testing
```bash
# Run tests
npm test

# Run specific test
npm test -- --grep="fetchOpenDataUrls"
```

## Monitoring

### Key Metrics
- Sync success rate
- Processing time
- Error rates
- Data freshness

### Logging
- Sync events
- Error details
- Performance metrics
- Data validation results

## Contributing

1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests

## Dependencies
- axios: HTTP client
- xml2js: XML parsing
- pg: Database interactions
- node-cron: Scheduling 