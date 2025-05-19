import axios from 'axios';

export async function analyzeText(input) {
  try {
    const response = await axios.post('/api/ai/analyze', { text: input });
    return response.data.analysis;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
} 