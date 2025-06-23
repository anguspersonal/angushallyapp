/**
 * F5 - Universal Certainty Scoring Framework
 * 
 * Provides confidence scoring (0-100%) for all extracted metadata across
 * platform-specific intelligence modules (F1-F4).
 * 
 * @module f5-certainty-scoring
 */

const db = require('../../db');

/**
 * Confidence scoring criteria and weights
 */
const CONFIDENCE_CRITERIA = {
  // Data source quality (40% of total score)
  SOURCE_QUALITY: {
    DIRECT_API: 100,        // Direct platform API response
    SCRAPED_VALIDATED: 85,  // Scraped data with validation
    SCRAPED_RAW: 70,        // Raw scraped data
    INFERRED: 50,           // Algorithmically inferred
    USER_GENERATED: 30      // User-provided data
  },
  
  // Metadata completeness (25% of total score)
  COMPLETENESS: {
    REQUIRED_FIELDS: {
      title: 20,
      description: 15,
      tags: 10,
      source_type: 10,
      source_id: 10
    },
    ENHANCED_FIELDS: {
      image_url: 5,
      site_name: 5,
      engagement_data: 10,
      platform_context: 10
    }
  },
  
  // Platform API compliance (20% of total score)
  API_COMPLIANCE: {
    RATE_LIMIT_OK: 100,
    RATE_LIMIT_WARNING: 80,
    RATE_LIMIT_EXCEEDED: 40,
    API_ERROR: 20,
    NO_API_ACCESS: 0
  },
  
  // Cross-platform validation (15% of total score)
  VALIDATION: {
    CROSS_PLATFORM_MATCH: 100,
    PARTIAL_MATCH: 70,
    NO_MATCH: 30,
    VALIDATION_ERROR: 20
  }
};

/**
 * Calculate confidence score for extracted metadata
 * 
 * @param {Object} metadata - The extracted metadata object
 * @param {Object} context - Processing context and source information
 * @returns {Object} Confidence assessment with score and breakdown
 */
function calculateConfidenceScore(metadata, context = {}) {
  const assessment = {
    overallScore: 0,
    breakdown: {
      sourceQuality: 0,
      completeness: 0,
      apiCompliance: 0,
      validation: 0
    },
    factors: [],
    recommendations: []
  };

  // 1. Source Quality Assessment (40% weight)
  const sourceQuality = assessSourceQuality(context.sourceType, context.validationStatus);
  assessment.breakdown.sourceQuality = sourceQuality.score;
  assessment.factors.push({
    category: 'Source Quality',
    score: sourceQuality.score,
    weight: 0.4,
    details: sourceQuality.details
  });

  // 2. Metadata Completeness Assessment (25% weight)
  const completeness = assessMetadataCompleteness(metadata);
  assessment.breakdown.completeness = completeness.score;
  assessment.factors.push({
    category: 'Completeness',
    score: completeness.score,
    weight: 0.25,
    details: completeness.details
  });

  // 3. API Compliance Assessment (20% weight)
  const apiCompliance = assessApiCompliance(context.apiStatus);
  assessment.breakdown.apiCompliance = apiCompliance.score;
  assessment.factors.push({
    category: 'API Compliance',
    score: apiCompliance.score,
    weight: 0.2,
    details: apiCompliance.details
  });

  // 4. Cross-platform Validation Assessment (15% weight)
  const validation = assessCrossPlatformValidation(context.validationResults);
  assessment.breakdown.validation = validation.score;
  assessment.factors.push({
    category: 'Validation',
    score: validation.score,
    weight: 0.15,
    details: validation.details
  });

  // Calculate weighted overall score
  assessment.overallScore = Math.round(
    (sourceQuality.score * 0.4) +
    (completeness.score * 0.25) +
    (apiCompliance.score * 0.2) +
    (validation.score * 0.15)
  );

  // Generate recommendations
  assessment.recommendations = generateRecommendations(assessment);

  return assessment;
}

/**
 * Assess data source quality
 */
