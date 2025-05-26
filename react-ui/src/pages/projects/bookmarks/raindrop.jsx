import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Loader, Text, Group, Stack, Title, Container } from '@mantine/core';
import { IconLink, IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../contexts/AuthContext';
import { api, API_BASE } from '../../../utils/apiClient';
import { useLocation } from 'react-router-dom';

const Raindrop = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [initializing, setInitializing] = useState(true);
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
        const response = await api.get('/raindrop/verify');
        setIsConnected(response.isConnected);
        
        if (response.isConnected) {
          await fetchBookmarks();
        }
      } catch (error) {
        setIsConnected(false);
        console.error('Error initializing Raindrop:', error);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [user]);



  const checkConnectionStatus = async () => {
    try {
      const response = await api.get('/raindrop/verify');
      setIsConnected(response.isConnected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/raindrop/bookmarks');
      // console.log('Fetched bookmarks response:', response);
      // console.log('Bookmarks array:', response.bookmarks);
      
      // Ensure we're setting an array
      if (response && response.bookmarks && Array.isArray(response.bookmarks)) {
        setBookmarks(response.bookmarks);
      } else {
        console.error('Invalid bookmarks response:', response);
        setBookmarks([]);
      }
    } catch (error) {
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
        console.error('Error fetching bookmarks:', error);
      }
      setBookmarks([]); // Ensure bookmarks is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await api.get('/raindrop/oauth/start');
      // Ensure we're using the full URL by checking if it starts with http
      const authUrl = response.authUrl.startsWith('http') 
        ? response.authUrl 
        : `${window.location.origin}${response.authUrl}`;
      window.location.href = authUrl;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to start Raindrop connection',
        color: 'red'
      });
      console.error('Error starting Raindrop connection:', error);
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
    } catch (error) {
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
        console.error('Error syncing bookmarks:', error);
      }
    } finally {
      setSyncing(false);
    }
  };

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" spacing="md">
          <Title order={2}>Please log in to access your Raindrop bookmarks</Title>
          <Button component="a" href="/login" variant="filled">
            Log In
          </Button>
        </Stack>
      </Container>
    );
  }

  if (initializing) {
    return (
      <Container size="xl" py="xl">
        <Group position="center" h={400}>
          <Loader size="xl" />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group position="apart" mb="xl">
        <Title order={1}>Raindrop Bookmarks</Title>
        <Group>
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              leftIcon={<IconLink size={16} />}
              variant="filled"
            >
              Connect Raindrop
            </Button>
          ) : (
            <Button
              leftIcon={<IconRefresh size={16} />}
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
        <Group position="center" h={400}>
          <Loader size="xl" />
        </Group>
      ) : (
        <Stack spacing="md">
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
                <Card key={bookmark.id || bookmark.raindrop_id} shadow="sm" p="lg" radius="md" withBorder>
                  <Stack spacing="xs">
                    <Text
                      component="a"
                      href={bookmark.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="lg"
                      weight={500}
                      color="blue"
                      style={{ textDecoration: 'none' }}
                    >
                      {bookmark.title}
                    </Text>
                    <Group spacing="xs">
                      {bookmark.tags && bookmark.tags.length > 0 && bookmark.tags.map((tag, index) => (
                        <Badge key={`${bookmark.id}-tag-${index}`} color="blue" variant="light">
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                </Card>
              ))}
            </div>
          ) : (
            <Text align="center" color="dimmed" size="lg" py="xl">
              {isConnected
                ? 'No bookmarks found. Try syncing your Raindrop account.'
                : 'Connect your Raindrop account to view your bookmarks.'}
            </Text>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default Raindrop;
