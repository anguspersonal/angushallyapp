/**
 * F5 Certainty Scoring — confidence assessment for bookmark metadata quality.
 *
 * Pure functions: given metadata (and optional context), return a numeric
 * assessment, an aggregate stats summary across many bookmarks, or a list of
 * field-level errors and warnings. No I/O, no DB.
 */

export type F5ConfidenceLevel =
  | 'EXCELLENT'
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'VERY_POOR';

export interface F5AssessmentBreakdown {
  sourceQuality: number;
  completeness: number;
  apiCompliance: number;
  validation: number;
}

export interface F5Assessment {
  overallScore: number;
  confidenceLevel: F5ConfidenceLevel;
  breakdown: F5AssessmentBreakdown;
}

export interface BookmarkValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const SOURCE_QUALITY_SCORES: Record<string, number> = {
  DIRECT_API: 100,
  SCRAPED_VALIDATED: 85,
  SCRAPED_RAW: 70,
  INFERRED: 50,
  USER_GENERATED: 30,
};

const REQUIRED_FIELDS = ['title', 'description', 'tags', 'source', 'url'];

const WEIGHTS = {
  sourceQuality: 0.4,
  completeness: 0.25,
  apiCompliance: 0.2,
  validation: 0.15,
};

function deriveConfidenceLevel(score: number): F5ConfidenceLevel {
  if (score >= 80) return 'EXCELLENT';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'FAIR';
  if (score >= 20) return 'POOR';
  return 'VERY_POOR';
}

export function computeF5Assessment(
  metadata: Record<string, unknown>,
  context?: Record<string, unknown>,
): F5Assessment {
  const sourceType = String(metadata.source ?? 'USER_GENERATED').toUpperCase();
  const sourceQuality = SOURCE_QUALITY_SCORES[sourceType] ?? 30;

  const presentRequired = REQUIRED_FIELDS.filter(
    (field) => metadata[field] != null && String(metadata[field]).trim() !== '',
  ).length;
  const completeness = Math.round(
    (presentRequired / REQUIRED_FIELDS.length) * 100,
  );

  const apiCompliance = context?.apiErrors ? 50 : 100;

  const hasValidUrl =
    typeof metadata.url === 'string' && metadata.url.startsWith('http');
  const validation = hasValidUrl ? 100 : 40;

  const overallScore = Math.round(
    sourceQuality * WEIGHTS.sourceQuality +
      completeness * WEIGHTS.completeness +
      apiCompliance * WEIGHTS.apiCompliance +
      validation * WEIGHTS.validation,
  );

  return {
    overallScore,
    confidenceLevel: deriveConfidenceLevel(overallScore),
    breakdown: { sourceQuality, completeness, apiCompliance, validation },
  };
}

export function intelligenceLevelForAssessment(
  assessment: F5Assessment,
): number {
  if (assessment.overallScore >= 80) return 4;
  if (assessment.overallScore >= 60) return 3;
  return 2;
}

export function validateBookmarkMetadata(
  metadata: Record<string, unknown>,
): BookmarkValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!metadata.url) errors.push('URL is required');
  if (!metadata.title) warnings.push('Title is missing');
  if (!metadata.description) warnings.push('Description is missing');
  return { isValid: errors.length === 0, errors, warnings };
}

export interface BookmarkConfidenceRow {
  confidence_scores: Record<string, unknown> | null;
  intelligence_level: number | null;
}

export interface ConfidenceStats {
  totalBookmarks: number;
  assessedBookmarks: number;
  averageIntelligenceLevel: number;
  averageConfidenceScore: number;
  confidenceDistribution: { high: number; medium: number; low: number };
}

export function computeConfidenceStats(
  rows: BookmarkConfidenceRow[],
): ConfidenceStats {
  const assessed = rows.filter((row) => row.confidence_scores != null);
  const scores = assessed
    .map((row) => (row.confidence_scores as { overallScore?: unknown })?.overallScore)
    .filter((score): score is number => typeof score === 'number');

  return {
    totalBookmarks: rows.length,
    assessedBookmarks: assessed.length,
    averageIntelligenceLevel: rows.length
      ? rows.reduce((sum, row) => sum + (row.intelligence_level ?? 1), 0) /
        rows.length
      : 0,
    averageConfidenceScore: scores.length
      ? scores.reduce((sum, value) => sum + value, 0) / scores.length
      : 0,
    confidenceDistribution: {
      high: scores.filter((score) => score >= 80).length,
      medium: scores.filter((score) => score >= 50 && score < 80).length,
      low: scores.filter((score) => score < 50).length,
    },
  };
}
