# Apify Integration for Instagram Content Intelligence

## Overview

The F1 – Instagram Content Intelligence module now includes full Apify integration for extracting real Instagram metadata. The implementation provides:

- **Generic ApifyService**: Reusable service for running any Apify actor
- **Instagram-specific integration**: Specialized methods for Instagram content scraping
- **Fallback mechanism**: Uses mock data when Apify is not configured
- **Error handling**: Graceful degradation and comprehensive logging

## Setup

### 1. Install Dependencies

```bash
npm install apify-client
```

### 2. Environment Variables

Add the following to your `.env` file:

```bash
# Apify Configuration
APIFY_API_TOKEN=your_apify_api_token_here
APIFY_INSTAGRAM_ACTOR_ID=pratikdani/instagram-posts-scraper
```

### 3. Get Apify API Token

1. Sign up at [Apify.com](https://apify.com)
2. Go to Settings → Integrations
3. Copy your API token
4. Add it to your environment variables

## Usage

### Basic Instagram Metadata Extraction

```javascript
const InstagramIntelligenceService = require('./server/bookmark-api/instagramIntelligence');

const service = new InstagramIntelligenceService();
const metadata = await service.extractInstagramMetadata('https://www.instagram.com/reel/C5Rdyj_q7YN/');

console.log(metadata);
// Returns standardized metadata object with:
// - url, caption (description), hashtags array, mentions
// - engagement metrics (likes, comments, views, play count, engagement score)
// - author information (username, followers, posts count, verification status)
// - media details (content type, photos/videos arrays, thumbnail)
// - comments array with latest comments and user details
// - audio information and partnership details
```

### Using Generic ApifyService

```javascript
const ApifyService = require('./server/bookmark-api/apifyService');

const apify = new ApifyService();

// Check if configured
if (apify.isAvailable()) {
    // Run any actor
    const results = await apify.runActor('actor-id', { url: 'https://example.com' });
    
    // Run Instagram scraper specifically
    const instagramData = await apify.runInstagramScraper('https://www.instagram.com/reel/ABC123/');
}
```

## API Endpoints

All existing API endpoints work the same way:

```bash
# Analyze Instagram content (now uses real Apify data if configured)
POST /api/instagram-intelligence/analyze
{
  "instagramUrl": "https://www.instagram.com/reel/C5Rdyj_q7YN/"
}

# Extract metadata only
POST /api/instagram-intelligence/extract-metadata
{
  "instagramUrl": "https://www.instagram.com/reel/C5Rdyj_q7YN/"
}
```

## Configuration

The system automatically detects Apify configuration:

- **With Apify token**: Uses real Instagram scraping
- **Without token**: Falls back to mock data for development/testing

### Environment Configuration

In `config/env.js`:

```javascript
apify: {
    apiToken: process.env.APIFY_API_TOKEN,
    actors: {
        instagramScraper: process.env.APIFY_INSTAGRAM_ACTOR_ID || 'wj7yXss2honyonHJ8'
    }
}
```

## Data Structure

The `pratikdani/instagram-posts-scraper` returns rich data that gets transformed into our standard format:

### Raw Apify Response Fields
- `url` - Instagram URL
- `user_posted` - Username who posted
- `description` - Post caption/description
- `hashtags` - Array of hashtags
- `num_comments` - Number of comments
- `date_posted` - ISO timestamp
- `likes` - Like count
- `video_view_count` - View count as string
- `video_play_count` - Play count as number
- `followers` - Author's follower count
- `posts_count` - Author's total posts
- `is_verified` - Verification status
- `photos` - Array of photo URLs
- `videos` - Array of video URLs
- `latest_comments` - Array of recent comments with user details
- `audio` - Audio/music information
- `partnership_details` - Sponsored content info

### Transformed Standard Format
```javascript
{
  url: "https://www.instagram.com/reel/C5Rdyj_q7YN/",
  caption: "Bro is a cat-of-all-trades 🧳 \n\n#catoftheday...",
  hashtags: ["#catoftheday", "#orangecatsofinstagram", ...],
  mentions: ["@username1", "@username2"],
  engagement: {
    likes: 3443089,
    comments: 8240,
    views: 33572016,
    playCount: 68487503,
    engagementScore: 33572016
  },
  author: {
    username: "dextheorangecat",
    followers: 213880,
    postsCount: 303,
    isVerified: false,
    profileImageUrl: "https://...",
    profileUrl: "https://www.instagram.com/dextheorangecat"
  },
  media: {
    type: "Reel",
    photos: ["https://..."],
    videos: ["https://..."],
    thumbnail: "https://..."
  },
  comments: {
    latest: [
      {
        comments: "Please do not the cat ❌",
        likes: 2,
        user_commenting: "nolster03",
        profile_picture: "https://..."
      }
    ],
    count: 8240
  }
}
```

## Adding New Actors

To add support for other platforms (LinkedIn, YouTube, etc.):

### 1. Add Actor ID to Environment

```bash
APIFY_LINKEDIN_ACTOR_ID=your_linkedin_actor_id
APIFY_YOUTUBE_ACTOR_ID=your_youtube_actor_id
```

### 2. Update Config

```javascript
// In config/env.js
actors: {
    instagramScraper: process.env.APIFY_INSTAGRAM_ACTOR_ID || 'pratikdani/instagram-posts-scraper',
    linkedinScraper: process.env.APIFY_LINKEDIN_ACTOR_ID,
    youtubeScraper: process.env.APIFY_YOUTUBE_ACTOR_ID
}
```

### 3. Add Methods to ApifyService

```javascript
// In apifyService.js
async runLinkedInScraper(linkedinUrl) {
    const actorId = this.actors.linkedinScraper;
    if (!actorId) {
        throw new Error('LinkedIn scraper actor ID not configured');
    }
    
    const input = { url: linkedinUrl };
    return await this.runActor(actorId, input);
}
```

## Testing

Run the integration test:

```bash
node scripts/test/testApifyIntegration.js
```

This will:
- Check Apify service configuration
- Test Instagram metadata extraction
- Validate URL parsing
- Show whether real or mock data is being used

## Error Handling

The system includes comprehensive error handling:

1. **Missing API token**: Falls back to mock data
2. **Actor failure**: Falls back to mock data with logging
3. **Network issues**: Retries and fallback
4. **Invalid URLs**: Clear validation errors

## Logging

All Apify operations include detailed logging:

```
🔄 Running Apify actor pratikdani/instagram-posts-scraper
✅ Actor run completed: run_abc123
📊 Retrieved 1 items from actor
✅ Apify Instagram data extracted successfully
```

## Cost Considerations

- Each Instagram URL extraction costs Apify compute units
- Monitor usage in your Apify dashboard
- Consider implementing caching for frequently accessed URLs
- Use mock data in development to avoid unnecessary costs

## Future Enhancements

The modular design supports:

- **Multiple platform scrapers** (F2-F4 modules)
- **Batch processing** for multiple URLs
- **Caching layer** for repeated requests
- **Rate limiting** for API protection
- **Webhook integration** for real-time updates 