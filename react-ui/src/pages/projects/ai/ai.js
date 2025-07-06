import { api } from '../../../utils/apiClient.ts';

export async function analyzeText(input) {
  try {
    const response = await api.post('/analyseText', { text: input });
    return response.analysis;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
} 