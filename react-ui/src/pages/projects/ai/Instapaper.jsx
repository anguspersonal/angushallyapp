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
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/Header';
import '../../../general.css';

export default function TextAnalysisAI() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const result = await analyzeText(input);
      setResponse(result);
    } catch (error) {
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
      <Header />
      <Container py="xl">
        <Title order={1} align="center" mb="xl">
          Work in Progress
        </Title>
        <Paper p="md" radius="md" withBorder>
          <LoadingOverlay visible={loading} overlayBlur={2} />

          
        </Paper>
      </Container>
    </Box>
  );
} 