'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Loader, Text, Group, Stack, Title, Container, Card, Badge, Paper, SimpleGrid } from '@mantine/core';
import { IconRefresh, IconTrendingUp, IconBolt, IconUsers, IconBook, IconArrowRight, IconBrain } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../providers/AuthProvider';
import { api } from '../../../shared/apiClient';
import BookmarkCard from './components/BookmarkCard';
import { Sidebar } from './components/Sidebar';
import InstagramEnhancer from '../../../components/InstagramIntelligence/InstagramEnhancer';
import InstagramAnalysisDisplay from '../../../components/InstagramIntelligence/InstagramAnalysisDisplay';
import { 
  Bookmark, 
  InstagramAnalysisData, 
  BookmarkData, 
  BookmarkApiResponse, 
  InstagramAnalysisHistoryResponse,
  InstagramAnalysisHistoryItem 
} from '../../../types/common';

type NavigationItemId = 'dashboard' | 'bookmarks' | 'search' | 'sync' | 'tags' | 'trending' | 'analytics' | 'archive' | 'settings';

const BookmarksPage = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [activeView, setActiveView] = useState<NavigationItemId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    thisWeek: 0,
    knowledgeScore: 0,
    connections: 0
  });
  const [instagramEnhancerOpened, setInstagramEnhancerOpened] = useState(false);
  const [analysisDisplayOpened, setAnalysisDisplayOpened] = useState(false);
  const [selectedAnalysisData, setSelectedAnalysisData] = useState<InstagramAnalysisData | null>(null);
  const [selectedBookmarkData, setSelectedBookmarkData] = useState<BookmarkData | null>(null);

  // Mock insights data - in real implementation, this would come from API
  const mockInsights = [
    {
      id: 1,
      title: 'Tech Articles Trending',
      description: 'You\'ve saved 5 JavaScript articles this week. Consider creating a coding study plan.',
      relevance: 0.89,
      actionable: true,
      category: 'learning'
    },
    {
      id: 2,
      title: 'Reading Pattern Alert',
      description: 'Most of your bookmarks are from morning hours. Evening reading might help retention.',
      relevance: 0.73,
      actionable: true,
      category: 'habits'
    },
    {
      id: 3,
      title: 'Knowledge Connections',
      description: 'Your recent React and Node.js saves could form a full-stack learning path.',
      relevance: 0.92,
      actionable: true,
      category: 'connections',
      icon: IconBolt,
      color: 'secondary'
    }
  ];

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await api.get<BookmarkApiResponse>('/bookmarks');
      
      if (response && response.bookmarks && Array.isArray(response.bookmarks)) {
        setBookmarks(response.bookmarks);
        
        // Check if automatic transfer occurred and notify user
        if (response._metadata && response._metadata.autoTransfer && response._metadata.transferStats) {
          const stats = response._metadata.transferStats;
          notifications.show({
            title: '📚 Bookmarks Automatically Imported!',
            message: `Successfully imported ${stats.success} bookmarks from Raindrop with enhanced metadata (${stats.enrichmentStats.enriched} enriched with images and descriptions)`,
            color: 'success',
            autoClose: 8000
          });
        }
      } else {
        setBookmarks([]);
      }
    } catch (_error: unknown) { // eslint-disable-line @typescript-eslint/no-unused-vars
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch bookmarks',
        color: 'dark'
      });
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = useCallback(() => {
    const totalItems = bookmarks.length;
    const thisWeek = bookmarks.filter(bookmark => {
      const created = new Date(bookmark.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length;
    
    // Mock calculations for knowledge score and connections
    const knowledgeScore = Math.min(totalItems * 2 + thisWeek * 5, 100);
    const connections = Math.floor(totalItems * 0.3);

    setStats({
      totalItems,
      thisWeek,
      knowledgeScore,
      connections
    });
  }, [bookmarks]);

  useEffect(() => {
    const initialize = async () => {
      if (!user) return;
      
      try {
        setInitializing(true);
        await fetchBookmarks();
        calculateStats();
      } catch (error: unknown) {
        console.error('Error initializing bookmarks:', error);
      } finally {
        setInitializing(false);
      }
    };

    initialize();
  }, [user, calculateStats]);

  useEffect(() => {
    calculateStats();
  }, [bookmarks, calculateStats]);

  const handleViewChange = (view: NavigationItemId) => {
    setActiveView(view);
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const getInsightColor = (category: string) => {
    switch (category) {
      case 'learning': return 'primary';
      case 'habits': return 'success';
      case 'connections': return 'secondary';
      default: return 'dark';
    }
  };

  const handleInstagramAnalysisClick = async (bookmark: Bookmark) => {
    try {
      // Fetch the analysis data for this bookmark
      const response = await api.get<InstagramAnalysisHistoryResponse>(`/instagram-intelligence/history?limit=50`);
      
      if (response.success && response.data.history) {
        // Find analysis for this specific URL
        const analysis = response.data.history.find((item: InstagramAnalysisHistoryItem) => 
          item.instagram_url === bookmark.url
        );
        
        if (analysis) {
          setSelectedAnalysisData({
            analysis: JSON.parse(analysis.analysis_result),
            metadata: JSON.parse(analysis.metadata)
          });
          // Convert Bookmark to BookmarkData format
          const bookmarkData: BookmarkData = {
            id: String(bookmark.id),
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description
          };
          setSelectedBookmarkData(bookmarkData);
          setAnalysisDisplayOpened(true);
        } else {
          notifications.show({
            title: 'No Analysis Found',
            message: 'No Instagram analysis found for this bookmark. Try enhancing it first.',
            color: 'dark'
          });
        }
      }
    } catch (error: unknown) {
      console.error('Error fetching Instagram analysis:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch Instagram analysis',
        color: 'dark'
      });
    }
  };

  const handleEnhancementComplete = (_bookmarkId: string, _analysisData: unknown) => {
    // Refresh bookmarks to show updated data
    fetchBookmarks();
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'bookmarks':
        return renderAllBookmarks();
      case 'search':
        return renderSearch();
      case 'sync':
        return renderSync();
      case 'tags':
        return renderTags();
      case 'trending':
        return renderTrending();
      case 'analytics':
        return renderAnalytics();
      case 'archive':
        return renderArchive();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    return (
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Title order={1} size="h2">Bookmark Dashboard</Title>
            <Text size="sm" style={{ color: 'var(--mantine-color-gray-6)' }}>
              Your knowledge hub with {stats.totalItems} saved resources
            </Text>
          </Stack>
          <Group gap="sm">
            <Button
              leftSection={<IconBrain size={16} />}
              onClick={() => setInstagramEnhancerOpened(true)}
              variant="light"
            >
              Instagram Intelligence
            </Button>
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={fetchBookmarks}
              loading={loading}
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <Card shadow="sm" p="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group gap="sm">
                <IconBook size={24} color="var(--mantine-color-blue-6)" />
                <Stack gap={0}>
                  <Text size="lg" fw={700}>{stats.totalItems}</Text>
                  <Text size="sm" style={{ color: 'var(--mantine-color-gray-6)' }}>Total Bookmarks</Text>
                </Stack>
              </Group>
            </Stack>
          </Card>

          <Card shadow="sm" p="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group gap="sm">
                <IconTrendingUp size={24} color="var(--mantine-color-green-6)" />
                <Stack gap={0}>
                  <Text size="lg" fw={700}>{stats.thisWeek}</Text>
                  <Text size="sm" style={{ color: 'var(--mantine-color-gray-6)' }}>This Week</Text>
                </Stack>
              </Group>
            </Stack>
          </Card>

          <Card shadow="sm" p="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group gap="sm">
                <IconBolt size={24} color="var(--mantine-color-violet-6)" />
                <Stack gap={0}>
                  <Text size="lg" fw={700}>{stats.knowledgeScore}%</Text>
                  <Text size="sm" style={{ color: 'var(--mantine-color-gray-6)' }}>Knowledge Score</Text>
                </Stack>
              </Group>
            </Stack>
          </Card>

          <Card shadow="sm" p="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group gap="sm">
                <IconUsers size={24} color="var(--mantine-color-orange-6)" />
                <Stack gap={0}>
                  <Text size="lg" fw={700}>{stats.connections}</Text>
                  <Text size="sm" style={{ color: 'var(--mantine-color-gray-6)' }}>Connections</Text>
                </Stack>
              </Group>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Insights */}
        <Card shadow="sm" p="md" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3} size="h4">AI Insights</Title>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {mockInsights.map((insight) => (
                <Paper key={insight.id} p="md" radius="md" withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Badge color={getInsightColor(insight.category)} variant="light">
                        {insight.category}
                      </Badge>
                      <Text size="sm" fw={600}>{Math.round(insight.relevance * 100)}% relevant</Text>
                    </Group>
                    <Text size="sm" fw={600}>{insight.title}</Text>
                    <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>
                      {insight.description}
                    </Text>
                    {insight.actionable && (
                      <Button size="xs" variant="light" rightSection={<IconArrowRight size={12} />}>
                        Take Action
                      </Button>
                    )}
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>
        </Card>

        {/* Recent Bookmarks */}
        <Card shadow="sm" p="md" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3} size="h4">Recent Bookmarks</Title>
              <Button variant="light" size="sm" onClick={() => handleViewChange('bookmarks')}>
                View All
              </Button>
            </Group>
            {bookmarks.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {bookmarks.slice(0, 6).map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onInstagramAnalysisClick={handleInstagramAnalysisClick}
                  />
                ))}
              </SimpleGrid>
            ) : (
              <Text style={{ color: 'var(--mantine-color-gray-6)' }} ta="center" py="xl">
                No bookmarks yet. Start saving your favorite content!
              </Text>
            )}
          </Stack>
        </Card>
      </Stack>
    );
  };

  const renderAllBookmarks = () => (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2} size="h3">All Bookmarks</Title>
        <Button leftSection={<IconRefresh size={16} />} onClick={fetchBookmarks} loading={loading}>
          Refresh
        </Button>
      </Group>
      {bookmarks.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
          {bookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              onInstagramAnalysisClick={handleInstagramAnalysisClick}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Text style={{ color: 'var(--mantine-color-gray-6)' }} ta="center" py="xl">
          No bookmarks found.
        </Text>
      )}
    </Stack>
  );

  const renderSearch = () => (
    <Text>Search functionality coming soon...</Text>
  );

  const renderSync = () => (
    <Text>Sync functionality coming soon...</Text>
  );

  const renderTags = () => (
    <Text>Tags functionality coming soon...</Text>
  );

  const renderTrending = () => (
    <Text>Trending functionality coming soon...</Text>
  );

  const renderAnalytics = () => (
    <Text>Analytics functionality coming soon...</Text>
  );

  const renderArchive = () => (
    <Text>Archive functionality coming soon...</Text>
  );

  const renderSettings = () => (
    <Text>Settings functionality coming soon...</Text>
  );

  if (initializing) {
    return (
      <Container size="xl" py="xl">
        <Group justify="center" py="xl">
          <Loader size="lg" />
        </Group>
      </Container>
    );
  }

  return (
    <div style={{ background: '#f6f8fa' }}>
      <Sidebar activeView={activeView} onViewChange={handleViewChange} onSidebarToggle={handleSidebarToggle} />
      <div style={{ 
        marginLeft: sidebarCollapsed ? 0 : 256, 
        minHeight: 'calc(100vh - 80px)',
        transition: 'margin-left 0.3s ease'
      }}>
        <Container size="xl" py="xl" style={{ minWidth: '320px', maxWidth: '1400px', margin: '0 auto' }}>
          {renderMainContent()}
        </Container>
      </div>

      {/* Instagram Enhancement Modals */}
      <InstagramEnhancer
        opened={instagramEnhancerOpened}
        onClose={() => setInstagramEnhancerOpened(false)}
        onEnhancementComplete={handleEnhancementComplete}
      />

      {selectedBookmarkData && (
        <InstagramAnalysisDisplay
          opened={analysisDisplayOpened}
          onClose={() => setAnalysisDisplayOpened(false)}
          analysisData={selectedAnalysisData}
          bookmarkData={selectedBookmarkData}
        />
      )}
    </div>
  );
};

export default BookmarksPage; 