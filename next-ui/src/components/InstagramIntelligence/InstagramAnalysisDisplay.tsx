'use client';

import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Card,
  Badge,
  Accordion,
  Grid,
  ThemeIcon,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import {
  IconBrain,
  IconHeart,
  IconMessage,
  IconEye,
  IconShare,
  IconUser,
  IconUsers,
  IconTag,
  IconTrendingUp,
  IconStar,
  IconExternalLink,
  IconCopy
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { InstagramAnalysisData, BookmarkData } from '../../types/common';

interface InstagramAnalysisDisplayProps {
  opened: boolean;
  onClose: () => void;
  analysisData: InstagramAnalysisData | null;
  bookmarkData: BookmarkData;
}

const InstagramAnalysisDisplay: React.FC<InstagramAnalysisDisplayProps> = ({ 
  opened, 
  onClose, 
  analysisData, 
  bookmarkData 
}) => {
  const [copied, setCopied] = useState(false);

  if (!analysisData || !bookmarkData) {
    return null;
  }

  const { analysis, metadata } = analysisData;

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      notifications.show({
        title: 'Copied',
        message: 'Analysis copied to clipboard',
        color: 'success'
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getEngagementRate = (): string => {
    const { engagement, author } = metadata;
    if (!engagement || !author?.followers) return '0';
    
    const totalEngagement = (engagement.likes || 0) + (engagement.comments || 0);
    return ((totalEngagement / author.followers) * 100).toFixed(2);
  };

  const renderEngagementMetrics = () => {
    const { engagement } = metadata;
    if (!engagement) return null;

    type MetricColor = 'primary' | 'success' | 'secondary';
    
    const metrics: Array<{
      label: string;
      value: number | undefined;
      icon: React.ComponentType<{ size: number }>;
      color: MetricColor;
    }> = [
      { label: 'Likes', value: engagement.likes, icon: IconHeart, color: 'primary' },
      { label: 'Comments', value: engagement.comments, icon: IconMessage, color: 'primary' },
      { label: 'Views', value: engagement.views, icon: IconEye, color: 'success' },
      { label: 'Shares', value: engagement.shares, icon: IconShare, color: 'secondary' }
    ];

    return (
      <Grid>
        {metrics.filter(metric => metric.value !== undefined).map((metric) => {
          const Icon = metric.icon;
          return (
            <Grid.Col key={metric.label} span={6}>
              <Card shadow="sm" p="md" radius="md" withBorder>
                <Group gap="sm">
                  <ThemeIcon color={metric.color} variant="light" size="lg">
                    <Icon size={20} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>{metric.label}</Text>
                    <Text size="lg" fw={600}>{formatNumber(metric.value!)}</Text>
                  </Stack>
                </Group>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    );
  };

  const renderAuthorInfo = () => {
    const { author } = metadata;
    if (!author) return null;

    return (
      <Card shadow="sm" p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="primary" variant="light" size="lg">
              <IconUser size={20} />
            </ThemeIcon>
            <Stack gap={0}>
              <Text size="md" fw={600}>{author.username || 'Unknown'}</Text>
              <Text size="sm" style={{ color: 'var(--mantine-color-gray-6)' }}>
                {formatNumber(author.followers || 0)} followers
              </Text>
            </Stack>
            {author.verified && (
              <Badge size="sm" variant="light" color="success" leftSection={<IconStar size={12} />}>
                Verified
              </Badge>
            )}
          </Group>
        </Stack>
      </Card>
    );
  };

  const renderHashtagsAndMentions = () => {
    const { hashtags, mentions } = metadata;
    if (!hashtags?.length && !mentions?.length) return null;

    return (
      <Stack gap="md">
        {hashtags && hashtags.length > 0 && (
          <Card shadow="sm" p="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group gap="sm">
                <IconTag size={16} />
                <Text size="sm" fw={600}>Hashtags ({hashtags.length})</Text>
              </Group>
              <Group gap={6}>
                {hashtags.map((tag, index) => (
                  <Badge key={index} size="sm" variant="light" color="primary">
                    #{tag}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Card>
        )}

        {mentions && mentions.length > 0 && (
          <Card shadow="sm" p="md" radius="md" withBorder>
            <Stack gap="sm">
              <Group gap="sm">
                <IconUsers size={16} />
                <Text size="sm" fw={600}>Mentions ({mentions.length})</Text>
              </Group>
              <Group gap={6}>
                {mentions.map((mention, index) => (
                  <Badge key={index} size="sm" variant="light" color="secondary">
                    @{mention}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Card>
        )}
      </Stack>
    );
  };

  const renderContentAnalysis = () => {
    if (!analysis || !analysis.rawResponse) return null;

    return (
      <Card shadow="sm" p="md" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="md" fw={600}>AI Content Analysis</Text>
            <Tooltip label={copied ? 'Copied!' : 'Copy Analysis'}>
              <ActionIcon 
                variant="light" 
                onClick={() => copyToClipboard(analysis.rawResponse)}
                color={copied ? 'success' : 'dark'}
              >
                <IconCopy size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {analysis.rawResponse}
          </Text>
        </Stack>
      </Card>
    );
  };

  const renderMetadata = () => {
    const { mediaType, timestamp } = metadata;
    const engagementRate = getEngagementRate();

    return (
      <Card shadow="sm" p="md" radius="md" withBorder>
        <Grid>
          <Grid.Col span={4}>
            <Stack gap={4} align="center">
              <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Media Type</Text>
              <Badge size="lg" variant="outline" color="primary">
                {mediaType || 'Unknown'}
              </Badge>
            </Stack>
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap={4} align="center">
              <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Posted</Text>
              <Text size="sm" fw={500}>{formatDate(timestamp || '')}</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap={4} align="center">
              <Text size="xs" style={{ color: 'var(--mantine-color-gray-6)' }}>Engagement Rate</Text>
              <Group gap={4}>
                <Text size="sm" fw={500}>{engagementRate}%</Text>
                <IconTrendingUp size={14} color="green" />
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon color="primary" variant="light">
            <IconBrain size={20} />
          </ThemeIcon>
          <Text>Instagram Intelligence Analysis</Text>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack gap="lg">
        {/* Bookmark Info */}
        <Card shadow="sm" p="md" radius="md" withBorder>
          <Group justify="space-between">
            <Stack gap={4}>
              <Text size="lg" fw={600}>{bookmarkData.title}</Text>
              <Text size="sm" style={{ color: 'var(--mantine-color-gray-6)' }}>{metadata.url}</Text>
            </Stack>
            <ActionIcon
              variant="light"
              onClick={() => window.open(metadata.url, '_blank')}
            >
              <IconExternalLink size={16} />
            </ActionIcon>
          </Group>
        </Card>

        {/* Content Analysis */}
        <Accordion defaultValue="analysis">
          <Accordion.Item value="analysis">
            <Accordion.Control>
              <Group gap="sm">
                <IconBrain size={16} />
                <Text>AI Content Analysis</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {renderContentAnalysis()}
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="engagement">
            <Accordion.Control>
              <Group gap="sm">
                <IconTrendingUp size={16} />
                <Text>Engagement Metrics</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack gap="md">
                {renderEngagementMetrics()}
                {renderMetadata()}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="author">
            <Accordion.Control>
              <Group gap="sm">
                <IconUser size={16} />
                <Text>Author Information</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {renderAuthorInfo()}
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="tags">
            <Accordion.Control>
              <Group gap="sm">
                <IconTag size={16} />
                <Text>Hashtags & Mentions</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              {renderHashtagsAndMentions()}
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {/* Footer */}
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default InstagramAnalysisDisplay; 