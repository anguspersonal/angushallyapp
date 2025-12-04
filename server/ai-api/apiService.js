const { createHttpClient } = require('../http/client');
const config = require('../config');

const openaiClient = createHttpClient({
  baseURL: config.openai.baseUrl,
  config: config.http,
});

async function analyzeText(text) {
  try {
    const completion = await openaiClient.post(
      '/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that provides structured analysis of text. Focus on key themes, sentiment, and main points.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${config.openai.apiKey}`,
        },
      }
    );

    return completion.data?.choices?.[0]?.message?.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

module.exports = {
  analyzeText,
};
