// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Text, Button, Group, Loader, Alert, Badge } from '@mantine/core';
import { IconCheck, IconX, IconBookmark, IconExternalLink } from '@tabler/icons-react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/apiClient';

/**
 * ShareHandler - Handles PWA Share Target requests
 * 
 * This component processes content shared from other apps via the native share menu.
 * The PWA manifest.json defines this route as the share_target action.
 * 
 * Flow:
 * 1. User shares URL from another app (Instagram, Safari, etc.)
 * 2. Native share menu shows "AH App" option
 * 3. User taps "AH App"
 * 4. Browser/PWA opens this route with form data
 * 5. Component extracts data and sends to backend API
 * 6. Shows success/error message and option to view bookmarks
 */
const ShareHandler = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error', 'auth_required'
  const [bookmarkData, setBookmarkData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated) {
      console.log('🔐 Share target requires authentication');
      setStatus('auth_required');
      return;
    }

    // Extract shared content from URL parameters
    const url = searchParams.get('url');
    const text = searchParams.get('text');
    const title = searchParams.get('title');

    console.log('📱 Processing shared content:', { url, text, title });

    if (!url) {
      console.error('❌ No URL provided in share target');
      setError('No URL was shared. Please try sharing again.');
      setStatus('error');
      return;
    }

    // Process the shared content
    processSharedContent({ url, text, title });
  }, [isAuthenticated, searchParams]);

  const processSharedContent = async (shareData) => {
    try {
      console.log('🔄 Sending shared content to backend...');
      
      const response = await api.post('/bookmarks/share', {
        url: shareData.url,
        text: shareData.text,
        title: shareData.title
      });

      if (response.data.success) {
        console.log('✅ Share target bookmark created:', response.data.bookmark);
        setBookmarkData(response.data.bookmark);
        setStatus('success');
      } else {
        throw new Error(response.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('❌ Share target failed:', error);
      
      if (error.response?.status === 401) {
        setStatus('auth_required');
      } else {
        setError(error.response?.data?.details || error.message || 'Failed to save bookmark');
        setStatus('error');
      }
    }
  };

  const handleViewBookmarks = () => {
    navigate('/projects/bookmarks');
  };

  const handleTryAgain = () => {
    setStatus('processing');
    setError('');
    
    // Re-extract and process the shared content
    const url = searchParams.get('url');
    const text = searchParams.get('text');
    const title = searchParams.get('title');
    
    if (url) {
      processSharedContent({ url, text, title });
    }
  };

  const handleLogin = () => {
    // Store the current URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', window.location.href);
    navigate('/login');
  };

  // Authentication required state
  if (status === 'auth_required') {
    return (
      <Container size="sm" style={{ paddingTop: '2rem' }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group spacing="sm" style={{ marginBottom: '1rem' }}>
            <IconBookmark size={24} color="#1976d2" />
            <Text size="lg" weight={600}>Authentication Required</Text>
          </Group>
          
          <Text color="dimmed" style={{ marginBottom: '1.5rem' }}>
            You need to be logged in to save bookmarks. Please sign in to continue.
          </Text>
          
          <Group>
            <Button onClick={handleLogin} variant="filled">
              Sign In
            </Button>
            <Button onClick={() => navigate('/')} variant="light">
              Go Home
            </Button>
          </Group>
        </Card>
      </Container>
    );
  }

  // Processing state
  if (status === 'processing') {
    return (
      <Container size="sm" style={{ paddingTop: '2rem' }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group spacing="sm" style={{ marginBottom: '1rem' }}>
            <Loader size="sm" />
            <Text size="lg" weight={600}>Saving Bookmark...</Text>
          </Group>
          
          <Text color="dimmed">
            Processing your shared content and enriching with metadata.
          </Text>
        </Card>
      </Container>
    );
  }

  // Success state
  if (status === 'success' && bookmarkData) {
    return (
      <Container size="sm" style={{ paddingTop: '2rem' }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Alert
            icon={<IconCheck size="1rem" />}
            title="Bookmark Saved Successfully!"
            color="green"
            style={{ marginBottom: '1rem' }}
          >
            Your content has been saved to your knowledge base.
          </Alert>
          
          <Group spacing="sm" style={{ marginBottom: '1rem' }}>
            <IconBookmark size={20} />
            <Text weight={600} style={{ flex: 1 }}>{bookmarkData.title}</Text>
            {bookmarkData.enriched && (
              <Badge color="blue" variant="light" size="sm">
                AI Enhanced
              </Badge>
            )}
          </Group>
          
          <Text size="sm" color="dimmed" style={{ marginBottom: '1.5rem' }}>
            {bookmarkData.url}
          </Text>
          
          <Group>
            <Button onClick={handleViewBookmarks} variant="filled" leftIcon={<IconBookmark size="1rem" />}>
              View All Bookmarks
            </Button>
            <Button 
              onClick={() => window.open(bookmarkData.url, '_blank')} 
              variant="light" 
              leftIcon={<IconExternalLink size="1rem" />}
            >
              Open Link
            </Button>
          </Group>
        </Card>
      </Container>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <Container size="sm" style={{ paddingTop: '2rem' }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Alert
            icon={<IconX size="1rem" />}
            title="Failed to Save Bookmark"
            color="red"
            style={{ marginBottom: '1rem' }}
          >
            {error}
          </Alert>
          
          <Group>
            <Button onClick={handleTryAgain} variant="filled">
              Try Again
            </Button>
            <Button onClick={handleViewBookmarks} variant="light">
              View Bookmarks
            </Button>
          </Group>
        </Card>
      </Container>
    );
  }

  // Fallback state
  return (
    <Container size="sm" style={{ paddingTop: '2rem' }}>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text>Loading...</Text>
      </Card>
    </Container>
  );
};

export default ShareHandler; 