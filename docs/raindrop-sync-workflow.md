# Raindrop Bookmark Sync and Enrichment Workflow

## Overview
This document outlines the process of syncing bookmarks from Raindrop.io to the AngusHally app database and enriching them with metadata.

## Workflow Steps

### 1. Bookmark Creation in Raindrop
- User adds a bookmark to their Raindrop.io account
- Bookmark is stored in Raindrop's system with basic metadata (title, URL, tags)

### 2. Sync to Raindrop Schema
- **Trigger**: Currently manual via UI "Sync" button (Future: Implement cron job for automatic sync)
- **Process**:
  1. App queries Raindrop API using user's OAuth token
  2. Fetches all bookmarks for the user
  3. Stores in `raindrop.bookmarks` table with:
     - `user_id`
     - `raindrop_id`
     - `title`
     - `link`
     - `tags`
     - `created_at`
     - `updated_at`
     - `is_organised` (default: false)
  4. Logs sync operation in `bookmark.bookmark_sync_logs` (Future: label sync jobs for clarity)

### 3. Metadata Enrichment
- **Trigger**: Manual via UI or automated after sync
- **Process**:
  1. `bookmarkMetadataEnricher.js` queries `raindrop.bookmarks` for unorganized bookmarks
  2. For each bookmark:
     - Fetches metadata using URL with fallback chain:
       - OpenGraph tags (primary)
       - Twitter Card tags (secondary)
       - Regular HTML metadata (fallback)
     - Extracts metadata:
       - Basic:
         - `title` (og:title → twitter:title → <title>)
         - `description` (og:description → twitter:description → meta description)
         - `site_name` (og:site_name)
         - `type` (og:type - article, website, etc.)
         - `locale` (og:locale)
       - Media:
         - `image` (og:image → twitter:image, first available)
         - `image_alt` (og:image:alt)
         - `video` (og:video, if present)
         - `audio` (og:audio, if present)
       - Article-specific (if type is article):
         - `published_time` (article:published_time)
         - `author` (article:author)
         - `section` (article:section)
       - Technical:
         - `resolved_url` (final URL after redirects)
     - Attempts to update bookmark with enriched metadata

### 4. Bookmark Organization
- **Success Path**:
  1. If metadata enrichment succeeds:
     - Creates new entry in `bookmark.bookmarks` with enriched data
     - Updates `is_organised = true` in `raindrop.bookmarks`
     - Logs successful sync
  2. If metadata enrichment fails:
     - Keeps bookmark in `raindrop.bookmarks` with `is_organised = false`
     - Logs failure in sync logs
     - No entry created in `bookmark.bookmarks`

## Database Schema

### raindrop.bookmarks
```sql
CREATE TABLE raindrop.bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES identity.users(id),
    raindrop_id STRING NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    tags TEXT[],
    image TEXT,
    site_name TEXT,
    resolved_url TEXT,
    is_organised BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### bookmark.bookmarks
```sql
CREATE TABLE bookmark.bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES identity.users(id),
    url TEXT NOT NULL,
    resolved_url TEXT,
    title TEXT,
    description TEXT,
    image TEXT,
    site_name TEXT,
    tags JSONB DEFAULT '[]',
    source TEXT NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Column Mapping

### Field Mapping Between Schemas

| Raindrop.io API    | raindrop.bookmarks | OpenGraph/Twitter  | bookmark.bookmarks | Notes |
|-------------------|-------------------|-------------------|-----------------------|--------|
| -                 | id [PK]           | -                 | -                     | Auto-incrementing primary key |
| _id               | raindrop_id       | -                 | -                     | Unique ID from Raindrop |
| -                 | -                 | -                 | id [PK]               | Auto-incrementing primary key |
| title             | title             | og:title / twitter:title | title          | Title of the bookmark |
| link              | link              | -                 | url                   | The actual URL |
| tags              | tags              | -                 | tags                  | Array of tags stored as JSONB |
| cover             | image             | og:image / twitter:image | image_url      | Primary image URL |
| -                 | -                 | og:image:alt      | image_alt             | Alternative text for image |
| excerpt           | -                 | og:description / twitter:description | description | Description/summary |
| domain            | site_name         | og:site_name      | site_name             | Website name |
| -                 | -                 | og:type           | type                  | Content type (article, website, etc.) |
| -                 | -                 | og:locale         | locale                | Language/region info |
| -                 | -                 | og:video          | video_url             | Video content URL |
| -                 | -                 | og:audio          | audio_url             | Audio content URL |
| -                 | -                 | article:published_time | published_time    | Article publish date |
| -                 | -                 | article:author    | author                | Article author |
| -                 | -                 | article:section   | section               | Article section/category |
| -                 | -                 | -                 | metadata_source       | Source of metadata (OG/Twitter/HTML) |
| -                 | -                 | -                 | raw_metadata          | Raw metadata response for future use |

### Metadata Enrichment Flow
1. Data from Raindrop.io API is stored in `raindrop.bookmarks`
2. Metadata enrichment process:
   - Fetches OpenGraph/Twitter metadata from the URL
   - Maps metadata to appropriate fields
   - Creates enriched entry in `bookmark.bookmarks`
   - Updates `is_organised = true` in `raindrop.bookmarks`

### Notes
- `raindrop.bookmarks` serves as a staging area for synced bookmarks
- `bookmark.bookmarks` contains the final, enriched bookmarks
- Some metadata fields are only available during enrichment and not stored in either table
- The `source` field in `bookmark.bookmarks` is set to 'raindrop' for synced bookmarks

## Future Improvements
1. Implement automatic sync via cron job
2. Add retry mechanism for failed metadata enrichment
3. Add batch processing for large bookmark collections
4. Implement webhook support for real-time sync
5. Add support for bookmark updates and deletions
6. Enhance image handling:
   - Store multiple image variants
   - Select best image based on size/quality
   - Implement image caching
   - Add image validation
7. Expand metadata storage:
   - Add support for article-specific metadata
   - Store media type information
   - Track metadata source (OG/Twitter/HTML)

## Error Handling
- Failed syncs are logged in `bookmark.bookmark_sync_logs`
- Failed metadata enrichment keeps bookmarks in `raindrop.bookmarks` with `is_organised = false`
- Detailed error messages are stored for debugging
- UI shows appropriate error messages to users

## Monitoring
- Sync logs track:
  - Number of bookmarks processed
  - Success/failure status
  - Error messages
  - Timestamps
- Failed enrichments can be retried manually
- System maintains audit trail of all operations 