'use client';

import React from 'react';
import Link from 'next/link';
import { Text, Title, Badge, Group, Box } from '@mantine/core';
import type { ProjectStatus } from '@/data/projectList';
import { GlassContent } from '@/components/design/Glass';

interface Project {
  name: string;
  desc: string;
  route: string;
  tags?: string[];
  status: ProjectStatus;
  gated?: boolean;
}

interface ProjectSnippetProps {
  project: Project;
}

type StatusMeta = {
  label: string;
  color: 'coral' | 'teal' | 'gray';
};

const STATUS_META: Record<ProjectStatus, StatusMeta> = {
  'in-progress': { label: 'In progress', color: 'coral' },
  done: { label: 'Done', color: 'teal' },
  archived: { label: 'Archived', color: 'gray' },
};

function ProjectSnippet({ project }: ProjectSnippetProps) {
  const { name, desc, route, tags = [], status, gated = false } = project;
  const statusMeta = STATUS_META[status];

  const getTagColor = (tag: string): 'dark' | 'primary' | 'secondary' | 'accent' | 'success' => {
    const tagColors: Record<string, 'dark' | 'primary' | 'secondary' | 'accent' | 'success'> = {
      AI: 'success',
      Data: 'primary',
      Map: 'secondary',
      Food: 'accent',
      Game: 'success',
      Education: 'dark',
      NLP: 'primary',
      Fitness: 'success',
      Visualization: 'primary',
      Productivity: 'dark',
      Habit: 'success',
      Writing: 'primary',
      Tech: 'dark',
      Learning: 'dark',
      Bookmarks: 'primary',
      API: 'secondary',
    };
    return tagColors[tag] || 'dark';
  };

  const statusBadge =
    statusMeta.color === 'gray' ? (
      <Badge size="xs" variant="light" color="gray" style={{ opacity: 0.6 }}>
        {statusMeta.label}
      </Badge>
    ) : (
      <Badge size="xs" variant="light" color={statusMeta.color}>
        {statusMeta.label}
      </Badge>
    );

  return (
    <Link href={route} style={{ textDecoration: 'none', color: 'inherit' }}>
      <GlassContent p="md" style={{ cursor: 'pointer', height: '100%' }}>
        <Box>
          <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
            <Title
              order={3}
              size="h4"
              c="var(--site-ink)"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.4,
                maxHeight: '2.8em',
                flex: 1,
              }}
            >
              {name}
            </Title>
            <Group gap={4} wrap="nowrap">
              {statusBadge}
              {gated && (
                <Badge color="teal" size="xs" variant="outline">
                  Sign-in
                </Badge>
              )}
            </Group>
          </Group>
          <Text
            size="sm"
            mb="md"
            c="dimmed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
              maxHeight: '2.8em',
            }}
          >
            {desc}
          </Text>
          <Group gap="xs" wrap="wrap">
            {tags.map((tag) => (
              <Badge key={tag} color={getTagColor(tag)} size="sm" variant="filled">
                {tag}
              </Badge>
            ))}
          </Group>
        </Box>
      </GlassContent>
    </Link>
  );
}

export default ProjectSnippet;
