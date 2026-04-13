import { NextResponse } from 'next/server';
import type { OpenAiTextAnalysisResult } from './openaiTextAnalysis';

export function nextResponseForOpenAiFailure(
  result: Extract<OpenAiTextAnalysisResult, { ok: false }>
): NextResponse {
  switch (result.reason) {
    case 'not_configured':
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
    case 'network':
      console.error('OpenAI API request failed');
      break;
    case 'http_error':
      console.error('OpenAI API error response');
      break;
    case 'parse_error':
      console.error('Failed to parse OpenAI response');
      break;
    case 'empty_analysis':
      console.error('Unexpected OpenAI response shape');
      break;
  }
  return NextResponse.json({ error: 'Failed to analyze text' }, { status: 500 });
}
