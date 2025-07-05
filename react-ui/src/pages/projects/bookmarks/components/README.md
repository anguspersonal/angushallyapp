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

# BookmarkCard Component

**Location:** `react-ui/src/pages/projects/bookmarks/components/BookmarkCard.jsx`

## Overview

Enhanced bookmark card component with rich visual design, animations, and improved user experience. Part of the G1 module in the G-Series Frontend-Driven User Experience enhancements.

## Features

### Visual Design Enhancement (G1.1)
- **Rich Image Previews**: High-quality image display with fallback handling
- **Hover Animations**: Smooth transitions with card elevation and image scaling
- **Enhanced Typography**: Improved text hierarchy and spacing
- **Gradient Overlays**: Subtle overlays for better text readability on images

### Interactive Experience (G1.2)
- **Hover States**: Visual feedback with card elevation and color transitions
- **Click Behavior**: Direct link opening with proper security attributes
- **Loading States**: Graceful handling of image loading and errors
- **Responsive Design**: Optimized for different screen sizes

### Content Intelligence Display (G1.3)
- **Source-Specific Branding**: Color-coded badges for different bookmark sources
- **Smart Date Formatting**: Relative time display (e.g., "2 days ago")
- **Tag Organization**: Intelligent tag display with overflow handling
- **Domain Visualization**: Clean domain display with favicon fallback

### Accessibility & Polish (G1.4)
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Optimization**: Proper ARIA labels and semantic structure
- **Touch-Friendly**: Optimized for mobile interactions
- **High Contrast**: Compatible with high contrast mode

## Props

```javascript
{
  bookmark: {
    id: string,
    title: string,
    url?: string,
    link?: string, // Raindrop compatibility
    description?: string,
    image_url?: string,
    image_alt?: string,
    site_name?: string,
    tags?: string[],
    source_type: 'raindrop' | 'manual' | 'instapaper' | 'readwise',
    created_at: string
  },
  onRefresh?: () => void // Optional callback for refresh operations
}
```

## Usage

```jsx
import BookmarkCard from './components/BookmarkCard';

<BookmarkCard 
  bookmark={bookmarkData}
  onRefresh={handleRefresh}
/>
```

## Source Type Support

| Source | Icon | Color Scheme | Description |
|--------|------|--------------|-------------|
| `raindrop` | 🌧️ | Blue | Raindrop.io bookmarks |
| `manual` | ✏️ | Green | Manually added bookmarks |
| `instapaper` | 📱 | Orange | Instapaper bookmarks |
| `readwise` | 📚 | Purple | Readwise highlights |
| `unknown` | 🔗 | Gray | Unknown source |

## Enhanced Features

### Image Handling
- **Primary Images**: Full-size preview with hover scaling
- **Fallback Placeholder**: Gradient background with bookmark icon
- **Error Handling**: Graceful fallback to placeholder on image load failure
- **Alt Text Support**: Proper accessibility for screen readers

### Tag Display
- **Smart Truncation**: Shows first 3 tags with overflow indicator
- **Interactive Tags**: Click to filter (placeholder for future implementation)
- **Visual Hierarchy**: Consistent styling with source badges

### Date Formatting
- **Relative Time**: "yesterday", "3 days ago", "2 weeks ago"
- **Automatic Updates**: Time-based formatting
- **Fallback**: Standard date format for older items

### Hover Interactions
- **Card Elevation**: Subtle lift effect on hover
- **Image Scaling**: 5% scale increase for image previews
- **Color Transitions**: Smooth color changes for interactive elements
- **Icon Reveal**: External link icon appears on hover

## Technical Implementation

### Dependencies
- `@mantine/core`: UI components and styling
- `@mantine/notifications`: User notifications
- `@tabler/icons-react`: Icon library
- `../../../../theme`: Theme assets and configuration

### State Management
- `imageError`: Tracks image loading failures
- `isHovered`: Manages hover state for animations

### Performance Optimizations
- **Conditional Rendering**: Only renders image section when needed
- **Efficient Animations**: CSS transitions for smooth performance
- **Lazy Loading**: Images load on demand with error handling

## Testing

**Note:** Frontend testing infrastructure is being standardized. See `react-ui/BACKLOG.md` for Testing Strategy Standardization details.

Current test coverage includes:
- Basic component rendering
- Image display and fallback handling
- Source type labeling
- URL handling for different bookmark sources

## Future Enhancements

Planned improvements as part of G-Series development:
- Tag filtering implementation
- Tag editing functionality
- Reading time estimation
- Content type indicators
- Advanced search integration

## Related Documentation

- [Bookmark API README](../../../../server/bookmark-api/README.md)
- [React UI Backlog](../../BACKLOG.md)
- [Testing Strategy Standardization](../../BACKLOG.md#testing-strategy-standardization) 