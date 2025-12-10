const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function generateChanges() {
  const improvement = JSON.parse(process.env.IMPROVEMENT);
  
  // Read relevant files for context
  const contextFiles = improvement.files || [];
  let context = '';
  for (const file of contextFiles) {
    if (fs.existsSync(file)) {
      context += `\n\n=== ${file} ===\n${fs.readFileSync(file, 'utf8')}`;
    }
  }
  
  const prompt = `You are helping implement the following improvement:

Title: ${improvement.title}
Description: ${improvement.description}
Files to modify: ${improvement.files?.join(', ') || 'Not specified'}

Current code context:${context}

Please provide:
1. The exact file changes needed (as a JSON array)
2. A brief explanation of what you did

Format your response as JSON:
{
  "changes": [
    {
      "path": "path/to/file.js",
      "content": "full new content of the file"
    }
  ],
  "explanation": "Brief explanation of changes"
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const responseText = message.content[0].text;
  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                   responseText.match(/({[\s\S]*})/);
  
  if (jsonMatch) {
    const result = JSON.parse(jsonMatch[1]);
    fs.writeFileSync('changes.json', JSON.stringify(result, null, 2));
    console.log('Changes generated successfully');
  } else {
    throw new Error('Could not parse JSON response from Claude');
  }
}

generateChanges().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
