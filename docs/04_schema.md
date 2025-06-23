docs/04_schema.md
Purpose: Human-friendly overview of your DB schemas.

Content:

List of logical schemas (identity, habit, crm, fsa, content)

Key tables & relationships (ERD png thumbnail + link)

Link to schema.dbml / schema-dbdiagram.dbml



// Full Canonical Database Schema (DBML)
// This file represents the detailed truth of the database schema, including named constraints and specific index types.
// It is used for internal documentation and understanding the precise database structure as created by Knex migrations.
// Some syntax used here (e.g., named unique constraints inline) might not be fully rendered or might cause parsing issues in all DBML visualizers (like dbdiagram.io).
// For a version specifically tailored for dbdiagram.io, see schema-dbdiagram.dbml.

// --- Project Wide Settings (Optional, but good for context) ---
Project angushally_app {
  database_type: 'PostgreSQL'
  Note: 'Application database for various personal projects and utilities, featuring a unified identity system.'
}

// --- Schema: identity ---
// Manages all user identities, roles, and access control for the entire application.

Table identity.users {
  id uuid [pk, default: `gen_random_uuid()`, note: 'Primary key for users']
  email string [not null, note: 'User\'s primary email, used for login and communication']
  password_hash string [nullable, note: 'Hashed password for local authentication']
  auth_provider string [not null, default: 'local', note: 'Authentication method used, e.g., local, google']
  google_sub string [unique: 'uq_users_google_sub', nullable, note: 'Google\'s unique subject identifier']
  first_name string [nullable]
  last_name string [nullable]
  is_active boolean [not null, default: false, note: 'Indicates if user account is active and can log in']
  email_verified_at timestamptz [nullable, note: 'Timestamp of email verification']
  last_login_at timestamptz [nullable, note: 'Timestamp of last successful login']
  metadata jsonb [not null, default: '{}', note: 'Flexible JSONB field for additional user data, e.g., legacy IDs, preferences']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  Indexes {
    (email) [name: 'ix_users_email']
    (auth_provider) [name: 'ix_users_auth_provider']
    (is_active) [name: 'ix_users_is_active']
    (last_login_at) [name: 'ix_users_last_login_at']
    (google_sub) [name: 'ix_users_google_sub']
    (email, auth_provider) [unique, name: 'uq_users_email_auth_provider']
  }
}

Table identity.roles {
  id uuid [pk, default: `gen_random_uuid()`]
  name string [not null, unique: 'uq_roles_name']
  description string [nullable]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
}

Table identity.user_roles {
  user_id uuid [not null]
  role_id uuid [not null]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  Indexes {
    (role_id, user_id) [name: 'ix_user_roles_role_user']
  }
  Note: 'Composite primary key on (user_id, role_id)'
}

Table identity.access_requests {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null]
  requested_at timestamptz [not null, default: `now()`]
  status string [not null, default: 'pending'] // ENUM type: ['pending', 'approved', 'rejected']
  handled_by uuid [nullable]
  handled_at timestamptz [nullable]
  rejection_reason string [nullable]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  Indexes {
    (user_id) [name: 'ix_access_requests_user_id']
    (status) [name: 'ix_access_requests_status']
    (requested_at) [name: 'ix_access_requests_requested_at']
    (handled_at) [name: 'ix_access_requests_handled_at']
    (user_id) [unique, name: 'uq_access_requests_pending_user', note: 'Partial index WHERE status = \'pending\'']
  }
}

// Relationships for identity schema
Ref: identity.user_roles.user_id > identity.users.id [delete: cascade]
Ref: identity.user_roles.role_id > identity.roles.id [delete: cascade]
Ref: identity.access_requests.user_id > identity.users.id [delete: 'set null']
Ref: identity.access_requests.handled_by > identity.users.id [delete: 'set null']


// Schema: habit
// Note: This schema will contain the _deprecated_users table and tables like habit_log, alcohol, exercise etc.
// These will need their user foreign keys updated to point to identity.users.id

Table habit._deprecated_users { // Example structure - confirm actual legacy columns
  user_id integer [pk] // Assuming this was the old PK
  email string
  fname string
  lname string
  google_user_id string // This was used to populate identity.users.google_sub
  created_at timestamptz
  last_updated timestamptz
  // ... other legacy columns ...
}

