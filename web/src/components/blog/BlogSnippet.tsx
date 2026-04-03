'use client';

import React from 'react';
import { Card, Image, Text, Title, Box } from '@mantine/core';
import type { ContentPostSummary } from '@shared/services/content/contracts';

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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {post.coverImage && (
        <Card.Section>
          <Image
            src={post.coverImage}
            height={160}
            alt={post.altText || `Cover image for ${post.title}`}
            fit="cover"
          />
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
        </Card.Section>
      )}
      <Box mt="md">
        <Title
          order={3}
          mb="xs"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {post.title}
        </Title>
        <Text
          size="sm"
          opacity={0.7}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {post.excerpt}
        </Text>
      </Box>
    </Card>
  );
}
