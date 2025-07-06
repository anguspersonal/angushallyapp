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

// Type definitions
interface Engagement {
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
}

interface Author {
  username: string;
  fullName?: string;
  followers: number;
  postsCount: number;
  isVerified?: boolean;
  profileUrl?: string;
}

interface Metadata {
  url: string;
  mediaType?: string;
  timestamp?: string;
  hashtags?: string[];
  mentions?: string[];
  engagement?: Engagement;
  author?: Author;
}

interface Analysis {
  rawResponse: string;
}

interface AnalysisData {
  analysis: Analysis;
  metadata: Metadata;
}

interface BookmarkData {
  title: string;
  url: string;
  description?: string;
}

interface InstagramAnalysisDisplayProps {
  opened: boolean;
  onClose: () => void;
  analysisData: AnalysisData | null;
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
        color: 'green'
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

    const metrics = [
      { label: 'Likes', value: engagement.likes, icon: IconHeart, color: 'red' },
      { label: 'Comments', value: engagement.comments, icon: IconMessage, color: 'blue' },
      { label: 'Views', value: engagement.views, icon: IconEye, color: 'green' },
      { label: 'Shares', value: engagement.shares, icon: IconShare, color: 'violet' }
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
                    <Text size="xs" c="dimmed">{metric.label}</Text>
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
        <Group gap="md">
          <ThemeIcon color="blue" variant="light" size="xl">
            <IconUser size={24} />
          </ThemeIcon>
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap="xs">
              <Text size="md" fw={600}>@{author.username}</Text>
              {author.isVerified && (
                <Badge size="xs" color="blue" variant="filled">Verified</Badge>
              )}
            </Group>
            {author.fullName && (
              <Text size="sm" c="dimmed">{author.fullName}</Text>
            )}
            <Group gap="md">
              <Group gap={4}>
                <IconUsers size={14} />
                <Text size="xs" c="dimmed">{formatNumber(author.followers)} followers</Text>
              </Group>
              <Group gap={4}>
                <IconStar size={14} />
                <Text size="xs" c="dimmed">{formatNumber(author.postsCount)} posts</Text>
              </Group>
            </Group>
          </Stack>
          {author.profileUrl && (
            <Tooltip label="View Profile">
              <ActionIcon
                variant="light"
                onClick={() => window.open(author.profileUrl, '_blank')}
              >
                <IconExternalLink size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Card>
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
                color={copied ? 'green' : 'gray'}
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

  const renderHashtagsAndMentions = () => {
    const { hashtags, mentions } = metadata;
    
    return (
      <Grid>
        {hashtags && hashtags.length > 0 && (
          <Grid.Col span={6}>
            <Card shadow="sm" p="md" radius="md" withBorder>
              <Stack gap="sm">
                <Group gap="xs">
                  <IconTag size={16} />
                  <Text size="sm" fw={600}>Hashtags ({hashtags.length})</Text>
                </Group>
                <Group gap={4}>
                  {hashtags.slice(0, 10).map((tag, index) => (
                    <Badge key={index} size="sm" variant="light" color="blue">
                      {tag}
                    </Badge>
                  ))}
                  {hashtags.length > 10 && (
                    <Badge size="sm" variant="outline" color="gray">
                      +{hashtags.length - 10}
                    </Badge>
                  )}
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        )}
        
        {mentions && mentions.length > 0 && (
          <Grid.Col span={6}>
            <Card shadow="sm" p="md" radius="md" withBorder>
              <Stack gap="sm">
                <Group gap="xs">
                  <IconUsers size={16} />
                  <Text size="sm" fw={600}>Mentions ({mentions.length})</Text>
                </Group>
                <Group gap={4}>
                  {mentions.slice(0, 8).map((mention, index) => (
                    <Badge key={index} size="sm" variant="light" color="grape">
                      {mention}
                    </Badge>
                  ))}
                  {mentions.length > 8 && (
                    <Badge size="sm" variant="outline" color="gray">
                      +{mentions.length - 8}
                    </Badge>
                  )}
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        )}
      </Grid>
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
              <Text size="xs" c="dimmed">Media Type</Text>
              <Badge size="lg" variant="outline" color="blue">
                {mediaType || 'Unknown'}
              </Badge>
            </Stack>
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap={4} align="center">
              <Text size="xs" c="dimmed">Posted</Text>
              <Text size="sm" fw={500}>{formatDate(timestamp || '')}</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack gap={4} align="center">
              <Text size="xs" c="dimmed">Engagement Rate</Text>
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
          <ThemeIcon color="blue" variant="light">
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
              <Text size="sm" c="dimmed">{metadata.url}</Text>
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