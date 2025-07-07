import { api } from '../../../utils/apiClient';
export async function analyzeText(input: string) {
  try {
    const response = await api.post('/analyseText', { text: input });
    return response.analysis;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
} 