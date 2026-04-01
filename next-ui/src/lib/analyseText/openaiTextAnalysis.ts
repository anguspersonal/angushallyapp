export type OpenAiTextAnalysisResult =
  | { ok: true; analysis: string }
  | {
      ok: false;
      reason: 'not_configured' | 'network' | 'http_error' | 'parse_error' | 'empty_analysis';
    };

const OPENAI_CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';

export async function fetchOpenAiTextAnalysis(trimmedText: string): Promise<OpenAiTextAnalysisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: 'not_configured' };
  }

  let response: Response;
  try {
    response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
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
  } catch {
    return { ok: false, reason: 'network' };
  }

  if (!response.ok) {
    return { ok: false, reason: 'http_error' };
  }

  let data: { choices?: { message?: { content?: string } }[] };
  try {
    data = await response.json();
  } catch {
    return { ok: false, reason: 'parse_error' };
  }

  const analysis = data?.choices?.[0]?.message?.content;
  if (!analysis) {
    return { ok: false, reason: 'empty_analysis' };
  }

  return { ok: true, analysis };
}
