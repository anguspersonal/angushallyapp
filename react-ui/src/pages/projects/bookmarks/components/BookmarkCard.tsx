import React, { useState } from 'react';
import { Card, Badge, Text, Group, Stack, Image, Box, Transition, Avatar, Tooltip } from '@mantine/core';
import { IconExternalLink, IconClock, IconBookmark, IconBrain, IconTrendingUp } from '@tabler/icons-react';
import { 
  BookmarkCardProps, 
  BookmarkSourceType 
} from '../../../../types/common';

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  onInstagramAnalysisClick,
  onEdit,
  onDelete,
  showActions = false
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const getSourceBadgeProps = (sourceType: BookmarkSourceType) => {
    switch (sourceType) {
      case 'raindrop':
        return { color: 'blue', label: 'Raindrop' };
      case 'manual':
        return { color: 'green', label: 'Manual' };
      case 'instapaper':
        return { color: 'dark', label: 'Instapaper' };
      case 'readwise':
        return { color: 'violet', label: 'Readwise' };
      default:
        return { color: 'gray', label: sourceType };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isInstagramUrl = (url: string): boolean => {
    const instagramPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?/;
    return instagramPattern.test(url);
  };

  const hasInstagramAnalysis = (): boolean => {
    return !!(bookmark.source_metadata?.instagram_analysis || 
           bookmark.source_metadata?.metadata_enriched ||
           (bookmark.intelligence_level ?? 0) > 1);
  };

  const getInstagramMediaType = (url: string): string => {
    if (url.includes('/reel/')) return 'Reel';
    if (url.includes('/tv/')) return 'IGTV';
    if (url.includes('/p/')) return 'Post';
    return 'Instagram';
  };

  const hasImage = bookmark.image_url && !imageError;
  const sourceProps = getSourceBadgeProps(bookmark.source_type);
  const domain = bookmark.site_name || (bookmark.url ? new URL(bookmark.url).hostname.replace('www.', '') : '');
  const readTime = bookmark.metadata?.readingTime;

  return (
    <Card 
      shadow="sm" 
      p={0} 
      radius="lg" 
      withBorder
      style={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? 'var(--mantine-shadow-md)' : 'var(--mantine-shadow-sm)',
        flex: '1 1 100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '120px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (bookmark.url) {
          window.open(bookmark.url, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {/* Image or Header Section */}
      {hasImage ? (
        <Box pos="relative" h={180} style={{ overflow: 'hidden' }}>
          <Image
            src={bookmark.image_url}
            height={180}
            alt={bookmark.title}
            fit="cover"
            onError={handleImageError}
            style={{
              transition: 'transform 0.3s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          <Transition mounted={isHovered} transition="fade" duration={200}>
            {(styles) => (
              <Box pos="absolute" top={12} right={12} style={styles}>
                <IconExternalLink size={16} color="white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
              </Box>
            )}
          </Transition>
        </Box>
      ) : (
        <Box 
          p="sm"
          style={{
            background: 'var(--mantine-color-gray-0)',
            borderBottom: '1px solid var(--mantine-color-gray-2)'
          }}
        >
          <Group justify="space-between">
            <Group gap="xs">
              <Avatar src={bookmark.favicon_url || `https://www.google.com/s2/favicons?domain=${domain}&sz=32`} size="sm" radius="sm">
                <IconBookmark size={16} /> 
              </Avatar>
              <Text size="xs" fw={500}>{domain}</Text>
            </Group>
            {readTime && (
              <Text size="xs" color="dimmed">{readTime} min read</Text>
            )}
          </Group>
        </Box>
      )}

      {/* Content Section */}
      <Stack gap="sm" p="md" style={{ flex: 1, justifyContent: 'space-between' }}>
        <Stack gap="sm">
          <Text
            size="sm"
            fw={600}
            lineClamp={2}
            style={{ 
              transition: 'color 0.2s ease',
              color: isHovered ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-black)',
            }}
          >
            {bookmark.title}
          </Text>
          
          {bookmark.description && (
            <Text 
              size="xs" 
              color="dimmed" 
              lineClamp={3}
              style={{ lineHeight: 1.5 }}
            >
              {bookmark.description}
            </Text>
          )}
          
          {bookmark.tags && bookmark.tags.length > 0 && (
            <Group gap={6} mt="xs">
              {bookmark.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={`${bookmark.id}-tag-${index}`} 
                  size="sm"
                  variant="light"
                  color="gray"
                >
                  {tag}
                </Badge>
              ))}
              {bookmark.tags.length > 2 && (
                <Badge variant="outline" color="gray" size="sm">
                  +{bookmark.tags.length - 2}
                </Badge>
              )}
            </Group>
          )}

          {/* Instagram Intelligence Indicators */}
          {isInstagramUrl(bookmark.url) && (
            <Group gap={6} mt="xs">
              <Badge 
                size="sm" 
                variant="outline" 
                color="pink"
                leftSection={<IconBrain size={12} />}
              >
                {getInstagramMediaType(bookmark.url)}
              </Badge>
              {hasInstagramAnalysis() && (
                <Tooltip label="Enhanced with Instagram Intelligence">
                  <Badge 
                    size="sm" 
                    variant="light" 
                    color="blue"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onInstagramAnalysisClick) {
                        onInstagramAnalysisClick(bookmark);
                      }
                    }}
                  >
                    <Group gap={4}>
                      <IconTrendingUp size={12} />
                      <Text size="xs">AI Enhanced</Text>
                    </Group>
                  </Badge>
                </Tooltip>
              )}
            </Group>
          )}
        </Stack>
        
        {/* Footer with Date and Source */}
        <Group justify="space-between" mt="md">
          <Group gap={6}>
            <IconClock size={14} color="var(--mantine-color-gray-6)" />
            <Text size="xs" color="dimmed">
              {formatDate(bookmark.created_at)}
            </Text>
          </Group>
          
          <Badge 
            size="sm"
            variant="light"
            color={sourceProps.color}
          >
            {sourceProps.label}
          </Badge>
        </Group>
      </Stack>
    </Card>
  );
};

export default BookmarkCard; 