function assessSourceQuality(sourceType, validationStatus) {
  let score = CONFIDENCE_CRITERIA.SOURCE_QUALITY.INFERRED;
  let details = 'Data source quality assessment';

  switch (sourceType) {
    case 'direct_api':
      score = CONFIDENCE_CRITERIA.SOURCE_QUALITY.DIRECT_API;
      details = 'Direct platform API response - highest reliability';
      break;
    case 'scraped_validated':
      score = CONFIDENCE_CRITERIA.SOURCE_QUALITY.SCRAPED_VALIDATED;
      details = 'Scraped data with validation checks';
      break;
    case 'scraped_raw':
      score = CONFIDENCE_CRITERIA.SOURCE_QUALITY.SCRAPED_RAW;
      details = 'Raw scraped data without validation';
      break;
    case 'user_generated':
      score = CONFIDENCE_CRITERIA.SOURCE_QUALITY.USER_GENERATED;
      details = 'User-provided data - requires verification';
      break;
    default:
      details = 'Unknown source type - defaulting to inferred score';
  }

  return { score, details };
}

/**
 * Assess metadata completeness
 */
function assessMetadataCompleteness(metadata) {
  let score = 0;
  const details = [];
  const requiredFields = CONFIDENCE_CRITERIA.COMPLETENESS.REQUIRED_FIELDS;
  const enhancedFields = CONFIDENCE_CRITERIA.COMPLETENESS.ENHANCED_FIELDS;

  // Check required fields
  for (const [field, points] of Object.entries(requiredFields)) {
    if (metadata[field] && metadata[field].toString().trim()) {
      score += points;
      details.push(`✓ ${field}: ${points} points`);
    } else {
      details.push(`✗ ${field}: missing (0 points)`);
    }
  }

  // Check enhanced fields
  for (const [field, points] of Object.entries(enhancedFields)) {
    if (metadata[field] && metadata[field].toString().trim()) {
      score += points;
      details.push(`✓ ${field}: ${points} points (enhanced)`);
    }
  }

  // Cap at 100
  score = Math.min(score, 100);

  return { 
    score, 
    details: details.join(', '),
    missingFields: Object.keys(requiredFields).filter(field => !metadata[field] || !metadata[field].toString().trim())
  };
}

/**
 * Assess API compliance and rate limiting
 */
function assessApiCompliance(apiStatus = {}) {
  let score = CONFIDENCE_CRITERIA.API_COMPLIANCE.RATE_LIMIT_OK;
  let details = 'API compliance assessment';

  if (apiStatus.rateLimitExceeded) {
    score = CONFIDENCE_CRITERIA.API_COMPLIANCE.RATE_LIMIT_EXCEEDED;
    details = 'Rate limit exceeded - reduced confidence';
  } else if (apiStatus.rateLimitWarning) {
    score = CONFIDENCE_CRITERIA.API_COMPLIANCE.RATE_LIMIT_WARNING;
    details = 'Rate limit warning - approaching limits';
  } else if (apiStatus.apiError) {
    score = CONFIDENCE_CRITERIA.API_COMPLIANCE.API_ERROR;
    details = 'API error encountered - low confidence';
  } else if (apiStatus.noAccess) {
    score = CONFIDENCE_CRITERIA.API_COMPLIANCE.NO_API_ACCESS;
    details = 'No API access - cannot validate data';
  }

  return { score, details };
}

/**
 * Assess cross-platform validation results
 */
function assessCrossPlatformValidation(validationResults = {}) {
  let score = CONFIDENCE_CRITERIA.VALIDATION.NO_MATCH;
  let details = 'Cross-platform validation assessment';

  if (validationResults.crossPlatformMatch) {
    score = CONFIDENCE_CRITERIA.VALIDATION.CROSS_PLATFORM_MATCH;
    details = 'Cross-platform validation successful';
  } else if (validationResults.partialMatch) {
    score = CONFIDENCE_CRITERIA.VALIDATION.PARTIAL_MATCH;
    details = 'Partial cross-platform match found';
  } else if (validationResults.validationError) {
    score = CONFIDENCE_CRITERIA.VALIDATION.VALIDATION_ERROR;
    details = 'Validation error occurred';
  }

  return { score, details };
}

