// @ts-nocheck - Dynamic case study component with complex state management and conditional rendering that TypeScript cannot properly infer
/**
 * TODO: Next Steps
 * 1. Content Updates:
 *    - Replace placeholder case study content with real examples
 *    - Create and add unique images for each case study (recommended size: 1200x630px)
 *    - Ensure each case study follows the Challenge → Solution → Outcome structure
 * 
 * 2. Site Credentialing:
 *    - Add testimonials section (possibly between Case Studies and Founder Journey)
 *    - Update the "Where I add the most value" section to include the links to new case studies
 *    - Create supporting blog posts that demonstrate expertise in each case study area
 *    - Consider adding logos of companies worked with (if permitted)
 *    - Add downloadable resources or white papers to showcase depth of knowledge
 */

import { Card, Text, Group, Image, Badge, ActionIcon, Box, Button, Anchor } from '@mantine/core';
import { IconX, IconArrowRight } from '@tabler/icons-react';

function CaseStudySlide({ data, isExpanded, onExpand, onClose }) {
    const handleCloseClick = (event) => {
        event.stopPropagation(); 
        onClose();
    };

    const handleBlogClick = (event) => {
        event.stopPropagation(); // Prevent card expansion when clicking the button
    };

    return (
        <Card
            shadow="sm"
            padding={0}
            radius="md"
            withBorder
            onClick={() => onExpand(data.uniqueId)}
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
                    color="gray"
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
                        c="dimmed" 
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
                    <Text weight={500} mb="xs">{data.title}</Text>
                    <Badge color="blue" variant="light">
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
                        <Text size="sm" color="dimmed">
                            {data.challenge}
                        </Text>
                    ) : (
                        <Box>
                            <Text size="sm" weight={500} mb="xs">Challenge:</Text>
                            <Text size="sm" color="dimmed" mb="md">
                                {data.challenge}
                            </Text>

                            <Text size="sm" weight={500} mb="xs">Solution:</Text>
                            <Text size="sm" color="dimmed" mb="md">
                                {data.solution}
                            </Text>

                            <Text size="sm" weight={500} mb="xs">Outcome:</Text>
                            <Text size="sm" color="dimmed" mb="md">
                                {data.outcome}
                            </Text>

                            <Group position="right" mt="lg">
                                <Button
                                    component="a"
                                    href={data.blogPostSlug}
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                    onClick={handleBlogClick}
                                    rightIcon={<IconArrowRight size={16} />}
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

export default CaseStudySlide;