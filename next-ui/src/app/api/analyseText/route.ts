import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { fetchOpenAiTextAnalysis } from '@/lib/analyseText/openaiTextAnalysis';
import { nextResponseForOpenAiFailure } from '@/lib/analyseText/openAiRouteResponse';
import { validateAnalyseTextBody } from '@/lib/analyseText/validateAnalyseTextBody';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const parsed = validateAnalyseTextBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const { text: trimmedText } = parsed.data;

  const result = await fetchOpenAiTextAnalysis(trimmedText);
  if (!result.ok) {
    return nextResponseForOpenAiFailure(result);
  }

  return NextResponse.json({ analysis: result.analysis });
}
