'use client';

import React from 'react';
import Link from 'next/link';
import { Paper, Text, Title, Badge, Group, Box } from '@mantine/core';

interface Project {
  name: string;
  desc: string;
  route: string;
  tags?: string[];
}

interface ProjectSnippetProps {
  project: Project;
}

function ProjectSnippet({ project }: ProjectSnippetProps) {
  const { name, desc, route, tags = [] } = project;
  
  const getTagColor = (tag: string): "dark" | "primary" | "secondary" | "accent" | "success" => {
    const tagColors: Record<string, "dark" | "primary" | "secondary" | "accent" | "success"> = {
      'AI': 'success',
      'Data': 'primary',
      'Map': 'secondary',
      'Food': 'accent',
      'Game': 'success',
      'Education': 'dark',
      'NLP': 'primary',
      'Fitness': 'success',
      'Visualization': 'primary',
      'Productivity': 'dark',
      'Habit': 'success',
      'Writing': 'primary',
      'Tech': 'dark',
      'Learning': 'dark',
      'Bookmarks': 'primary',
      'API': 'secondary'
    };
    return tagColors[tag] || 'dark';
  };
  
  return (
    <Link href={route} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Paper
        p="md"
        withBorder
        shadow="sm"
        style={{
          cursor: 'pointer',
          transition: 'box-shadow 0.3s ease-in-out',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 123, 255, 0.8)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '';
        }}
      >
        <Box>
          <Title 
            order={3} 
            size="h4" 
            mb="xs"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
              maxHeight: '2.8em'
            }}
          >
            {name}
          </Title>
          <Text 
            size="sm" 
            mb="md"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
              maxHeight: '2.8em'
            }}
          >
            {desc}
          </Text>
          <Group gap="xs" wrap="wrap">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                color={getTagColor(tag)}
                size="sm"
                variant="filled"
              >
                {tag}
              </Badge>
            ))}
          </Group>
        </Box>
      </Paper>
    </Link>
  );
}

export default ProjectSnippet;