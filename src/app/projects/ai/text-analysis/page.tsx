'use client';

import { useState } from 'react';
import {
  Container,
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Box,
  LoadingOverlay,
} from '@mantine/core';
import { analyzeText } from './ai';

export default function TextAnalysisAIPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const result = await analyzeText(input);
      setResponse(result);
    } catch (error: any) {
      if (error.status === 401) {
        setResponse('Please log in to use the AI Text Analysis feature.');
      } else {
        setResponse('Error: Failed to analyze text. Please try again.');
      }
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Container py="xl">
        <Title order={1} ta="center" mb="xl">
          AI Text Analysis
        </Title>
        <Paper p="md" radius="md" withBorder>
          <LoadingOverlay visible={loading} />

          <TextInput
            placeholder="Add input here"
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            mb="md"
            size="lg"
          />

          <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleSubmit} disabled={!input.trim() || loading}>
              Analyze
            </Button>
          </Box>

          {response && (
            <Paper mt="xl" p="md" withBorder>
              <Title order={3} mb="md">
                Analysis Result
              </Title>
              <Text>{response}</Text>
            </Paper>
          )}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '2em' }}>
            <a href="/projects/ai" style={{ color: 'var(--primary-color)', textDecoration: 'underline', fontWeight: 500 }}>
              ← Back to AI Projects
            </a>
          </div>
        </Paper>
      </Container>
    </Box>
  );
} 