'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Textarea,
  Button,
  Group,
  Box,
  Alert,
  LoadingOverlay,
  Stack,
  Card,
  Badge,
} from '@mantine/core';
import { IconAlertCircle, IconBrain, IconBookmark } from '@tabler/icons-react';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  readingTime: number;
  complexity: 'simple' | 'moderate' | 'complex';
}

export default function InstapaperPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async () => {
    if (!input.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // TODO: Implement actual Instapaper API integration
      // For now, this is a placeholder that simulates analysis
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis result
      const mockResult: AnalysisResult = {
        summary: "This appears to be a placeholder for Instapaper content analysis. The actual implementation would integrate with Instapaper's API to fetch saved articles and analyze them using OpenAI's GPT model.",
        keyPoints: [
          "Instapaper integration is planned but not yet implemented",
          "Would analyze saved articles for key insights",
          "Would provide reading time estimates and complexity analysis",
          "Would integrate with the existing bookmark system"
        ],
        sentiment: 'neutral',
        readingTime: 3,
        complexity: 'moderate'
      };

      setResult(mockResult);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'success';
      case 'negative': return 'dark';
      default: return 'primary';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'success';
      case 'moderate': return 'accent';
      case 'complex': return 'dark';
      default: return 'primary';
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Box ta="center">
          <Title order={1} mb="md">
            <IconBookmark size={32} style={{ marginRight: 8 }} />
            Instapaper Analysis
          </Title>
          <Text c="secondary" size="lg">
            Analyze your Instapaper articles using AI to extract key insights and summaries
          </Text>
        </Box>

        {/* Input Section */}
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Article Content</Title>
            <Text c="secondary" size="sm">
              Paste the content of an Instapaper article to analyze it with AI
            </Text>
            
            <Textarea
              placeholder="Paste your Instapaper article content here..."
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              minRows={8}
              maxRows={15}
              autosize
            />

            <Group justify="center">
              <Button
                onClick={analyzeText}
                loading={loading}
                leftSection={<IconBrain size={16} />}
                size="lg"
                disabled={!input.trim()}
              >
                Analyze with AI
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Analysis Error"
            color="dark"
            variant="light"
          >
            {error}
          </Alert>
        )}

        {/* Results Section */}
        {result && (
          <Paper p="xl" radius="md" withBorder>
            <LoadingOverlay visible={loading} />
            
            <Stack gap="lg">
              <Title order={3}>Analysis Results</Title>

              {/* Summary */}
              <Card withBorder>
                <Title order={4} mb="md">Summary</Title>
                <Text>{result.summary}</Text>
              </Card>

              {/* Key Points */}
              <Card withBorder>
                <Title order={4} mb="md">Key Points</Title>
                <Stack gap="xs">
                  {result.keyPoints.map((point, index) => (
                    <Text key={index} style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <span style={{ marginRight: 8, marginTop: 2 }}>•</span>
                      {point}
                    </Text>
                  ))}
                </Stack>
              </Card>

              {/* Metrics */}
              <Group gap="md">
                <Badge
                  color={getSentimentColor(result.sentiment)}
                  variant="light"
                  size="lg"
                >
                  Sentiment: {result.sentiment}
                </Badge>
                <Badge
                  color={getComplexityColor(result.complexity)}
                  variant="light"
                  size="lg"
                >
                  Complexity: {result.complexity}
                </Badge>
                <Badge color="primary" variant="light" size="lg">
                  Reading Time: ~{result.readingTime} min
                </Badge>
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Future Features Info */}
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3} c="primary">Coming Soon</Title>
            <Text>
                             This feature will integrate with Instapaper's API to automatically fetch your saved articles 
              and provide AI-powered analysis including:
            </Text>
            <Stack gap="xs">
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>•</span>
                Automatic article fetching from Instapaper
              </Text>
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>•</span>
                Content summarization and key point extraction
              </Text>
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>•</span>
                Reading time estimation and complexity analysis
              </Text>
              <Text style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: 8 }}>•</span>
                Integration with the bookmark management system
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
} 