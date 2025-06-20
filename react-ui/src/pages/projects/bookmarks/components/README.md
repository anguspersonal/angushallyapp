# Bookmark Components

This directory contains reusable components for displaying bookmarks across the application.

## Components

### BookmarkCard

A reusable card component for displaying individual bookmarks with preview image support.

**Features:**
- Preview image display with fallback handling
- Source type indicators (Raindrop, Manual, Instapaper, Readwise)
- Tag display and interaction
- Responsive design
- Error handling for broken images

**Props:**
- `bookmark` (Object): The bookmark data object
- `onRefresh` (Function): Callback function to refresh bookmarks

**Bookmark Object Structure:**
```javascript
{
  id: string,
  title: string,
  url: string, // or link for Raindrop bookmarks
  description: string,
  image_url: string, // Preview image URL
  image_alt: string, // Alt text for preview image
  site_name: string,
  tags: string[],
  source_type: string, // 'raindrop', 'manual', 'instapaper', 'readwise'
  created_at: string
}
```

**Usage:**
```jsx
import BookmarkCard from './components/BookmarkCard';

<BookmarkCard 
  bookmark={bookmarkData}
  onRefresh={fetchBookmarks}
/>
```

## Image Handling

The BookmarkCard component includes robust image handling:

1. **Preview Images**: Displays `image_url` if available
2. **Fallback**: Uses placeholder image if preview fails to load
3. **Error Handling**: Gracefully handles broken image URLs
4. **Alt Text**: Uses `image_alt` or generates descriptive alt text

## Integration

This component is used by:
- `Bookmarks.jsx` - Canonical bookmarks display
- `Raindrops.jsx` - Raindrop-specific bookmarks display

Both components now use the same card layout for consistency and maintainability. 