'use client';

import React, { useState } from 'react';
import { Container, Title, Text, Button, TextInput, Textarea, Paper, Stack } from '@mantine/core';
import { IconShare } from '@tabler/icons-react';

export default function ShareTestPage() {
  const [url, setUrl] = useState('https://example.com/test-article');
  const [title, setTitle] = useState('Test Article Title');
  const [text, setText] = useState('This is a test description for the shared content');

  const handleTestShare = async () => {
    try {
      // Simulate the share target POST request
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          url,
          title,
          text
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Success: ${data.message}`);
      } else {
        alert(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test share error:', error);
      alert('Test failed - check console for details');
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="xl">Share Target Test</Title>
      
      <Paper p="xl" withBorder>
        <Stack gap="md">
          <Text size="sm" style={{ color: 'gray' }}>
            This page simulates the PWA share target functionality. 
            Use it to test the share target without needing to install the PWA.
          </Text>

          <TextInput
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
          />

          <TextInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
          />

          <Textarea
            label="Text/Description"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Article description or shared text"
            rows={3}
          />

          <Button 
            onClick={handleTestShare}
            leftSection={<IconShare size={16} />}
            size="lg"
          >
            Test Share Target
          </Button>
        </Stack>
      </Paper>

      <Paper p="xl" withBorder mt="xl">
        <Title order={3} mb="md">How to Test on Android</Title>
        <Stack gap="sm">
          <Text size="sm">1. Install the PWA on your Android device</Text>
          <Text size="sm">2. Open Instagram and find a reel</Text>
          <Text size="sm">3. Tap the Share button</Text>
          <Text size="sm">4. Look for "AH App" in the share options</Text>
          <Text size="sm">5. Tap it to share the content</Text>
          <Text size="sm">6. The content should be saved to your bookmarks</Text>
        </Stack>
      </Paper>
    </Container>
  );
} 