import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Card,
  Badge,
  Progress,
  Divider,
  Accordion,
  Grid,
  ThemeIcon,
  Box,
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
  IconClock,
  IconTag,
  IconTrendingUp,
  IconTarget,
  IconStar,
  IconExternalLink,
  IconCopy
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const InstagramAnalysisDisplay = ({ opened, onClose, analysisData, bookmarkData }) => {
  const [copied, setCopied] = useState(false);

  if (!analysisData || !bookmarkData) {
    return null;
  }

  const { analysis, metadata } = analysisData;

  const copyToClipboard = (text) => {
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

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getEngagementRate = () => {
    const { engagement, author } = metadata;
    if (!engagement || !author?.followers) return 0;
    
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
                <Group spacing="sm">
                  <ThemeIcon color={metric.color} variant="light" size="lg">
                    <Icon size={20} />
                  </ThemeIcon>
                  <Stack spacing={0}>
                    <Text size="xs" color="dimmed">{metric.label}</Text>
                    <Text size="lg" weight={600}>{formatNumber(metric.value)}</Text>
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
        <Group spacing="md">
          <ThemeIcon color="blue" variant="light" size="xl">
            <IconUser size={24} />
          </ThemeIcon>
          <Stack spacing={4} style={{ flex: 1 }}>
            <Group spacing="xs">
              <Text size="md" weight={600}>@{author.username}</Text>
              {author.isVerified && (
                <Badge size="xs" color="blue" variant="filled">Verified</Badge>
              )}
            </Group>
            {author.fullName && (
              <Text size="sm" color="dimmed">{author.fullName}</Text>
            )}
            <Group spacing="md">
              <Group spacing={4}>
                <IconUsers size={14} />
                <Text size="xs" color="dimmed">{formatNumber(author.followers)} followers</Text>
              </Group>
              <Group spacing={4}>
                <IconStar size={14} />
                <Text size="xs" color="dimmed">{formatNumber(author.postsCount)} posts</Text>
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
        <Stack spacing="md">
          <Group position="apart">
            <Text size="md" weight={600}>AI Content Analysis</Text>
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
              <Stack spacing="sm">
                <Group spacing="xs">
                  <IconTag size={16} />
                  <Text size="sm" weight={600}>Hashtags ({hashtags.length})</Text>
                </Group>
                <Group spacing={4}>
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
              <Stack spacing="sm">
                <Group spacing="xs">
                  <IconUsers size={16} />
                  <Text size="sm" weight={600}>Mentions ({mentions.length})</Text>
                </Group>
                <Group spacing={4}>
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
            <Stack spacing={4} align="center">
              <Text size="xs" color="dimmed">Media Type</Text>
              <Badge size="lg" variant="outline" color="blue">
                {mediaType || 'Unknown'}
              </Badge>
            </Stack>
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack spacing={4} align="center">
              <Text size="xs" color="dimmed">Posted</Text>
              <Text size="sm" weight={500}>{formatDate(timestamp)}</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={4}>
            <Stack spacing={4} align="center">
              <Text size="xs" color="dimmed">Engagement Rate</Text>
              <Group spacing={4}>
                <Text size="sm" weight={500}>{engagementRate}%</Text>
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
        <Group spacing="sm">
          <ThemeIcon color="blue" variant="light">
            <IconBrain size={20} />
          </ThemeIcon>
          <Text>Instagram Intelligence Analysis</Text>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack spacing="lg">
        {/* Bookmark Info */}
        <Card shadow="sm" p="md" radius="md" withBorder>
          <Group position="apart">
            <Stack spacing={4}>
              <Text size="lg" weight={600}>{bookmarkData.title}</Text>
              <Text size="sm" color="dimmed">{metadata.url}</Text>
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
              <Group spacing="sm">
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
              <Group spacing="sm">
                <IconTrendingUp size={16} />
                <Text>Engagement Metrics</Text>
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Stack spacing="md">
                {renderEngagementMetrics()}
                {renderMetadata()}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="author">
            <Accordion.Control>
              <Group spacing="sm">
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
              <Group spacing="sm">
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
        <Group position="right">
          <Button variant="light" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default InstagramAnalysisDisplay; 