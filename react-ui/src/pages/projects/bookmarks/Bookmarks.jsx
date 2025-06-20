import React, { useState, useEffect } from 'react';
import { Button, Loader, Text, Group, Stack, Title, Container, Box } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/apiClient';
import Header from '../../../components/Header';
import BookmarkCard from './components/BookmarkCard';
import "../../../general.css";

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      if (!user) return;
      
      try {
        setInitializing(true);
        await fetchBookmarks();
      } catch (error) {
        console.error('Error initializing bookmarks:', error);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookmarks');
      
      if (response && response.bookmarks && Array.isArray(response.bookmarks)) {
        setBookmarks(response.bookmarks);
        
        // Check if automatic transfer occurred and notify user
        if (response._metadata && response._metadata.autoTransfer) {
          const stats = response._metadata.transferStats;
          notifications.show({
            title: '📚 Bookmarks Automatically Imported!',
            message: `Successfully imported ${stats.success} bookmarks from Raindrop with enhanced metadata (${stats.enrichmentStats.enriched} enriched with images and descriptions)`,
            color: 'green',
            autoClose: 8000
          });
        }
      } else {
        setBookmarks([]);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch bookmarks',
        color: 'red'
      });
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box>
        <Header />
        <Container size="sm" py="xl">
          <Stack align="center" spacing="md">
            <Title order={2}>Please log in to access your bookmarks</Title>
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
          <Group position="center" h={400}>
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
        <Group position="apart" mb="xl">
          <Title order={1}>My Bookmarks</Title>
          <Group>
            <Button
              leftIcon={<IconRefresh size={16} />}
              onClick={fetchBookmarks}
              loading={loading}
              variant="light"
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {loading ? (
          <Group position="center" h={400}>
            <Loader size="xl" />
          </Group>
        ) : (
          <Stack spacing="md">
            {bookmarks && bookmarks.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {bookmarks.map((bookmark) => (
                  <BookmarkCard 
                    key={bookmark.id} 
                    bookmark={bookmark}
                    onRefresh={fetchBookmarks}
                  />
                ))}
              </div>
            ) : (
              <Text align="center" color="dimmed" size="lg" py="xl">
                No bookmarks found. Connect your Raindrop account or add bookmarks manually.
              </Text>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default Bookmarks; 