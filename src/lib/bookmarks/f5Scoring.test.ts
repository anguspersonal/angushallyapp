import { describe, it, expect } from 'vitest';
import {
  computeConfidenceStats,
  computeF5Assessment,
  intelligenceLevelForAssessment,
  validateBookmarkMetadata,
  type BookmarkConfidenceRow,
} from './f5Scoring';

describe('computeF5Assessment', () => {
  it('returns 100 (EXCELLENT) for fully-populated DIRECT_API metadata', () => {
    const result = computeF5Assessment({
      title: 'Hello',
      description: 'A post',
      tags: ['a', 'b'],
      source: 'DIRECT_API',
      url: 'https://example.test/abc',
    });
    expect(result.overallScore).toBe(100);
    expect(result.confidenceLevel).toBe('EXCELLENT');
    expect(result.breakdown).toEqual({
      sourceQuality: 100,
      completeness: 100,
      apiCompliance: 100,
      validation: 100,
    });
  });

  it('drops apiCompliance to 50 when context.apiErrors is truthy', () => {
    const result = computeF5Assessment(
      { source: 'DIRECT_API', url: 'https://x.test', title: 't', description: 'd', tags: ['x'] },
      { apiErrors: true },
    );
    expect(result.breakdown.apiCompliance).toBe(50);
    expect(result.overallScore).toBeLessThan(100);
  });

  it('drops validation to 40 when url is missing or non-http', () => {
    const noUrl = computeF5Assessment({ source: 'DIRECT_API' });
    expect(noUrl.breakdown.validation).toBe(40);

    const ftpUrl = computeF5Assessment({ source: 'DIRECT_API', url: 'ftp://x.test' });
    expect(ftpUrl.breakdown.validation).toBe(40);
  });

  it('uses USER_GENERATED source quality (30) when source is unrecognised', () => {
    const result = computeF5Assessment({ source: 'NONSENSE_TAG' });
    expect(result.breakdown.sourceQuality).toBe(30);
  });

  it('treats source as USER_GENERATED when missing entirely', () => {
    const result = computeF5Assessment({});
    expect(result.breakdown.sourceQuality).toBe(30);
  });

  it('treats blank string fields as absent for completeness', () => {
    const result = computeF5Assessment({
      title: '   ',
      description: '',
      tags: 'x',
      source: 'DIRECT_API',
      url: 'https://x.test',
    });
    // 3 of 5 required fields present (tags, source, url) → 60
    expect(result.breakdown.completeness).toBe(60);
  });

  it('maps overallScore to confidence level thresholds', () => {
    // Boundaries: >=80 EXCELLENT, >=60 GOOD, >=40 FAIR, >=20 POOR, else VERY_POOR.
    // Empty metadata: source=USER_GENERATED(30), completeness=0, apiCompliance=100,
    // validation=40 → 30*.4 + 0 + 100*.2 + 40*.15 = 12 + 20 + 6 = 38 → FAIR? no, 38 < 40 → POOR
    expect(computeF5Assessment({}).confidenceLevel).toBe('POOR');
  });
});

describe('intelligenceLevelForAssessment', () => {
  it('returns 4 for EXCELLENT (>=80)', () => {
    expect(
      intelligenceLevelForAssessment({
        overallScore: 90,
        confidenceLevel: 'EXCELLENT',
        breakdown: { sourceQuality: 0, completeness: 0, apiCompliance: 0, validation: 0 },
      }),
    ).toBe(4);
  });

  it('returns 3 for GOOD (>=60)', () => {
    expect(
      intelligenceLevelForAssessment({
        overallScore: 70,
        confidenceLevel: 'GOOD',
        breakdown: { sourceQuality: 0, completeness: 0, apiCompliance: 0, validation: 0 },
      }),
    ).toBe(3);
  });

  it('returns 2 for everything below GOOD', () => {
    expect(
      intelligenceLevelForAssessment({
        overallScore: 30,
        confidenceLevel: 'POOR',
        breakdown: { sourceQuality: 0, completeness: 0, apiCompliance: 0, validation: 0 },
      }),
    ).toBe(2);
  });
});

describe('validateBookmarkMetadata', () => {
  it('errors when url is missing', () => {
    expect(validateBookmarkMetadata({})).toEqual({
      isValid: false,
      errors: ['URL is required'],
      warnings: ['Title is missing', 'Description is missing'],
    });
  });

  it('warns about missing optional fields but is valid with url', () => {
    expect(validateBookmarkMetadata({ url: 'https://x.test' })).toEqual({
      isValid: true,
      errors: [],
      warnings: ['Title is missing', 'Description is missing'],
    });
  });

  it('returns no errors or warnings for fully populated metadata', () => {
    expect(
      validateBookmarkMetadata({
        url: 'https://x.test',
        title: 'Hello',
        description: 'World',
      }),
    ).toEqual({ isValid: true, errors: [], warnings: [] });
  });
});

describe('computeConfidenceStats', () => {
  it('returns zeroed stats for an empty list', () => {
    expect(computeConfidenceStats([])).toEqual({
      totalBookmarks: 0,
      assessedBookmarks: 0,
      averageIntelligenceLevel: 0,
      averageConfidenceScore: 0,
      confidenceDistribution: { high: 0, medium: 0, low: 0 },
    });
  });

  it('counts only rows with confidence_scores as assessed', () => {
    const rows: BookmarkConfidenceRow[] = [
      { confidence_scores: { overallScore: 90 }, intelligence_level: 4 },
      { confidence_scores: null, intelligence_level: null },
      { confidence_scores: { overallScore: 50 }, intelligence_level: 2 },
    ];
    const stats = computeConfidenceStats(rows);
    expect(stats.totalBookmarks).toBe(3);
    expect(stats.assessedBookmarks).toBe(2);
    expect(stats.averageConfidenceScore).toBe(70);
  });

  it('buckets confidence distribution by score thresholds', () => {
    const rows: BookmarkConfidenceRow[] = [
      { confidence_scores: { overallScore: 95 }, intelligence_level: 4 },
      { confidence_scores: { overallScore: 80 }, intelligence_level: 4 },
      { confidence_scores: { overallScore: 65 }, intelligence_level: 3 },
      { confidence_scores: { overallScore: 50 }, intelligence_level: 2 },
      { confidence_scores: { overallScore: 30 }, intelligence_level: 2 },
    ];
    expect(computeConfidenceStats(rows).confidenceDistribution).toEqual({
      high: 2,
      medium: 2,
      low: 1,
    });
  });

  it('treats null intelligence_level as 1 in the average', () => {
    const rows: BookmarkConfidenceRow[] = [
      { confidence_scores: null, intelligence_level: null },
      { confidence_scores: null, intelligence_level: null },
    ];
    expect(computeConfidenceStats(rows).averageIntelligenceLevel).toBe(1);
  });
});
