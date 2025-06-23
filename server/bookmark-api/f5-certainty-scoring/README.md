# F5 - Universal Certainty Scoring Framework

**Location:** `server/bookmark-api/f5-certainty-scoring/`

## Purpose

The F5 Certainty Scoring Framework provides confidence assessment (0-100%) for all extracted metadata across platform-specific intelligence modules (F1-F4). It serves as the foundation for reliable, transparent content intelligence by evaluating data quality, completeness, and reliability.

## Core Functions

### `calculateConfidenceScore(metadata, context)`
Calculates a weighted confidence score based on four assessment criteria:

- **Source Quality (40%)**: Data source reliability (API vs. scraped vs. inferred)
- **Completeness (25%)**: Required and enhanced field presence
- **API Compliance (20%)**: Rate limiting and access status
- **Validation (15%)**: Cross-platform verification results

**Returns:** Confidence assessment object with score, breakdown, and recommendations

### `getConfidenceLevel(score)`
Converts numeric scores to confidence categories:
- **90-100%**: EXCELLENT
- **80-89%**: GOOD  
- **70-79%**: FAIR
- **50-69%**: POOR
- **<50%**: VERY_POOR

### `validateMetadata(metadata, platform)`
Validates metadata against platform-specific rules for Instagram, LinkedIn, YouTube, and Twitter.

### `saveConfidenceAssessment(bookmarkId, assessment, userId)`
Persists confidence assessment to database with intelligence level and processing status.

### `getConfidenceAssessment(bookmarkId, userId)`
Retrieves stored confidence assessment for a specific bookmark.

## API Endpoints

### `POST /api/f5/assess`
Calculate confidence score for metadata without saving.

**Request Body:**
```json
{
  "metadata": {
    "title": "Example Post",
    "description": "Post description",
    "tags": ["tag1", "tag2"]
  },
  "context": {
    "sourceType": "direct_api",
    "apiStatus": {
      "rateLimitExceeded": false
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "assessment": {
    "overallScore": 85,
    "confidenceLevel": "GOOD",
    "breakdown": {
      "sourceQuality": 100,
      "completeness": 75,
      "apiCompliance": 100,
      "validation": 30
    },
    "recommendations": [
      "Implement cross-platform validation for data verification"
    ]
  }
}
```

### `POST /api/f5/validate`
Validate metadata against platform-specific rules.

**Request Body:**
```json
{
  "metadata": {
    "title": "Instagram Post",
    "caption": "Post caption with #hashtags"
  },
  "platform": "instagram"
}
```

### `POST /api/f5/bookmark/:bookmarkId/assess`
Assess and save confidence score for a specific bookmark.

### `GET /api/f5/bookmark/:bookmarkId/assessment`
Retrieve confidence assessment for a bookmark.

### `GET /api/f5/bookmarks/confidence-stats`
Get confidence statistics for user's bookmarks.

### `POST /api/f5/bookmarks/bulk-assess`
Bulk assess multiple bookmarks.

## Database Schema

### New Fields Added to `bookmarks.bookmarks`:

```sql
-- Intelligence level (1-4) indicating processing depth
intelligence_level INTEGER DEFAULT 1

-- Confidence scores as JSONB for detailed breakdown
confidence_scores JSONB

-- Platform-specific metadata storage
platform_metadata JSONB

-- Processing status tracking
processing_status TEXT DEFAULT 'pending'
```

### Indexes:
- `idx_bookmarks_intelligence_level` on `intelligence_level`
- `idx_bookmarks_processing_status` on `processing_status`
- `idx_bookmarks_user_intelligence` on `(user_id, intelligence_level)`

## Configuration

### Confidence Criteria Weights
```javascript
const CONFIDENCE_CRITERIA = {
  SOURCE_QUALITY: {
    DIRECT_API: 100,        // Direct platform API response
    SCRAPED_VALIDATED: 85,  // Scraped data with validation
    SCRAPED_RAW: 70,        // Raw scraped data
    INFERRED: 50,           // Algorithmically inferred
    USER_GENERATED: 30      // User-provided data
  },
  // ... other criteria
};
```

### Platform Validation Rules
Each platform has specific validation rules for required fields, maximum lengths, and format patterns.

## Usage Examples

### Basic Confidence Assessment
```javascript
const { calculateConfidenceScore } = require('./certaintyScoring');

const metadata = {
  title: "Example Content",
  description: "Content description",
  tags: ["tag1", "tag2"]
};

const context = {
  sourceType: "direct_api",
  apiStatus: { rateLimitExceeded: false }
};

const assessment = calculateConfidenceScore(metadata, context);
console.log(`Confidence: ${assessment.overallScore}%`);
```

### Metadata Validation
```javascript
const { validateMetadata } = require('./certaintyScoring');

const validation = validateMetadata(metadata, 'instagram');
if (validation.isValid) {
  console.log('Metadata is valid for Instagram');
} else {
  console.log('Validation errors:', validation.errors);
}
```

### Database Integration
```javascript
const { saveConfidenceAssessment } = require('./certaintyScoring');

await saveConfidenceAssessment(bookmarkId, assessment, userId);
```

## Error Handling

The module includes comprehensive error handling for:
- Invalid metadata formats
- Database connection issues
- Platform validation failures
- API rate limiting
- Authentication errors

All errors are logged with context and return appropriate HTTP status codes.

## Security Considerations

- All endpoints require authentication via `authMiddleware`
- User-scoped data access (users can only access their own assessments)
- Input validation and sanitization
- Rate limiting applied at route level
- SQL injection prevention via parameterized queries

## Performance Considerations

- Database indexes on frequently queried fields
- JSONB storage for flexible metadata structure
- Efficient bulk operations for multiple bookmarks
- Caching opportunities for confidence calculations

## Integration with F-Series Modules

F5 serves as the foundation for all other F-series modules:

- **F1 (Instagram)**: Uses F5 for caption and hashtag confidence scoring
- **F2 (LinkedIn)**: Uses F5 for professional context reliability assessment
- **F3 (YouTube)**: Uses F5 for video metadata confidence evaluation
- **F4 (Twitter)**: Uses F5 for tweet and thread confidence scoring

## Testing

Run tests with:
```bash
npm test -- --testPathPattern=f5-certainty-scoring
```

Test files:
- `testCertaintyScoring.unit.test.js` - Unit tests for scoring algorithms
- `testCertaintyScoring.integration.test.js` - Integration tests with database
- `testF5CertaintyRoute.test.js` - API endpoint tests

## Change History

- **2025-06-23**: Initial implementation of F5 Certainty Scoring Framework
  - Core confidence scoring algorithm
  - Platform-specific validation rules
  - Database schema and API endpoints
  - Comprehensive documentation and testing

## Future Enhancements

- Machine learning-based confidence scoring
- Cross-platform content correlation
- User feedback integration for score refinement
- Advanced validation rules for new platforms
- Real-time confidence monitoring and alerts 