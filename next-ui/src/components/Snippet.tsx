'use client';

import React from 'react';
import Link from 'next/link';
import { Paper, Text, Title, Box } from '@mantine/core';

interface SnippetProps {
  excerpt: string;
  id: string;
  slug: string;
  title: string;
  link?: string;
}

function Snippet({ excerpt, id, slug, title, link = `/blog/${slug}` }: SnippetProps) {
  return (
    <Link key={id} href={link} style={{ textDecoration: 'none', color: 'inherit' }} aria-label={`Read more about ${title}`}>
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
            {title}
          </Title>
          <Text 
            size="sm"
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
            {excerpt}
          </Text>
        </Box>
      </Paper>
    </Link>
  );
}

export default Snippet;