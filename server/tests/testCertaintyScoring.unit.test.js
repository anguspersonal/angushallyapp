/**
 * Unit Tests for F5 Certainty Scoring Framework
 * 
 * Tests the core confidence scoring algorithms and validation functions
 * without database dependencies.
 */

const {
  calculateConfidenceScore,
  getConfidenceLevel,
  validateMetadata,
  CONFIDENCE_CRITERIA
} = require('../bookmark-api/f5-certainty-scoring/certaintyScoring');

// Mock database module
jest.mock('../db', () => ({
  query: jest.fn()
}));

describe('F5 Certainty Scoring Framework - Unit Tests', () => {
  
  describe('calculateConfidenceScore', () => {
    
    test('should calculate high confidence for direct API data with complete metadata', () => {
      const metadata = {
        title: 'Complete Post Title',
        description: 'Detailed description of the content',
        tags: ['tag1', 'tag2', 'tag3'],
        source_type: 'instagram',
        source_id: '12345',
        image_url: 'https://example.com/image.jpg',
        site_name: 'Instagram'
      };

      const context = {
        sourceType: 'direct_api',
        apiStatus: { rateLimitExceeded: false },
        validationResults: { crossPlatformMatch: true }
      };

      const assessment = calculateConfidenceScore(metadata, context);

      expect(assessment.overallScore).toBeGreaterThanOrEqual(85);
      expect(getConfidenceLevel(assessment.overallScore)).toBe('EXCELLENT');
      expect(assessment.breakdown.sourceQuality).toBe(100);
      expect(assessment.breakdown.completeness).toBeGreaterThan(70);
      expect(assessment.breakdown.apiCompliance).toBe(100);
      expect(assessment.breakdown.validation).toBe(100);
      expect(assessment.factors).toHaveLength(4);
      expect(assessment.recommendations).toBeInstanceOf(Array);
    });

    test('should calculate low confidence for scraped data with incomplete metadata', () => {
      const metadata = {
        title: 'Incomplete Post',
        // Missing description, tags, etc.
      };

      const context = {
        sourceType: 'scraped_raw',
        apiStatus: { apiError: true },
        validationResults: { validationError: true }
      };

      const assessment = calculateConfidenceScore(metadata, context);

      expect(assessment.overallScore).toBeLessThan(50);
      expect(getConfidenceLevel(assessment.overallScore)).toBe('VERY_POOR');
      expect(assessment.breakdown.sourceQuality).toBe(70);
      expect(assessment.breakdown.completeness).toBeLessThan(30);
      expect(assessment.breakdown.apiCompliance).toBe(20);
      expect(assessment.breakdown.validation).toBe(20);
    });

    test('should handle missing context gracefully', () => {
      const metadata = {
        title: 'Test Post',
        description: 'Test description'
      };

      const assessment = calculateConfidenceScore(metadata);

      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.breakdown).toBeDefined();
      expect(assessment.factors).toBeInstanceOf(Array);
    });

    test('should generate appropriate recommendations for low confidence', () => {
      const metadata = {
        title: 'Low Quality Post'
      };

      const context = {
        sourceType: 'inferred',
        apiStatus: { noAccess: true }
      };

      const assessment = calculateConfidenceScore(metadata, context);

      expect(assessment.recommendations).toContain('Consider using direct API access for higher confidence');
      expect(assessment.recommendations).toContain('Enhance metadata extraction to include more required fields');
    });
  });

  describe('getConfidenceLevel', () => {
    
    test('should return EXCELLENT for scores 90-100', () => {
      expect(getConfidenceLevel(95)).toBe('EXCELLENT');
      expect(getConfidenceLevel(100)).toBe('EXCELLENT');
      expect(getConfidenceLevel(90)).toBe('EXCELLENT');
    });

    test('should return GOOD for scores 80-89', () => {
      expect(getConfidenceLevel(85)).toBe('GOOD');
      expect(getConfidenceLevel(89)).toBe('GOOD');
      expect(getConfidenceLevel(80)).toBe('GOOD');
    });

    test('should return FAIR for scores 70-79', () => {
      expect(getConfidenceLevel(75)).toBe('FAIR');
      expect(getConfidenceLevel(79)).toBe('FAIR');
      expect(getConfidenceLevel(70)).toBe('FAIR');
    });

    test('should return POOR for scores 50-69', () => {
      expect(getConfidenceLevel(60)).toBe('POOR');
      expect(getConfidenceLevel(69)).toBe('POOR');
      expect(getConfidenceLevel(50)).toBe('POOR');
    });

    test('should return VERY_POOR for scores below 50', () => {
      expect(getConfidenceLevel(30)).toBe('VERY_POOR');
      expect(getConfidenceLevel(0)).toBe('VERY_POOR');
      expect(getConfidenceLevel(49)).toBe('VERY_POOR');
    });
  });

  describe('validateMetadata', () => {
    
    test('should validate Instagram metadata correctly', () => {
      const metadata = {
        title: 'Instagram Post',
        url: 'https://instagram.com/p/12345',
        source_type: 'instagram',
        source_id: '12345',
        caption: 'This is a valid Instagram caption with #hashtags',
        hashtags: '#hashtag1 #hashtag2'
      };

      const validation = validateMetadata(metadata, 'instagram');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    test('should detect Instagram validation errors', () => {
      const metadata = {
        title: 'Instagram Post',
        // Missing required fields
        caption: 'A'.repeat(2500) // Exceeds max length
      };

      const validation = validateMetadata(metadata, 'instagram');

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('url is required for instagram content');
      expect(validation.errors).toContain('source_type is required for instagram content');
      expect(validation.warnings).toContain('caption exceeds maximum length of 2200');
    });

    test('should validate LinkedIn metadata correctly', () => {
      const metadata = {
        title: 'LinkedIn Post',
        url: 'https://linkedin.com/posts/12345',
        source_type: 'linkedin',
        source_id: '12345',
        company: 'Test Company',
        industry: 'Technology'
      };

      const validation = validateMetadata(metadata, 'linkedin');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate YouTube metadata correctly', () => {
      const metadata = {
        title: 'YouTube Video',
        url: 'https://youtube.com/watch?v=12345',
        source_type: 'youtube',
        source_id: '12345',
        description: 'Video description',
        duration: '120'
      };

      const validation = validateMetadata(metadata, 'youtube');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate Twitter metadata correctly', () => {
      const metadata = {
        title: 'Twitter Post',
        url: 'https://twitter.com/user/status/12345',
        source_type: 'twitter',
        source_id: '12345',
        tweet_text: 'This is a valid tweet',
        thread_id: '12345'
      };

      const validation = validateMetadata(metadata, 'twitter');

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should handle unknown platform gracefully', () => {
      const metadata = {
        title: 'Unknown Platform Post',
        url: 'https://example.com',
        source_type: 'unknown',
        source_id: '12345'
      };

      const validation = validateMetadata(metadata, 'unknown');

      expect(validation.isValid).toBe(true); // Should use base rules
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('CONFIDENCE_CRITERIA', () => {
    
    test('should have correct source quality scores', () => {
      expect(CONFIDENCE_CRITERIA.SOURCE_QUALITY.DIRECT_API).toBe(100);
      expect(CONFIDENCE_CRITERIA.SOURCE_QUALITY.SCRAPED_VALIDATED).toBe(85);
      expect(CONFIDENCE_CRITERIA.SOURCE_QUALITY.SCRAPED_RAW).toBe(70);
      expect(CONFIDENCE_CRITERIA.SOURCE_QUALITY.INFERRED).toBe(50);
      expect(CONFIDENCE_CRITERIA.SOURCE_QUALITY.USER_GENERATED).toBe(30);
    });

    test('should have correct API compliance scores', () => {
      expect(CONFIDENCE_CRITERIA.API_COMPLIANCE.RATE_LIMIT_OK).toBe(100);
      expect(CONFIDENCE_CRITERIA.API_COMPLIANCE.RATE_LIMIT_WARNING).toBe(80);
      expect(CONFIDENCE_CRITERIA.API_COMPLIANCE.RATE_LIMIT_EXCEEDED).toBe(40);
      expect(CONFIDENCE_CRITERIA.API_COMPLIANCE.API_ERROR).toBe(20);
      expect(CONFIDENCE_CRITERIA.API_COMPLIANCE.NO_API_ACCESS).toBe(0);
    });

    test('should have correct validation scores', () => {
      expect(CONFIDENCE_CRITERIA.VALIDATION.CROSS_PLATFORM_MATCH).toBe(100);
      expect(CONFIDENCE_CRITERIA.VALIDATION.PARTIAL_MATCH).toBe(70);
      expect(CONFIDENCE_CRITERIA.VALIDATION.NO_MATCH).toBe(30);
      expect(CONFIDENCE_CRITERIA.VALIDATION.VALIDATION_ERROR).toBe(20);
    });

    test('should have required fields defined', () => {
      expect(CONFIDENCE_CRITERIA.COMPLETENESS.REQUIRED_FIELDS.title).toBe(20);
      expect(CONFIDENCE_CRITERIA.COMPLETENESS.REQUIRED_FIELDS.description).toBe(15);
      expect(CONFIDENCE_CRITERIA.COMPLETENESS.REQUIRED_FIELDS.tags).toBe(10);
      expect(CONFIDENCE_CRITERIA.COMPLETENESS.REQUIRED_FIELDS.source_type).toBe(10);
      expect(CONFIDENCE_CRITERIA.COMPLETENESS.REQUIRED_FIELDS.source_id).toBe(10);
    });
  });

  describe('Edge Cases', () => {
    
    test('should handle empty metadata object', () => {
      const assessment = calculateConfidenceScore({});
      
      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.breakdown.completeness).toBe(0);
    });

    test('should handle null and undefined values', () => {
      const metadata = {
        title: null,
        description: undefined,
        tags: []
      };

      const assessment = calculateConfidenceScore(metadata);
      
      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.breakdown.completeness).toBe(0);
    });

    test('should handle very long field values', () => {
      const metadata = {
        title: 'A'.repeat(2000), // Very long title
        description: 'B'.repeat(10000), // Very long description
        tags: ['tag1', 'tag2']
      };

      const assessment = calculateConfidenceScore(metadata);
      
      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.breakdown.completeness).toBeGreaterThan(0);
    });

    test('should handle special characters in metadata', () => {
      const metadata = {
        title: 'Post with émojis 🎉 and special chars!@#$%',
        description: 'Description with unicode: 你好世界',
        tags: ['tag-with-dashes', 'tag_with_underscores']
      };

      const assessment = calculateConfidenceScore(metadata);
      
      expect(assessment.overallScore).toBeGreaterThan(0);
      expect(assessment.breakdown.completeness).toBeGreaterThan(0);
    });
  });
}); 