import React, { useState, useEffect } from 'react';
import { Button, Loader, Text, Group, Stack, Title, Container, Box } from '@mantine/core';
import { IconLink, IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/apiClient';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/Header';
import BookmarkCard from './components/BookmarkCard';
import { Bookmark } from '../../../types/common';
import "../../../general.css";

interface RaindropVerifyResponse {
  isConnected: boolean;
}

interface RaindropBookmarksResponse {
  bookmarks: Bookmark[];
}

interface RaindropOAuthResponse {
  authUrl: string;
}

const Raindrops: React.FC = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const location = useLocation();

  // Debug state changes
  useEffect(() => {
    // console.log('Bookmarks state updated:', bookmarks);
  }, [bookmarks]);

  // Check for OAuth callback in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const error = params.get('error');

    if (success === 'true') {
      notifications.show({
        title: 'Success',
        message: 'Raindrop connected successfully',
        color: 'green'
      });
      setIsConnected(true);
      fetchBookmarks();
      // Clean up URL
      window.history.replaceState({}, document.title, '/projects/bookmarks/raindrop');
    } else if (error) {
      let errorMessage = 'Failed to connect Raindrop';
      switch (error) {
        case 'missing_params':
          errorMessage = 'Missing required parameters';
          break;
        case 'state_expired':
          errorMessage = 'Authentication session expired';
          break;
        case 'invalid_state':
          errorMessage = 'Invalid authentication state';
          break;
        case 'invalid_token':
          errorMessage = 'Invalid authentication token';
          break;
        case 'token_exchange_failed':
          errorMessage = 'Failed to exchange authentication token';
          break;
        default:
          errorMessage = `Failed to connect Raindrop: ${error}`;
      }
      
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red'
      });
      // Clean up URL
      window.history.replaceState({}, document.title, '/projects/bookmarks/raindrop');
    }
  }, [location]);

  // Initialize connection status and load bookmarks if connected
  useEffect(() => {
    const initialize = async () => {
      if (!user) return;
      
      try {
        setInitializing(true);
        const response = await api.get('/raindrop/verify') as RaindropVerifyResponse;
        setIsConnected(response.isConnected);
        
        if (response.isConnected) {
          await fetchBookmarks();
        }
      } catch (error: any) {
        setIsConnected(false);
        console.error('Error initializing Raindrop:', error);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [user]);

  const fetchBookmarks = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/raindrop/bookmarks') as RaindropBookmarksResponse;
      
      if (response && response.bookmarks && Array.isArray(response.bookmarks)) {
        setBookmarks(response.bookmarks);
      } else {
        setBookmarks([]);
      }
    } catch (error: any) {
      if (error.status === 401) {
        notifications.show({
          title: 'Error',
          message: 'Please connect your Raindrop account first',
          color: 'red'
        });
        setIsConnected(false);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to fetch bookmarks',
          color: 'red'
        });
      }
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await api.get('/raindrop/oauth/start');
      window.location.href = response.authUrl;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to start Raindrop connection',
        color: 'red'
      });
      // console.error('Error starting Raindrop connection:', error);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.post('/raindrop/sync');
      notifications.show({
        title: 'Success',
        message: 'Bookmarks synced successfully',
        color: 'green'
      });
      fetchBookmarks();
    } catch (error: any) {
      if (error.status === 401) {
        notifications.show({
          title: 'Error',
          message: 'Please connect your Raindrop account first',
          color: 'red'
        });
        setIsConnected(false);
      } else {
        notifications.show({
          title: 'Error',
          message: 'Failed to sync bookmarks',
          color: 'red'
        });
        // console.error('Error syncing bookmarks:', error);
      }
    } finally {
      setSyncing(false);
    }
  };

  if (!user) {
    return (
      <Box>
        <Header />
        <Container size="sm" py="xl">
          <Stack align="center" gap="md">
            <Title order={2}>Please log in to access your Raindrop bookmarks</Title>
            <Button component="a" href="/login" variant="filled">
              Log In
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  if (initializing) {
    return (
      <Box>
        <Header />
        <Container size="xl" py="xl">
          <Group justify="center" h={400}>
            <Loader size="xl" />
          </Group>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Header />
      <Container size="xl" py="xl">
        <Group justify="space-between" mb="xl">
          <Title order={1}>Raindrop Bookmarks</Title>
          <Group>
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                leftSection={<IconLink size={16} />}
                variant="filled"
              >
                Connect Raindrop
              </Button>
            ) : (
              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={handleSync}
                loading={syncing}
                variant="light"
              >
                Sync Bookmarks
              </Button>
            )}
          </Group>
        </Group>

        {loading ? (
          <Group justify="center" h={400}>
            <Loader size="xl" />
          </Group>
        ) : (
          <Stack gap="md">
            {/* console.log('Rendering bookmarks:', bookmarks, 'Length:', bookmarks.length) */}
            {/* console.log('Is array?', Array.isArray(bookmarks)) */}
            {/* console.log('First bookmark:', bookmarks[0]) */}
            
            {/* Debug info - commented out for production
            <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
              <p>Debug Info:</p>
              <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
              <p>Bookmarks count: {bookmarks.length}</p>
              <p>Bookmarks type: {typeof bookmarks}</p>
              <p>Is Array: {Array.isArray(bookmarks) ? 'Yes' : 'No'}</p>
            </div>
            */}
            
            {bookmarks && bookmarks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {bookmarks.map((bookmark) => (
                  <BookmarkCard 
                    key={bookmark.id} 
                    bookmark={bookmark}
                  />
                ))}
              </div>
            ) : (
              <Text ta="center" color="dimmed" size="lg" py="xl">
                {isConnected
                  ? 'No bookmarks found. Try syncing your Raindrop account.'
                  : 'Connect your Raindrop account to view your bookmarks.'}
              </Text>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default Raindrops; 