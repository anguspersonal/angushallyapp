import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const MAX_TEXT_LENGTH = 2000;

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { text } = (body as Record<string, unknown>) ?? {};

  if (typeof text !== 'string') {
    return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
  }

  const trimmedText = text.trim();

  if (!trimmedText) {
    return NextResponse.json({ error: 'Text input cannot be empty' }, { status: 400 });
  }

  if (trimmedText.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `Text input exceeds ${MAX_TEXT_LENGTH} characters` },
      { status: 413 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not configured');
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
  }

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that provides structured analysis of text. Focus on key themes, sentiment, and main points.',
          },
          {
            role: 'user',
            content: trimmedText,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });
  } catch (error) {
    console.error('OpenAI API request failed:', error);
    return NextResponse.json({ error: 'Failed to analyze text' }, { status: 500 });
  }

  if (!response.ok) {
    console.error('OpenAI API error response:', response.status, response.statusText);
    return NextResponse.json({ error: 'Failed to analyze text' }, { status: 500 });
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = await response.json();
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error);
    return NextResponse.json({ error: 'Failed to analyze text' }, { status: 500 });
  }

  const analysis = data?.choices?.[0]?.message?.content;

  if (!analysis) {
    console.error('Unexpected OpenAI response shape:', data);
    return NextResponse.json({ error: 'Failed to analyze text' }, { status: 500 });
  }

  return NextResponse.json({ analysis });
}
