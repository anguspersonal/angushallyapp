'use client';

import React from 'react';
import { Card, Image, Text, Title, Box } from '@mantine/core';
import type { BlogPostSummary } from '../../types/blog';

interface BlogSnippetProps {
  post: BlogPostSummary;
}

export default function BlogSnippet({ post }: BlogSnippetProps) {
    const handleAttributionClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the event from bubbling up to the parent anchor
        if (post.attribution_link) {
            window.open(post.attribution_link, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            {post.cover_image && (
                <Card.Section>
                    <Image
                        src={post.cover_image}
                        height={160}
                        alt={post.alt_text || `Cover image for ${post.title}`}
                        fit="cover"
                    />
                    {post.attribution && (
                        <Text size="xs" opacity={0.7} ta="right" px="md" py="xs">
                            {post.attribution_link ? (
                                <Text 
                                    component="span"
                                    opacity={0.7}
                                    onClick={handleAttributionClick}
                                    style={{ 
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        textDecorationStyle: 'dotted'
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
                        textOverflow: 'ellipsis'
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
                        textOverflow: 'ellipsis'
                    }}
                >
                    {post.excerpt}
                </Text>
            </Box>
        </Card>
    );
} 