'use client';

import React from 'react';
import { Box, Text, Blockquote, useMantineTheme, Group, Avatar, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import type { Testimonial } from '@/data/collab/testimonials';

interface TestimonialSlideProps {
    data: Testimonial & { uniqueId: string };
    isExpanded: boolean;
    onExpand: () => void;
    onClose: () => void;
}

export default function TestimonialSlide({ data, isExpanded, onExpand, onClose }: TestimonialSlideProps) {
    const theme = useMantineTheme();
    const quoteToShow = isExpanded ? (data.fullQuote || data.quote) : data.quote;

    return (
        <Blockquote
            onClick={onExpand}
            style={{ 
                position: 'relative', 
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                margin: 0
            }} 
            cite={
                <Box mt="sm">
                    <Text size="sm" fw={500}>{data.name}</Text>
                    <Text size="xs" c="dark">{data.roleAtTime}{data.company ? `, ${data.company}` : ''}</Text>
                </Box>
            }
            radius="md"
            p="lg"
            styles={theme => ({
                root: {
                    backgroundColor: theme.white,
                    borderLeftColor: theme.colors.primary[6],
                    overflow: 'hidden',
                    maxHeight: isExpanded ? 'none' : '400px',
                    transition: 'max-height 0.7s ease-in-out',
                    position: 'relative',
                    marginTop: 0
                }
            })}
        >
            {isExpanded && (
                <ActionIcon
                    variant="subtle"
                    color="dark"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    style={{ position: 'absolute', top: theme.spacing.sm, right: theme.spacing.sm, zIndex: 1 }}
                    aria-label="Close testimonial"
                >
                    <IconX size={16} />
                </ActionIcon>
            )}

            {data.title && (
                <Text fw={500} mb="xs">{data.title}</Text>
            )}
            <Box 
                style={!isExpanded ? {
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                } : {
                    flex: 1
                }}
            >
                <Text fs="italic" mb="xs">
                    {quoteToShow}
                </Text>
            </Box>

            {data.showProfilePic && (
                <Group justify="center" mt="sm">
                    <Avatar
                        src={data.image}
                        alt={`${data.name} profile picture`}
                        radius="xl"
                        size={isExpanded ? 'lg' : 'md'}
                        style={{ transition: 'width 0.5s ease-in-out, height 0.5s ease-in-out' }}
                    />
                </Group>
            )}
        </Blockquote>
    );
} 