Table habit.habit_log {
  id integer [pk, increment, note: 'Primary key for habit log entries']
  user_id uuid [ref: > identity.users.id, not null, note: 'Link to the unified user ID'] // TARGET STATE
  habit_type string [not null, note: 'Type of habit, e.g., alcohol, exercise']
  value real [note: 'Numerical value of the habit entry, e.g., units of alcohol, km run']
  metric string [nullable, note: 'Unit of measurement for the value, e.g., ml, units, km']
  extra_data jsonb [nullable, note: 'Additional JSON data specific to the habit type']
  created_at timestamptz [default: `now()`]
}

Table habit.alcohol { // Example, add other habit-specific tables as needed
  id integer [pk, increment]
  habit_log_id integer [ref: > habit.habit_log.id]
  user_id uuid [ref: > identity.users.id] // TARGET STATE: Needs to point to identity.users
  drink_id integer
  volume_ml real
  abv_percent real
  created_at timestamptz [default: `now()`]
}

Table habit.exercise { // Example
  id integer [pk, increment]
  habit_log_id integer [ref: > habit.habit_log.id]
  user_id uuid [ref: > identity.users.id] // TARGET STATE: Needs to point to identity.users
  activity_type string
  duration_minutes integer
  distance_km real
  created_at timestamptz [default: `now()`]
}

Table habit.drink_catalog {
  id integer [pk, increment]
  name string [not null]
  volume_ml real
  abv_percent real
  created_at timestamptz [default: `now()`]
}

Table habit.exercises { // Catalog of exercise types
  id integer [pk, increment]
  name string [not null]
  category string [nullable]
  created_at timestamptz [default: `now()`]
}

// --- Schema: crm ---
Table crm.inquiries {
  id integer [pk, increment]
  name string [not null]
  email string [not null]
  message string
  status string [default: 'new']
  user_id uuid [nullable, ref: > identity.users.id] // TARGET STATE: if inquiries can be linked to unified users
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

// --- Schema: fsa ---
Table fsa.local_authorities {
  local_authority_id integer [pk]
  name string [not null]
  friendly_name string [nullable]
  url string [nullable]
  metadata jsonb [nullable]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table fsa.establishments {
  fhrs_id integer [pk]
  business_name string [nullable]
  business_type string [nullable]
  address_line_1 string [nullable]
  address_line_2 string [nullable]
  address_line_4 string [nullable]
  post_code string [nullable]
  rating_value string [nullable]
  rating_date date [nullable]
  latitude float [nullable]
  longitude float [nullable]
  local_authority_id integer [ref: > fsa.local_authorities.local_authority_id]
  metadata jsonb [nullable]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

// --- Schema: public_data ---
// Assuming 'public_data' is the schema name for blog posts, authors, and legacy customers

Table public_data._deprecated_customers { // Example structure - confirm actual legacy columns
  id integer [pk] // Assuming this was the old PK
  name string
  email string
  phone string
  created_at timestamptz
  // updated_at timestamptz // You mentioned this didn't exist for customers
  // ... other legacy columns ...
}

Table public_data.authors {
  id integer [pk, increment]
  name string [not null]
  email string [unique, nullable] // Or should this link to identity.users if authors are users?
  // user_id uuid [ref: > identity.users.id, nullable] // Optional: if authors can be system users
  bio string [nullable]
  created_at timestamptz [default: `now()`]
}

Table public_data.posts {
  id integer [pk, increment]
  title string [not null]
  content string [nullable]
  author_id integer [ref: > public_data.authors.id] // Or ref: > identity.users.id if authors are users
  created_at timestamptz [default: `now()`]
}

// --- Schema: bookmarks ---
// 🆕 Schema added January 2025 for unified bookmark storage across multiple sources

Table bookmarks.bookmarks {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > identity.users.id, not null, note: 'Link to unified user ID']
  title text [not null]
  url text [not null]
  resolved_url text [nullable]
  description text [nullable]
  image_url text [nullable]
  image_alt text [nullable]
  site_name text [nullable]
  tags text[] [nullable, note: 'Array of tags for bookmark organization']
  source_type string [not null, note: 'Source platform: raindrop, pocket, instapaper, etc.']
  source_id string [not null, note: 'Original ID from the source platform']
  source_metadata jsonb [nullable, note: 'Additional metadata from source platform']
  is_organized boolean [not null, default: false, note: 'Indicates if bookmark has been processed/organized']
  // F5 Universal Certainty Scoring Framework fields (added 2025-06-23)
  intelligence_level integer [default: 1, note: 'Processing level: 1=metadata, 2=enhanced, 3=deep, 4=manual']
  confidence_scores jsonb [nullable, note: 'Detailed confidence assessment with breakdown and recommendations']
  platform_metadata jsonb [nullable, note: 'Platform-specific extracted metadata and context']
  processing_status text [default: 'pending', note: 'Status: pending, processing, completed, failed, enhanced']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  Indexes {
    (user_id) [name: 'ix_bookmarks_user_id']
    (url) [name: 'ix_bookmarks_url']
    (tags) [name: 'ix_bookmarks_tags', type: 'gin']
    (source_type, source_id) [unique, name: 'uq_bookmarks_source']
    // F5 Framework indexes
    (intelligence_level) [name: 'idx_bookmarks_intelligence_level']
    (processing_status) [name: 'idx_bookmarks_processing_status']
    (user_id, intelligence_level) [name: 'idx_bookmarks_user_intelligence']
  }
}

Table bookmarks.categories {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > identity.users.id, not null, note: 'Link to unified user ID']
  name string [not null]
  description text [nullable]
  parent_id uuid [ref: > bookmarks.categories.id, nullable, note: 'For hierarchical categories']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  Indexes {
    (user_id) [name: 'ix_categories_user_id']
    (parent_id) [name: 'ix_categories_parent_id']
  }
}

Table bookmarks.bookmark_categories {
  bookmark_id uuid [ref: > bookmarks.bookmarks.id, not null]
  category_id uuid [ref: > bookmarks.categories.id, not null]
  created_at timestamptz [not null, default: `now()`]

  Indexes {
    (bookmark_id, category_id) [unique, name: 'uq_bookmark_categories']
  }
}

// --- Schema: raindrop ---
// Legacy schema for Raindrop.io integration - will be migrated to bookmarks schema

Table raindrop.bookmarks {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > identity.users.id]
  raindrop_id string [not null, note: 'ID from Raindrop.io API']
  link text [not null]
  title text [nullable]
  description text [nullable]
  is_organized boolean [not null, default: false]
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  Indexes {
    (user_id) [name: 'ix_raindrop_bookmarks_user_id']
    (raindrop_id) [unique, name: 'uq_raindrop_bookmarks_id']
  }
}