/**
 * Generate improvement recommendations based on assessment
 */
function generateRecommendations(assessment) {
  const recommendations = [];

  if (assessment.breakdown.sourceQuality < 70) {
    recommendations.push('Consider using direct API access for higher confidence');
  }

  if (assessment.breakdown.completeness < 60) {
    recommendations.push('Enhance metadata extraction to include more required fields');
  }

  if (assessment.breakdown.apiCompliance < 80) {
    recommendations.push('Review API rate limiting and access policies');
  }

  if (assessment.breakdown.validation < 50) {
    recommendations.push('Implement cross-platform validation for data verification');
  }

  if (assessment.overallScore < 50) {
    recommendations.push('Consider manual review or user enrichment for this content');
  }

  return recommendations;
}

/**
 * Get confidence level category based on score
 */
function getConfidenceLevel(score) {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 80) return 'GOOD';
  if (score >= 70) return 'FAIR';
  if (score >= 50) return 'POOR';
  return 'VERY_POOR';
}

/**
 * Validate metadata against platform-specific rules
 */
function validateMetadata(metadata, platform) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Platform-specific validation rules
  const rules = getPlatformValidationRules(platform);
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = metadata[field];
    
    if (rule.required && (!value || value.toString().trim() === '')) {
      validation.errors.push(`${field} is required for ${platform} content`);
      validation.isValid = false;
    }
    
    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      validation.warnings.push(`${field} exceeds maximum length of ${rule.maxLength}`);
    }
    
    if (value && rule.pattern && !rule.pattern.test(value.toString())) {
      validation.errors.push(`${field} does not match expected format`);
      validation.isValid = false;
    }
  }

  return validation;
}

/**
 * Get platform-specific validation rules
 */
function getPlatformValidationRules(platform) {
  const baseRules = {
    title: { required: true, maxLength: 1000 },
    url: { required: true, pattern: /^https?:\/\// },
    source_type: { required: true },
    source_id: { required: true }
  };

  const platformRules = {
    instagram: {
      ...baseRules,
      caption: { maxLength: 2200 },
      hashtags: { pattern: /^[#\w\s]+$/ }
    },
    linkedin: {
      ...baseRules,
      company: { maxLength: 200 },
      industry: { maxLength: 100 }
    },
    youtube: {
      ...baseRules,
      description: { maxLength: 5000 },
      duration: { pattern: /^\d+$/ }
    },
    twitter: {
      ...baseRules,
      tweet_text: { maxLength: 280 },
      thread_id: { pattern: /^\d+$/ }
    }
  };

  return platformRules[platform] || baseRules;
}

/**
 * Save confidence assessment to database
 */
async function saveConfidenceAssessment(bookmarkId, assessment, userId) {
  try {
    const query = `
      UPDATE bookmarks.bookmarks 
      SET 
        confidence_scores = $1,
        intelligence_level = $2,
        processing_status = 'completed',
        updated_at = NOW()
      WHERE id = $3 AND user_id = $4
    `;

    const result = await db.query(query, [
      JSON.stringify(assessment),
      assessment.overallScore,
      bookmarkId,
      userId
    ]);

    return result.rowCount > 0;
  } catch (error) {
    console.error('Error saving confidence assessment:', error);
    throw error;
  }
}

/**
 * Get confidence assessment from database
 */
async function getConfidenceAssessment(bookmarkId, userId) {
  try {
    const query = `
      SELECT confidence_scores, intelligence_level, processing_status
      FROM bookmarks.bookmarks 
      WHERE id = $1 AND user_id = $2
    `;

    const result = await db.query(query, [bookmarkId, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      confidenceScores: row.confidence_scores ? JSON.parse(row.confidence_scores) : null,
      intelligenceLevel: row.intelligence_level,
      processingStatus: row.processing_status
    };
  } catch (error) {
    console.error('Error retrieving confidence assessment:', error);
    throw error;
  }
}

module.exports = {
  calculateConfidenceScore,
  getConfidenceLevel,
  validateMetadata,
  saveConfidenceAssessment,
  getConfidenceAssessment,
  CONFIDENCE_CRITERIA
}; 