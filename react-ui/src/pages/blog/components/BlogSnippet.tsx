import React from 'react';
import { Card, Image, Text, Title, Box, Anchor } from '@mantine/core';
import '../../../index.css';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image?: string;
  alt_text?: string;
  attribution?: string;
  attribution_link?: string;
}

interface BlogSnippetProps {
  post: BlogPost;
}

function BlogSnippet(props: BlogSnippetProps) {
    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            {props.post.cover_image && (
                <Card.Section>
                    <Image
                        src={props.post.cover_image}
                        height={160}
                        alt={props.post.alt_text || `Cover image for ${props.post.title}`}
                        fit="cover"
                    />
                    {props.post.attribution && (
                        <Text size="xs" c="dimmed" ta="right" px="md" py="xs">
                            {props.post.attribution_link ? (
                                <Anchor href={props.post.attribution_link} target="_blank" rel="noopener noreferrer" c="dimmed">
                                    {props.post.attribution}
                                </Anchor>
                            ) : (
                                props.post.attribution
                            )}
                        </Text>
                    )}
                </Card.Section>
            )}
            <Box mt="md">
                <Title order={3} className="truncate-two-lines" mb="xs">
                    {props.post.title}
                </Title>
                <Text size="sm" className="truncate-two-lines" c="dimmed">
                    {props.post.excerpt}
                </Text>
            </Box>
        </Card>
    );
}

export default BlogSnippet;