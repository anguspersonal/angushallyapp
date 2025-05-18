# Database Schema and Migrations

This directory contains database migrations and schema documentation for the habit tracking application.

## Schema Overview

### CRM Domain
```sql
CREATE TABLE crm.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submitter_user_id UUID NULLABLE REFERENCES identity.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NULLABLE,
    message TEXT NULLABLE,
    captcha_token TEXT NULLABLE,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'open', 'assigned', 'pending_customer_reply', 'pending_agent_reply', 'resolved', 'closed', 'spam')),
    assigned_to_user_id UUID NULLABLE DEFAULT '95288f22-6049-4651-85ae-4932ededb5ab' REFERENCES identity.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### FSA Data Domain
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

CREATE TABLE fsa.establishments (
    id INTEGER PRIMARY KEY DEFAULT nextval('fsa.establishments_id_seq'::regclass),
    fhrs_id INTEGER UNIQUE NULLABLE,
    local_authority_business_id TEXT NULLABLE,
    business_name TEXT NULLABLE,
    business_type TEXT NULLABLE,
    business_type_id INTEGER NULLABLE,
    address_line_1 TEXT NULLABLE,
    address_line_2 TEXT NULLABLE,
    address_line_4 TEXT NULLABLE,
    post_code TEXT NULLABLE,
    address TEXT NULLABLE,
    rating_value_str TEXT NULLABLE,
    rating_value_num INTEGER NULLABLE,
    rating_key TEXT NULLABLE,
    rating_date DATE NULLABLE,
    rating_status_id INTEGER NULLABLE REFERENCES fsa.ratings(id),
    local_authority_code TEXT NULLABLE,
    local_authority_name TEXT NULLABLE,
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
);

CREATE TABLE fsa.postcodes (
    postcode_id INTEGER PRIMARY KEY DEFAULT nextval('fsa.postcodes_postcode_id_seq'::regclass),
    postcode VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE fsa.ratings (
    id INTEGER PRIMARY KEY DEFAULT nextval('fsa.ratings_id_seq'::regclass),
    rating_value_str TEXT UNIQUE NULLABLE
);

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

### Content Domain
```sql
CREATE TABLE content.authors (
    id UUID PRIMARY KEY REFERENCES identity.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content.posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    content TEXT NULLABLE,
    content_md TEXT NULLABLE,
    excerpt TEXT NOT NULL,
    slug TEXT NULLABLE,
    tags TEXT NULLABLE,
    metadata JSONB NULLABLE,
    cover_image VARCHAR(255) NULLABLE,
    alt_text TEXT NULLABLE,
    attribution TEXT NULLABLE,
    attribution_link TEXT NULLABLE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Public Domain
(Tables `public.authors`, `public.posts`, `public.customers`, and `public.inquiries` have been refactored and moved to other schemas like `content` and `crm`, or dropped as they were superseded by `identity.users`.)

```sql
-- No user-facing tables remain directly in the 'public' schema after recent refactoring.
-- The 'public' schema itself still exists as the default PostgreSQL schema and contains system tables
-- and extensions like knex_migrations, knex_migrations_lock.
```

### Habit Domain
```sql
CREATE TABLE habit.users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    fname VARCHAR(100),
    lname VARCHAR(100),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit.habit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    habit_type VARCHAR(50) NOT NULL,
    value NUMERIC,
    metric VARCHAR(50),
    extra_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit.alcohol (
    id SERIAL PRIMARY KEY,
    habit_log_id INTEGER REFERENCES habit.habit_log(id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    drink_id INTEGER,
    volume_ml NUMERIC,
    abv_percent NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit.drink_catalog (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    volume_ml NUMERIC,
    abv_percent NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit.exercise (
    id SERIAL PRIMARY KEY,
    habit_log_id INTEGER REFERENCES habit.habit_log(id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    activity_type VARCHAR(50),
    duration_minutes INTEGER,
    distance_km NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit.exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit.strava_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    strava_id BIGINT UNIQUE,
    activity_type VARCHAR(50),
    distance_km NUMERIC,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit.strava_sync_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    sync_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activities_synced INTEGER,
    status VARCHAR(50)
);

CREATE TABLE habit.strava_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE habit.strength_sets (
    id SERIAL PRIMARY KEY,
    habit_log_id INTEGER REFERENCES habit.habit_log(id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    exercise_id INTEGER REFERENCES habit.exercises(id),
    weight_kg NUMERIC,
    reps INTEGER,
    sets INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Migration Files

### 20240322_add_user_auth.sql
- Adds Google authentication support
- Updates user table with Google ID
- Adds user_id to habit tables
- Creates necessary indexes and constraints

### [Other migration files...]
[List and describe other migration files]

## Running Migrations

### Development
```bash
# Run all migrations
npm run migrate

# Run specific migration
npm run migrate -- --file=20240322_add_user_auth.sql
```

### Production
```bash
# Run migrations in production
NODE_ENV=production npm run migrate
```

## Database Management

### Creating New Migrations
1. Create a new SQL file in the migrations directory
2. Name format: `YYYYMMDD_description.sql`
3. Include both up and down migrations
4. Test the migration locally

### Migration Best Practices
- Always include down migrations
- Use transactions for safety
- Test migrations on a copy of production data
- Back up data before running migrations
- Document schema changes

### Indexes
- Created on frequently queried columns
- Optimized for common query patterns
- Regularly reviewed for performance

### Constraints
- Foreign key constraints for data integrity
- Unique constraints where appropriate
- Check constraints for data validation

## Query Behavior

### db.query Function
The `db.query` function returns only the rows property of the query result:

```javascript
// Correct Usage
const response = await db.query("SELECT * FROM habit.drink_catalog;");
console.log(response); // Array of rows

// Incorrect Usage
const response = await db.query("SELECT * FROM habit.drink_catalog;");
console.log(response.rows); // ❌ Error: .rows is not available
```

## Performance Considerations

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes
- Composite indexes for common queries
- Partial indexes for filtered queries

### Query Optimization
- Use prepared statements
- Implement connection pooling
- Monitor query performance
- Regular maintenance

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Backup verification

### Recovery Procedures
1. Stop the application
2. Restore from backup
3. Run pending migrations
4. Verify data integrity
5. Restart the application

## Contributing

1. Follow the migration naming convention
2. Include both up and down migrations
3. Test migrations thoroughly
4. Update this documentation
5. Submit a pull request 

# Database Query Results

IMPORTANT: The `db.query` function in this project returns only the rows array directly, not the full pg result object. This is different from the standard `pg` package behavior.

## Correct Usage:
```javascript
const response = await db.query('SELECT * FROM my_table');
console.log(response); // Array of rows
const firstRow = response[0]; // Access first row directly
```

## Incorrect Usage:
```javascript
const response = await db.query('SELECT * FROM my_table');
console.log(response.rows); // ❌ Error: .rows is not available
const firstRow = response.rows[0]; // ❌ Error: .rows is not available
```

This design choice:
1. Simplifies the application code
2. Reduces boilerplate
3. Makes the code more consistent
4. Prevents common mistakes

When writing migrations or database queries, always remember to access the results directly without `.rows`. 