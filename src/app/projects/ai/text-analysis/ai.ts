import { api } from '@/shared/apiClient';

export async function analyzeText(input: string) {
  try {
    const response = await api.post('/analyseText', { text: input }) as any;
    return response.analysis;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
} 