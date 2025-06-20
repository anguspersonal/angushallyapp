import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Loader, Text, Group, Stack, Title, Container, Box } from '@mantine/core';
import { IconLink, IconRefresh, IconBookmark } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/apiClient';
import Header from '../../../components/Header';
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

  const getSourceIcon = (sourceType) => {
    switch (sourceType) {
      case 'raindrop':
        return '🌧️';
      case 'manual':
        return '✏️';
      case 'instapaper':
        return '📱';
      case 'readwise':
        return '📚';
      default:
        return '🔗';
    }
  };

  const getSourceLabel = (sourceType) => {
    switch (sourceType) {
      case 'raindrop':
        return 'Raindrop';
      case 'manual':
        return 'Manual';
      case 'instapaper':
        return 'Instapaper';
      case 'readwise':
        return 'Readwise';
      default:
        return sourceType;
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
                  <Card key={bookmark.id} shadow="sm" p="lg" radius="md" withBorder>
                    <Stack spacing="xs">
                      <Group position="apart" align="flex-start">
                        <Text
                          component="a"
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="lg"
                          weight={500}
                          color="blue"
                          style={{ textDecoration: 'none', flex: 1 }}
                        >
                          {bookmark.title}
                        </Text>
                        <Badge 
                          color="gray" 
                          variant="light"
                          leftSection={getSourceIcon(bookmark.source_type)}
                        >
                          {getSourceLabel(bookmark.source_type)}
                        </Badge>
                      </Group>
                      
                      {bookmark.description && (
                        <Text size="sm" color="dimmed" lineClamp={2}>
                          {bookmark.description}
                        </Text>
                      )}
                      
                      {bookmark.site_name && (
                        <Text size="xs" color="dimmed">
                          {bookmark.site_name}
                        </Text>
                      )}
                      
                      <Group spacing="xs" mt="xs">
                        {bookmark.tags && bookmark.tags.length > 0 ? (
                          bookmark.tags.map((tag, index) => (
                            <Badge 
                              key={`${bookmark.id}-tag-${index}`} 
                              color="blue" 
                              variant="light"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                // TODO: Implement tag filtering
                                notifications.show({
                                  title: 'Tag Filter',
                                  message: `Filtering by tag: ${tag}`,
                                  color: 'blue'
                                });
                              }}
                            >
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <Text size="xs" color="dimmed" italic>
                            No tags
                          </Text>
                        )}
                      </Group>
                      
                      <Group position="apart" mt="xs">
                        <Text size="xs" color="dimmed">
                          {new Date(bookmark.created_at).toLocaleDateString()}
                        </Text>
                        <Group spacing="xs">
                          <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => {
                              // TODO: Implement tag editing
                              notifications.show({
                                title: 'Edit Tags',
                                message: 'Tag editing coming soon',
                                color: 'blue'
                              });
                            }}
                          >
                            Edit Tags
                          </Button>
                        </Group>
                      </Group>
                    </Stack>
                  </Card>
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