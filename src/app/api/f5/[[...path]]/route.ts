import { requireAuth } from '@/lib/supabase/auth-helpers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type Params = { path?: string[] };

// F5 Certainty Scoring — confidence assessment for bookmark metadata quality

const SOURCE_QUALITY_SCORES: Record<string, number> = {
  DIRECT_API: 100,
  SCRAPED_VALIDATED: 85,
  SCRAPED_RAW: 70,
  INFERRED: 50,
  USER_GENERATED: 30,
};

const REQUIRED_FIELDS = ['title', 'description', 'tags', 'source', 'url'];

function computeF5Assessment(metadata: Record<string, unknown>, context?: Record<string, unknown>) {
  // Source Quality (40%)
  const sourceType = String(metadata.source ?? 'USER_GENERATED').toUpperCase();
  const sourceQuality = SOURCE_QUALITY_SCORES[sourceType] ?? 30;

  // Completeness (25%)
  const presentRequired = REQUIRED_FIELDS.filter(
    (f) => metadata[f] != null && String(metadata[f]).trim() !== '',
  ).length;
  const completeness = Math.round((presentRequired / REQUIRED_FIELDS.length) * 100);

  // API Compliance (20%)
  const apiCompliance = context?.apiErrors ? 50 : 100;

  // Validation (15%)
  const validation = metadata.url && typeof metadata.url === 'string' && metadata.url.startsWith('http') ? 100 : 40;

  const overallScore = Math.round(
    sourceQuality * 0.4 + completeness * 0.25 + apiCompliance * 0.2 + validation * 0.15,
  );

  const confidenceLevel =
    overallScore >= 80 ? 'EXCELLENT' :
    overallScore >= 60 ? 'GOOD' :
    overallScore >= 40 ? 'FAIR' :
    overallScore >= 20 ? 'POOR' : 'VERY_POOR';

  return {
    overallScore,
    confidenceLevel,
    breakdown: { sourceQuality, completeness, apiCompliance, validation },
  };
}

export async function GET(_request: NextRequest, context: { params: Promise<Params> }) {
  const ctx = await requireAuth();
  if (!ctx.ok) return ctx.response;

  const { path } = await context.params;
  const subpath = path?.join('/') ?? '';

  // GET /api/f5/bookmark/:id/assessment
  const bookmarkAssessmentMatch = subpath.match(/^bookmark\/([^/]+)\/assessment$/);
  if (bookmarkAssessmentMatch) {
    const bookmarkId = bookmarkAssessmentMatch[1];
    const { data, error } = await ctx.admin
      .schema('bookmarks')
      .from('bookmarks')
      .select('confidence_scores, intelligence_level, processing_status')
      .eq('id', bookmarkId)
      .eq('user_id', ctx.userId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      assessment: {
        confidenceScores: data.confidence_scores,
        intelligenceLevel: data.intelligence_level,
        processingStatus: data.processing_status,
      },
    });
  }

  // GET /api/f5/bookmarks/confidence-stats
  if (subpath === 'bookmarks/confidence-stats') {
    const { data, error } = await ctx.admin
      .schema('bookmarks')
      .from('bookmarks')
      .select('confidence_scores, intelligence_level')
      .eq('user_id', ctx.userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const rows = data ?? [];
    const assessed = rows.filter((r) => r.confidence_scores != null);
    const scores = assessed
      .map((r) => (r.confidence_scores as Record<string, unknown>)?.overallScore)
      .filter((s): s is number => typeof s === 'number');

    return NextResponse.json({
      success: true,
      stats: {
        totalBookmarks: rows.length,
        assessedBookmarks: assessed.length,
        averageIntelligenceLevel: rows.length
          ? rows.reduce((s, r) => s + (r.intelligence_level ?? 1), 0) / rows.length
          : 0,
        averageConfidenceScore: scores.length
          ? scores.reduce((s, v) => s + v, 0) / scores.length
          : 0,
        confidenceDistribution: {
          high: scores.filter((s) => s >= 80).length,
          medium: scores.filter((s) => s >= 50 && s < 80).length,
          low: scores.filter((s) => s < 50).length,
        },
      },
    });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(request: NextRequest, context: { params: Promise<Params> }) {
  const ctx = await requireAuth();
  if (!ctx.ok) return ctx.response;

  const { path } = await context.params;
  const subpath = path?.join('/') ?? '';

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // POST /api/f5/assess
  if (subpath === 'assess') {
    const metadata = (body.metadata ?? {}) as Record<string, unknown>;
    const context = (body.context ?? {}) as Record<string, unknown>;
    const assessment = computeF5Assessment(metadata, context);
    return NextResponse.json({ success: true, assessment });
  }

  // POST /api/f5/bookmark/:id/assess
  const bookmarkAssessMatch = subpath.match(/^bookmark\/([^/]+)\/assess$/);
  if (bookmarkAssessMatch) {
    const bookmarkId = bookmarkAssessMatch[1];
    const metadata = (body.metadata ?? {}) as Record<string, unknown>;
    const assessmentContext = (body.context ?? {}) as Record<string, unknown>;
    const assessment = computeF5Assessment(metadata, assessmentContext);

    const { error } = await ctx.admin
      .schema('bookmarks')
      .from('bookmarks')
      .update({
        confidence_scores: assessment,
        intelligence_level: assessment.overallScore >= 80 ? 4 : assessment.overallScore >= 60 ? 3 : 2,
        processing_status: 'assessed',
      })
      .eq('id', bookmarkId)
      .eq('user_id', ctx.userId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
    }

    return NextResponse.json({ success: true, assessment });
  }

  // POST /api/f5/validate
  if (subpath === 'validate') {
    const metadata = (body.metadata ?? {}) as Record<string, unknown>;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!metadata.url) errors.push('URL is required');
    if (!metadata.title) warnings.push('Title is missing');
    if (!metadata.description) warnings.push('Description is missing');

    return NextResponse.json({
      success: true,
      validation: { isValid: errors.length === 0, errors, warnings },
    });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
