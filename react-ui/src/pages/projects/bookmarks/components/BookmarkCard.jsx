import React, { useState } from 'react';
import { Card, Badge, Text, Group, Stack, Image, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { assets } from '../../../../theme';

const BookmarkCard = ({ bookmark, onRefresh }) => {
  const [imageError, setImageError] = useState(false);

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

  const handleImageError = () => {
    setImageError(true);
  };

  const shouldShowImage = bookmark.image_url && !imageError;

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack spacing="xs">
        {/* Preview Image Section */}
        {shouldShowImage && (
          <Card.Section>
            <Image
              src={bookmark.image_url}
              height={160}
              alt={bookmark.image_alt || `Preview image for ${bookmark.title}`}
              fit="cover"
              onError={handleImageError}
              fallbackSrc={assets.placeholderImage.landscape}
            />
          </Card.Section>
        )}

        {/* Title and Source Badge */}
        <Group position="apart" align="flex-start">
          <Text
            component="a"
            href={bookmark.url || bookmark.link}
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
        
        {/* Description */}
        {bookmark.description && (
          <Text size="sm" color="dimmed" lineClamp={2}>
            {bookmark.description}
          </Text>
        )}
        
        {/* Site Name */}
        {bookmark.site_name && (
          <Text size="xs" color="dimmed">
            {bookmark.site_name}
          </Text>
        )}
        
        {/* Tags */}
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
        
        {/* Footer with Date and Actions */}
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
  );
};

export default BookmarkCard; 