import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  TextInput,
  Card,
  Badge,
  Alert,
  Loader,
  ActionIcon,
  Tooltip,
  Box,
  Select,
  Pagination
} from '@mantine/core';
import {
  IconBrain,
  IconCheck,
  IconExternalLink,
  IconFilter,
  IconSearch
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { api } from '../../utils/apiClient';

// Type definitions
interface SourceMetadata {
  ai_enhanced?: boolean;
  ai_title_improved?: boolean;
  ai_description_improved?: boolean;
  ai_tags_added?: boolean;
}

interface InstagramBookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  has_instagram_analysis?: boolean;
  source_metadata?: SourceMetadata;
}

interface AnalysisData {
  isUpdate: boolean;
  isEnhanced: boolean;
  message: string;
}

interface InstagramEnhancerProps {
  opened: boolean;
  onClose: () => void;
  onEnhancementComplete?: (bookmarkId: string, analysisData: AnalysisData) => void;
}

type FilterType = 'all' | 'reels' | 'posts' | 'tv' | 'unanalyzed' | 'analyzed' | 'ai-enhanced';
type AnalysisStatus = 'analyzed' | 'unanalyzed';

const InstagramEnhancer: React.FC<InstagramEnhancerProps> = ({ 
  opened, 
  onClose, 
  onEnhancementComplete 
}) => {
  const [bookmarks, setBookmarks] = useState<InstagramBookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<InstagramBookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (opened) {
      fetchBookmarks();
    }
  }, [opened]);

  useEffect(() => {
    filterAndPaginateBookmarks();
  }, [bookmarks, searchQuery, filterType, currentPage]);

  const fetchBookmarks = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get('/bookmarks');
      
      if (response && response.bookmarks) {
        // Filter bookmarks that contain Instagram URLs
        const instagramBookmarks = response.bookmarks.filter((bookmark: InstagramBookmark) => 
          bookmark.url && isInstagramUrl(bookmark.url)
        );
        setBookmarks(instagramBookmarks);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch bookmarks',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndPaginateBookmarks = (): void => {
    let filtered = bookmarks;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((bookmark: InstagramBookmark) =>
        bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((bookmark: InstagramBookmark) => {
        switch (filterType) {
          case 'reels':
            return bookmark.url.includes('/reel/');
          case 'posts':
            return bookmark.url.includes('/p/');
          case 'tv':
            return bookmark.url.includes('/tv/');
          case 'unanalyzed':
            return !bookmark.has_instagram_analysis;
          case 'analyzed':
            return bookmark.has_instagram_analysis;
          case 'ai-enhanced':
            return bookmark.source_metadata?.ai_enhanced;
          default:
            return true;
        }
      });
    }

    // Calculate pagination
    const totalItems = filtered.length;
    setTotalPages(Math.ceil(totalItems / itemsPerPage));
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredBookmarks(filtered.slice(startIndex, endIndex));
  };

  const isInstagramUrl = (url: string): boolean => {
    const instagramPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?/;
    return instagramPattern.test(url);
  };

  const analyzeBookmark = async (bookmark: InstagramBookmark): Promise<void> => {
    if (!isInstagramUrl(bookmark.url)) {
      notifications.show({
        title: 'Invalid URL',
        message: 'Please provide a valid Instagram URL (post, reel, or IGTV)',
        color: 'red'
      });
      return;
    }

    try {
      setAnalyzing(prev => ({ ...prev, [bookmark.id]: true }));

      // Analyze Instagram content
      const response = await api.post('/instagram-intelligence/analyze', {
        instagramUrl: bookmark.url
      });

      if (response.success) {
        const { isUpdate, isEnhanced, message } = response.data;
        
        notifications.show({
          title: isUpdate ? 'Analysis Updated' : 'Analysis Complete',
          message: `${message} for "${bookmark.title}"`,
          color: 'green'
        });

        // Refresh bookmarks to show updated data
        await fetchBookmarks();
        
        // Notify parent component
        if (onEnhancementComplete) {
          onEnhancementComplete(bookmark.id, response.data);
        }
      }
    } catch (error: any) {
      console.error('Error analyzing bookmark:', error);
      notifications.show({
        title: 'Analysis Failed',
        message: `Failed to analyze Instagram content: ${error.message || 'Unknown error'}`,
        color: 'red'
      });
    } finally {
      setAnalyzing(prev => ({ ...prev, [bookmark.id]: false }));
    }
  };

  const getMediaTypeFromUrl = (url: string): string => {
    if (url.includes('/reel/')) return 'Reel';
    if (url.includes('/tv/')) return 'IGTV';
    if (url.includes('/p/')) return 'Post';
    return 'Unknown';
  };

  const getAnalysisStatus = (bookmark: InstagramBookmark): AnalysisStatus => {
    if (bookmark.has_instagram_analysis) {
      return 'analyzed';
    }
    return 'unanalyzed';
  };

  const renderBookmarkCard = (bookmark: InstagramBookmark) => {
    const mediaType = getMediaTypeFromUrl(bookmark.url);
    const status = getAnalysisStatus(bookmark);
    const isAnalyzing = analyzing[bookmark.id];

    return (
      <Card key={bookmark.id} shadow="sm" p="md" radius="lg" withBorder>
        <Stack gap="sm">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Stack gap={4} style={{ flex: 1 }}>
              <Text size="sm" fw={600} lineClamp={2}>
                {bookmark.title}
              </Text>
              <Group gap="xs">
                <Badge size="xs" variant="outline" color="blue">
                  {mediaType}
                </Badge>
                <Badge 
                  size="xs" 
                  variant="light" 
                  color={status === 'analyzed' ? 'green' : 'gray'}
                >
                  {status === 'analyzed' ? 'Analyzed' : 'Not Analyzed'}
                </Badge>
                {bookmark.source_metadata?.ai_enhanced && (
                  <Badge size="xs" variant="light" color="violet">
                    AI Enhanced
                  </Badge>
                )}
              </Group>
            </Stack>
            <Tooltip label="Open in Instagram">
              <ActionIcon
                size="sm"
                variant="light"
                onClick={() => window.open(bookmark.url, '_blank')}
              >
                <IconExternalLink size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* Description */}
          {bookmark.description && (
            <Text size="xs" c="dimmed" lineClamp={2}>
              {bookmark.description}
            </Text>
          )}

          {/* Tags */}
          {bookmark.tags && bookmark.tags.length > 0 && (
            <Group gap={4}>
              {bookmark.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} size="xs" variant="dot" color="gray">
                  {tag}
                </Badge>
              ))}
              {bookmark.tags.length > 3 && (
                <Badge size="xs" variant="outline" color="gray">
                  +{bookmark.tags.length - 3}
                </Badge>
              )}
            </Group>
          )}

          {/* Analysis Status */}
          {status === 'analyzed' && (
            <Alert icon={<IconCheck size={16} />} color="green" variant="light">
              <Stack gap={4}>
                <Text size="xs">Enhanced with Instagram Intelligence</Text>
                {bookmark.source_metadata?.ai_enhanced && (
                  <Text size="xs" c="dimmed">
                    AI improved: {[
                      bookmark.source_metadata.ai_title_improved && 'title',
                      bookmark.source_metadata.ai_description_improved && 'description', 
                      bookmark.source_metadata.ai_tags_added && 'tags'
                    ].filter(Boolean).join(', ') || 'metadata'}
                  </Text>
                )}
              </Stack>
            </Alert>
          )}

          {/* Action Button */}
          <Button
            size="xs"
            leftSection={isAnalyzing ? <Loader size={14} /> : <IconBrain size={14} />}
            onClick={() => analyzeBookmark(bookmark)}
            loading={isAnalyzing}
            disabled={isAnalyzing}
            variant={status === 'analyzed' ? 'light' : 'filled'}
            fullWidth
          >
            {isAnalyzing ? 'Analyzing...' : status === 'analyzed' ? 'Re-analyze' : 'Enhance with AI'}
          </Button>
        </Stack>
      </Card>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Instagram Intelligence Enhancer"
      size="xl"
      centered
    >
      <Stack gap="lg">
        {/* Header */}
        <Alert icon={<IconBrain size={16} />} color="blue" variant="light">
          <Text size="sm">
            Enhance your Instagram bookmarks with AI-powered content analysis. 
            Select bookmarks to analyze captions, hashtags, engagement metrics, and get content insights.
          </Text>
        </Alert>

        {/* Search and Filter */}
        <Group>
          <TextInput
            placeholder="Search bookmarks..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by type"
            leftSection={<IconFilter size={16} />}
            value={filterType}
            onChange={(value: string | null) => setFilterType((value as FilterType) || 'all')}
            data={[
              { value: 'all', label: 'All Instagram' },
              { value: 'reels', label: 'Reels' },
              { value: 'posts', label: 'Posts' },
              { value: 'tv', label: 'IGTV' },
              { value: 'unanalyzed', label: 'Not Analyzed' },
              { value: 'analyzed', label: 'Analyzed' },
              { value: 'ai-enhanced', label: 'AI Enhanced' }
            ]}
            style={{ minWidth: 150 }}
          />
        </Group>

        {/* Stats */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {bookmarks.length} Instagram bookmarks found
          </Text>
          <Text size="sm" c="dimmed">
            {filteredBookmarks.length} showing
          </Text>
        </Group>

        {/* Loading State */}
        {loading && (
          <Group justify="center" py="xl">
            <Loader size="lg" />
          </Group>
        )}

        {/* Empty State */}
        {!loading && bookmarks.length === 0 && (
          <Text ta="center" c="dimmed" py="xl">
            No Instagram bookmarks found. Add some Instagram posts, reels, or IGTV videos to your bookmarks first.
          </Text>
        )}

        {/* Bookmarks Grid */}
        {!loading && filteredBookmarks.length > 0 && (
          <>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}
            >
              {filteredBookmarks.map(renderBookmarkCard)}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Group justify="center">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                  size="sm"
                />
              </Group>
            )}
          </>
        )}

        {/* Footer Actions */}
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Done
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default InstagramEnhancer; 