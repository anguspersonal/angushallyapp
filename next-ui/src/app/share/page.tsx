'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Title, Text, Loader, Alert, Button, Paper, Stack } from '@mantine/core';
import { IconCheck, IconX, IconShare } from '@tabler/icons-react';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../shared/apiClient';

interface ShareData {
  url?: string;
  title?: string;
  text?: string;
}

export default function SharePage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'unauthorized'>('processing');
  const [message, setMessage] = useState('');
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    const handleShare = async () => {
      try {
        // Check if user is authenticated
        if (!user) {
          setStatus('unauthorized');
          setMessage('Please log in to save shared content');
          return;
        }

        // Extract shared data from URL parameters or form data
        const url = searchParams.get('url') || '';
        const title = searchParams.get('title') || '';
        const text = searchParams.get('text') || '';

        if (!url) {
          setStatus('error');
          setMessage('No URL provided in shared content');
          return;
        }

        setShareData({ url, title, text });

        // Use the share API route that handles form data properly
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            url,
            title: title || text,
            text
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Content saved successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || data.error || 'Failed to save content');
        }

      } catch (error) {
        console.error('Share processing error:', error);
        setStatus('error');
        setMessage('Failed to process shared content. Please try again.');
      }
    };

    handleShare();
  }, [user, searchParams]);

  const handleRedirect = () => {
    router.push('/projects/bookmarks');
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text>Processing shared content...</Text>
          </Stack>
        );

      case 'success':
        return (
          <Stack align="center" gap="md">
            <IconCheck size={48} style={{ color: 'green' }} />
            <Title order={2} style={{ color: 'green' }}>Success!</Title>
            <Text ta="center">{message}</Text>
            {shareData && (
              <Paper p="md" withBorder style={{ maxWidth: '400px', width: '100%' }}>
                <Text size="sm" fw={500}>Saved Content:</Text>
                <Text size="sm" style={{ color: 'gray' }} truncate>{shareData.title || shareData.url}</Text>
                {shareData.url && (
                  <Text size="xs" style={{ color: 'gray' }} truncate>{shareData.url}</Text>
                )}
              </Paper>
            )}
            <Button onClick={handleRedirect} leftSection={<IconShare size={16} />}>
              View Bookmarks
            </Button>
          </Stack>
        );

      case 'error':
        return (
          <Stack align="center" gap="md">
            <IconX size={48} style={{ color: 'red' }} />
            <Title order={2} style={{ color: 'red' }}>Error</Title>
            <Text ta="center">{message}</Text>
            <Button onClick={handleRedirect} variant="outline">
              Go to Bookmarks
            </Button>
          </Stack>
        );

      case 'unauthorized':
        return (
          <Stack align="center" gap="md">
            <IconX size={48} style={{ color: 'orange' }} />
            <Title order={2} style={{ color: 'orange' }}>Authentication Required</Title>
            <Text ta="center">{message}</Text>
            <Button onClick={() => router.push('/login')}>
              Log In
            </Button>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder>
        {renderContent()}
      </Paper>
    </Container>
  );
} 