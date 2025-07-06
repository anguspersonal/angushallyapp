// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button, Box, Loader, Text, Group, Stack, Title, Container, Card, Badge, Paper, SimpleGrid } from '@mantine/core';
import { IconRefresh, IconTrendingUp, IconBolt, IconUsers, IconBook, IconArrowRight, IconChevronRight, IconStar, IconTarget, IconBrain } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/apiClient';
import Header from '../../../components/Header';
import BookmarkCard from './components/BookmarkCard';
import { Sidebar } from './components/sidebar';
import InstagramEnhancer from '../../../components/InstagramIntelligence/InstagramEnhancer';
import InstagramAnalysisDisplay from '../../../components/InstagramIntelligence/InstagramAnalysisDisplay';
import "../../../general.css";

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    thisWeek: 0,
    knowledgeScore: 0,
    connections: 0
  });
  const [instagramEnhancerOpened, setInstagramEnhancerOpened] = useState(false);
  const [analysisDisplayOpened, setAnalysisDisplayOpened] = useState(false);
  const [selectedAnalysisData, setSelectedAnalysisData] = useState(null);
  const [selectedBookmarkData, setSelectedBookmarkData] = useState(null);

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
      color: 'violet'
    }
  ];

  useEffect(() => {
    const initialize = async () => {
      if (!user) return;
      
      try {
        setInitializing(true);
        await fetchBookmarks();
        calculateStats();
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

  const calculateStats = () => {
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
  };

  useEffect(() => {
    calculateStats();
  }, [bookmarks]);

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  const getStatColor = (statType) => {
    switch (statType) {
      case 'total': return 'blue';
      case 'week': return 'green';
      case 'knowledge': return 'orange';
      case 'connections': return 'violet';
      default: return 'gray';
    }
  };

  const getStatIcon = (statType) => {
    switch (statType) {
      case 'total': return IconBook;
      case 'week': return IconTrendingUp;
      case 'knowledge': return IconBolt;
      case 'connections': return IconUsers;
      default: return IconBook;
    }
  };

  const getInsightIcon = (category) => {
    switch (category) {
      case 'learning': return IconBrain;
      case 'habits': return IconTarget;
      case 'connections': return IconUsers;
      default: return IconStar;
    }
  };

  const getInsightColor = (category) => {
    switch (category) {
      case 'learning': return 'blue';
      case 'habits': return 'green';
      case 'connections': return 'violet';
      default: return 'gray';
    }
  };

  const handleInstagramAnalysisClick = async (bookmark) => {
    try {
      // Fetch the analysis data for this bookmark
      const response = await api.get(`/instagram-intelligence/history?limit=50`);
      
      if (response.success && response.data.history) {
        // Find analysis for this specific URL
        const analysis = response.data.history.find(item => 
          item.instagram_url === bookmark.url
        );
        
        if (analysis) {
          setSelectedAnalysisData({
            analysis: JSON.parse(analysis.analysis_result),
            metadata: JSON.parse(analysis.metadata)
          });
          setSelectedBookmarkData(bookmark);
          setAnalysisDisplayOpened(true);
        } else {
          notifications.show({
            title: 'No Analysis Found',
            message: 'No Instagram analysis found for this bookmark. Try enhancing it first.',
            color: 'orange'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching Instagram analysis:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch Instagram analysis',
        color: 'red'
      });
    }
  };

  const handleEnhancementComplete = (bookmarkId, analysisData) => {
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
    const recentBookmarks = bookmarks.slice(0, 6);
    
    return (
      <Stack spacing={40}>
        {/* Welcome Section */}
        <Card 
          radius="lg" 
          p="xl"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            color: 'white',
            border: 'none',
            marginBottom: 24,
            maxWidth: '100%'
          }}
        >
          <Stack spacing="md">
            <Title order={1} color="white">Welcome back!</Title>
            <Text size="lg" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Your knowledge is growing. Here's what's happening in your Second Brain.
            </Text>
            <Group spacing="xs" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <Text size="sm">Ready to capture more knowledge?</Text>
              <IconArrowRight size={16} />
            </Group>
          </Stack>
        </Card>

        {/* Stats */}
        <Group align="flex-start" noWrap spacing={40}>
          {/* Stats Row */}
          <Group spacing={24} align="stretch" style={{ flex: 2 }}>
            <Card shadow="sm" radius="md" p="md" withBorder style={{ minWidth: 120, flex: 1 }}>
              <Group position="apart" mb="md">
                <Box style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flexShrink: 0 }}>
                  <IconBook size={24} color="#3b82f6" />
                </Box>
                <Badge variant="light" color="green" size="sm">
                  +{Math.floor(stats.totalItems * 0.1)}%
                </Badge>
              </Group>
              <Text size="xl" weight="bold" mb={2}>{stats.totalItems}</Text>
              <Text size="sm" color="dimmed">Total Items</Text>
            </Card>
            <Card shadow="sm" radius="md" p="md" withBorder style={{ minWidth: 120, flex: 1 }}>
              <Group position="apart" mb="md">
                <Box style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flexShrink: 0 }}>
                  <IconTrendingUp size={24} color="#3b82f6" />
                </Box>
                <Badge variant="light" color="green" size="sm">
                  +{Math.floor(stats.thisWeek * 0.2)}%
                </Badge>
              </Group>
              <Text size="xl" weight="bold" mb={2}>{stats.thisWeek}</Text>
              <Text size="sm" color="dimmed">This Week</Text>
            </Card>
            <Card shadow="sm" radius="md" p="md" withBorder style={{ minWidth: 120, flex: 1 }}>
              <Group position="apart" mb="md">
                <Box style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flexShrink: 0 }}>
                  <IconBolt size={24} color="#3b82f6" />
                </Box>
                <Badge variant="light" color="green" size="sm">+3%</Badge>
              </Group>
              <Text size="xl" weight="bold" mb={2}>{stats.knowledgeScore}</Text>
              <Text size="sm" color="dimmed">Knowledge Score</Text>
            </Card>
            <Card shadow="sm" radius="md" p="md" withBorder style={{ minWidth: 120, flex: 1 }}>
              <Group position="apart" mb="md">
                <Box style={{ backgroundColor: '#eff6ff', borderRadius: 8, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flexShrink: 0 }}>
                  <IconUsers size={24} color="#3b82f6" />
                </Box>
                <Badge variant="light" color="green" size="sm">
                  +{Math.floor(stats.connections * 0.15)}%
                </Badge>
              </Group>
              <Text size="xl" weight="bold" mb={2}>{stats.connections}</Text>
              <Text size="sm" color="dimmed">Connections</Text>
            </Card>
          </Group>
        </Group>

        <Box shadow="sm" radius="lg" p="xl" withBorder mb={32}>
          <Group align="flex-start" noWrap spacing={40}>
            {/* Bookmarks Section */}
            <Box style={{ flex: 2, minWidth: 320 }}>
              <Stack spacing="lg">
                <Group position="apart" align="center">
                  <Title order={2}>Recent Captures</Title>
                  <Button
                    variant="subtle"
                    size="sm"
                    rightIcon={<IconChevronRight size={16} />}
                    onClick={() => handleViewChange('bookmarks')}
                  >
                    View all
                  </Button>
                </Group>
                <Group mb="md">
                  <Button
                    leftIcon={<IconRefresh size={16} />}
                    onClick={fetchBookmarks}
                    loading={loading}
                    variant="light"
                    size="sm"
                  >
                    Refresh
                  </Button>
                  <Button
                    leftIcon={<IconBrain size={16} />}
                    onClick={() => setInstagramEnhancerOpened(true)}
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'violet' }}
                    size="sm"
                  >
                    Instagram Intelligence
                  </Button>
                </Group>
                {loading ? (
                  <Group position="center" h={300}>
                    <Loader size="lg" />
                  </Group>
                ) : (
                  <Box>
                    {recentBookmarks && recentBookmarks.length > 0 ? (
                      <SimpleGrid
                        cols={2}
                        spacing="lg"
                        breakpoints={[
                          { maxWidth: 'sm', cols: 1 },
                          { minWidth: 1200, cols: 3 },
                        ]}
                      >
                        {recentBookmarks.map((bookmark) => (
                          <BookmarkCard 
                            key={bookmark.id}
                            bookmark={bookmark}
                            onInstagramAnalysisClick={handleInstagramAnalysisClick}
                          />
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Paper p="xl" radius="lg" style={{ textAlign: 'center' }}>
                        <Stack align="center" spacing="md">
                          <IconBook size={48} color="#cbd5e1" />
                          <Text color="dimmed" size="lg">
                            No bookmarks found. Connect your Raindrop account or add bookmarks manually.
                          </Text>
                          <Button variant="light" component="a" href="/projects/bookmarks/raindrops">
                            Connect Raindrop
                          </Button>
                        </Stack>
                      </Paper>
                    )}
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Knowledge Insights Section */}
            <Box style={{ flex: 1, minWidth: 180, maxWidth: 320, backgroundColor: '#f6f8fa', border: '1px solid #e2e8f0', padding: 16, borderRadius: 16 }}>
              <Stack spacing="lg">
                <Title order={2}>Knowledge Insights</Title>
                <Stack spacing="md">
                  {mockInsights.map((insight) => {
                    const color = getInsightColor(insight.category);
                    return (
                      <Card key={insight.id} shadow="sm" radius="lg" p="md" withBorder>
                        <Stack>
                          <Group position="apart" align="flex-start">
                            <Text size="sm" weight="bold">{insight.title}</Text>
                            <Badge 
                              variant="light" 
                              color={color}
                              radius="xl"
                              size="lg"
                            >
                              {Math.round(insight.relevance * 100)}%
                            </Badge>
                          </Group>
                          <Text size="sm" color="dimmed">
                            {insight.description}
                          </Text>
                          {insight.actionable && (
                            <Button
                              variant="subtle"
                              size="xs"
                              color={color}
                              rightIcon={<IconArrowRight size={14} />}
                              onClick={() => {
                                notifications.show({
                                  title: 'Coming Soon',
                                  message: 'Smart actions are being developed!',
                                  color: 'blue'
                                });
                              }}
                              style={{ paddingLeft: 0, width: 'fit-content' }}
                            >
                              Take Action
                            </Button>
                          )}
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </Stack>
            </Box>
          </Group>
        </Box>
      </Stack>
    );
  };

  const renderAllBookmarks = () => (
    <Stack spacing="lg">
      <Group position="apart" align="center">
        <Title order={2}>All Bookmarks</Title>
        <Group>
          <Button
            leftIcon={<IconRefresh size={16} />}
            onClick={fetchBookmarks}
            loading={loading}
            variant="light"
            size="sm"
          >
            Refresh
          </Button>
          <Button
            leftIcon={<IconBrain size={16} />}
            onClick={() => setInstagramEnhancerOpened(true)}
            variant="gradient"
            gradient={{ from: 'blue', to: 'violet' }}
            size="sm"
          >
            Instagram Intelligence
          </Button>
        </Group>
      </Group>
      {loading ? (
        <Group position="center" h={400}>
          <Loader size="lg" />
        </Group>
      ) : (
        <Box>
          {bookmarks && bookmarks.length > 0 ? (
            <SimpleGrid
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 'sm', cols: 1 },
                { maxWidth: 'md', cols: 2 },
                { minWidth: 1200, cols: 4 },
              ]}
            >
              {bookmarks.map((bookmark) => (
                <BookmarkCard 
                  key={bookmark.id}
                  bookmark={bookmark}
                  onInstagramAnalysisClick={handleInstagramAnalysisClick}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Paper p="xl" radius="lg" style={{ textAlign: 'center' }}>
              <Stack align="center" spacing="md">
                <IconBook size={48} color="#cbd5e1" />
                <Text color="dimmed" size="lg">
                  No bookmarks found. Connect your Raindrop account or add bookmarks manually.
                </Text>
                <Button variant="light" component="a" href="/projects/bookmarks/raindrops">
                  Connect Raindrop
                </Button>
              </Stack>
            </Paper>
          )}
        </Box>
      )}
    </Stack>
  );

  const renderSearch = () => (
    <Stack spacing="lg">
      <Title order={2}>Search</Title>
      <Text color="dimmed">Search functionality coming soon...</Text>
    </Stack>
  );

  const renderSync = () => (
    <Stack spacing="lg">
      <Title order={2}>Sync & Import</Title>
      <Text color="dimmed">Sync and import functionality coming soon...</Text>
    </Stack>
  );

  const renderTags = () => (
    <Stack spacing="lg">
      <Title order={2}>Tags</Title>
      <Text color="dimmed">Tags management coming soon...</Text>
    </Stack>
  );

  const renderTrending = () => (
    <Stack spacing="lg">
      <Title order={2}>Trending</Title>
      <Text color="dimmed">Trending content coming soon...</Text>
    </Stack>
  );

  const renderAnalytics = () => (
    <Stack spacing="lg">
      <Title order={2}>Analytics</Title>
      <Text color="dimmed">Analytics dashboard coming soon...</Text>
    </Stack>
  );

  const renderArchive = () => (
    <Stack spacing="lg">
      <Title order={2}>Archive</Title>
      <Text color="dimmed">Archive functionality coming soon...</Text>
    </Stack>
  );

  const renderSettings = () => (
    <Stack spacing="lg">
      <Title order={2}>Settings</Title>
      <Text color="dimmed">Settings panel coming soon...</Text>
    </Stack>
  );

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
    <div style={{ background: '#f6f8fa' }}>
      <Header />
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

      <InstagramAnalysisDisplay
        opened={analysisDisplayOpened}
        onClose={() => setAnalysisDisplayOpened(false)}
        analysisData={selectedAnalysisData}
        bookmarkData={selectedBookmarkData}
      />
    </div>
  );
};

export default Bookmarks; 