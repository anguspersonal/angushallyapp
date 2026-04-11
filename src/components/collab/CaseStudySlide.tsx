'use client';

import React from 'react';
import { Card, Text, Group, Image, Badge, ActionIcon, Box, Button, Anchor } from '@mantine/core';
import { IconX, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import type { CaseStudy } from '@/data/collab/caseStudies';

interface CaseStudySlideProps {
    data: CaseStudy & { uniqueId: string };
    isExpanded: boolean;
    onExpand: () => void;
    onClose: () => void;
}

export default function CaseStudySlide({ data, isExpanded, onExpand, onClose }: CaseStudySlideProps) {
    const handleCloseClick = (event: React.MouseEvent) => {
        event.stopPropagation(); 
        onClose();
    };

    const handleBlogClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent card expansion when clicking the button
    };

    return (
        <Card
            shadow="sm"
            padding={0}
            radius="md"
            withBorder
            onClick={onExpand}
            style={{ 
                cursor: 'pointer', 
                position: 'relative', 
                height: '100%',
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: isExpanded ? 'visible' : 'hidden'
            }}
        >
            {isExpanded && (
                <ActionIcon
                    variant="subtle"
                    color="dark"
                    size="sm"
                    onClick={handleCloseClick}
                    style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    aria-label="Close case study"
                >
                    <IconX size={16} />
                </ActionIcon>
            )}

            <Card.Section style={{ flex: '0 0 auto', position: 'relative' }}>
                <Image
                    src={data.image.src}
                    height={160}
                    alt={data.image.alt}
                    fit="cover"
                />
                {isExpanded && data.image.attribution && (
                    <Text 
                        size="xs" 
                        c="dark" 
                        style={{ 
                            position: 'absolute', 
                            bottom: 4, 
                            right: 8,
                            fontSize: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            padding: '2px 6px',
                            borderRadius: 4
                        }}
                    >
                        {data.image.attributionLink ? (
                            <Anchor 
                                href={data.image.attributionLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ color: 'inherit' }}
                            >
                                {data.image.attribution}
                            </Anchor>
                        ) : (
                            data.image.attribution
                        )}
                    </Text>
                )}
            </Card.Section>

            <Box 
                p="lg" 
                style={{ 
                    flex: 1,
                    position: 'relative',
                    height: isExpanded ? 'auto' : '100%',
                    overflow: isExpanded ? 'visible' : 'hidden'
                }}
            >
                <Box mb="xs" style={{ textAlign: 'center' }}>
                    <Text fw={500} mb="xs">{data.title}</Text>
                    <Badge color="primary" variant="light">
                        {data.tags[0]}
                    </Badge>
                </Box>

                <Box style={!isExpanded ? {
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                } : undefined}>
                    {!isExpanded ? (
                        <Text size="sm" c="dark">
                            {data.challenge}
                        </Text>
                    ) : (
                        <Box>
                            <Text size="sm" fw={500} mb="xs">Challenge:</Text>
                            <Text size="sm" c="dark" mb="md">
                                {data.challenge}
                            </Text>

                            <Text size="sm" fw={500} mb="xs">Solution:</Text>
                            <Text size="sm" c="dark" mb="md">
                                {data.solution}
                            </Text>

                            <Text size="sm" fw={500} mb="xs">Outcome:</Text>
                            <Text size="sm" c="dark" mb="md">
                                {data.outcome}
                            </Text>

                            <Group justify="flex-end" mt="lg">
                                <Button
                                    component={Link}
                                    href={data.blogPostSlug}
                                    variant="light"
                                    color="primary"
                                    size="sm"
                                    onClick={handleBlogClick}
                                    rightSection={<IconArrowRight size={16} />}
                                >
                                    Read Full Case Study
                                </Button>
                            </Group>
                        </Box>
                    )}
                </Box>
            </Box>
        </Card>
    );
} 