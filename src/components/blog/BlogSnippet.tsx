'use client';

import React from 'react';
import NextImage from 'next/image';
import { Text, Title, Box } from '@mantine/core';
import type { ContentPostSummary } from '@/lib/content/contracts';
import { GlassContent } from '@/components/design/Glass';

interface BlogSnippetProps {
  post: ContentPostSummary;
}

export default function BlogSnippet({ post }: BlogSnippetProps) {
  const handleAttributionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.attributionLink) {
      window.open(post.attributionLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <GlassContent p={0} style={{ overflow: 'hidden', height: '100%' }}>
      {post.coverImage && (
        <Box>
          <Box pos="relative" h={160}>
            <NextImage
              src={post.coverImage}
              alt={post.altText || `Cover image for ${post.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
          </Box>
          {post.attribution && (
            <Text size="xs" opacity={0.7} ta="right" px="md" py="xs">
              {post.attributionLink ? (
                <Text
                  component="span"
                  opacity={0.7}
                  onClick={handleAttributionClick}
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textDecorationStyle: 'dotted',
                  }}
                >
                  {post.attribution}
                </Text>
              ) : (
                post.attribution
              )}
            </Text>
          )}
        </Box>
      )}
      <Box p="md">
        <Title
          order={3}
          mb="xs"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--site-ink)',
          }}
        >
          {post.title}
        </Title>
        <Text
          size="sm"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--mantine-color-dimmed)',
          }}
        >
          {post.excerpt}
        </Text>
      </Box>
    </GlassContent>
  );
}