Table raindrop.sync_logs {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [not null, ref: > identity.users.id]
  status text [not null, note: 'success, error, partial_success']
  item_count integer [not null]
  error_message text [nullable]
  started_at timestamptz [not null, default: `now()`]
  finished_at timestamptz [nullable]

  Indexes {
    (user_id) [name: 'ix_raindrop_sync_logs_user_id']
    (started_at) [name: 'ix_raindrop_sync_logs_started_at']
  }
}

// Relationships for bookmark schemas
Ref: bookmarks.bookmarks.user_id > identity.users.id [delete: cascade]
Ref: raindrop.bookmarks.user_id > identity.users.id [delete: cascade]
Ref: raindrop.sync_logs.user_id > identity.users.id [delete: cascade]

## `raindrop` Schema

The `raindrop` schema manages integration with Raindrop.io bookmark service.

### Tables

#### `raindrop.tokens`
Stores OAuth tokens for Raindrop.io authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY, REFERENCES identity.users(id) | User who owns the tokens |
| access_token | TEXT | NOT NULL | OAuth access token |
| refresh_token | TEXT | | OAuth refresh token |
| expires_at | TIMESTAMP WITH TIME ZONE | | Token expiration time |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | When tokens were created |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Last update time |

#### `raindrop.bookmarks`
Stores synchronized bookmarks from Raindrop.io.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Internal bookmark ID |
| user_id | UUID | NOT NULL, REFERENCES identity.users(id) | User who owns the bookmark |
| raindrop_id | BIGINT | NOT NULL | Raindrop.io bookmark ID |
| title | TEXT | NOT NULL | Bookmark title |
| link | TEXT | NOT NULL | Bookmark URL |
| tags | TEXT[] | DEFAULT '{}' | Array of bookmark tags |
| created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | When bookmark was created in Raindrop |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Last sync time |

**Indexes:**
- UNIQUE INDEX on (user_id, raindrop_id) - Prevents duplicate bookmarks per user

#### `raindrop.collections`
Stores bookmark collections/folders from Raindrop.io.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Internal collection ID |
| user_id | UUID | NOT NULL, REFERENCES identity.users(id) | User who owns the collection |
| raindrop_collection_id | BIGINT | NOT NULL | Raindrop.io collection ID |
| title | TEXT | NOT NULL | Collection name |
| count | INTEGER | DEFAULT 0 | Number of bookmarks in collection |
| parent_id | BIGINT | | Parent collection ID (for nested collections) |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | When collection was created |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Last sync time |

**Indexes:**
- UNIQUE INDEX on (user_id, raindrop_collection_id) - Prevents duplicate collections per user