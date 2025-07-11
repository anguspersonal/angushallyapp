'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box, Title, Text, useMantineTheme } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import Autoplay from 'embla-carousel-autoplay';
import '@mantine/carousel/styles.css';
import TestimonialSlide from './TestimonialSlide';
import CaseStudySlide from './CaseStudySlide';
import { testimonials, type Testimonial } from '@/data/collab/testimonials';
import { caseStudies, type CaseStudy } from '@/data/collab/caseStudies';

interface SlideItem {
    type: 'testimonial' | 'caseStudy';
    id: number;
    uniqueId: string;
    [key: string]: any;
}

interface CustomCarouselProps {
    title?: string;
    description?: string;
    slides?: (Testimonial | CaseStudy)[];
    type?: 'mixed' | 'testimonials' | 'caseStudies';
}

export default function CustomCarousel({ 
    title = "Featured Content", 
    description = "Testimonials and case studies from our collaborations",
    slides,
    type = 'mixed'
}: CustomCarouselProps) {
    const theme = useMantineTheme();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const autoplay = useRef(Autoplay({ delay: 2000 }));
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    // Combine and shuffle the slides
    const allSlides = useMemo(() => {
        let slideData: (Testimonial | CaseStudy)[];
        
        if (slides) {
            slideData = slides;
        } else if (type === 'testimonials') {
            slideData = testimonials;
        } else if (type === 'caseStudies') {
            slideData = caseStudies;
        } else {
            slideData = [...testimonials, ...caseStudies];
        }

        return slideData
            .map(item => ({
                ...item,
                uniqueId: `${item.type}-${item.id}`
            }))
            .sort(() => Math.random() - 0.5);
    }, [slides, type]);

    const collapseItem = useCallback(() => {
        if (expandedId !== null) {
            setExpandedId(null);
            autoplay.current.play();
        }
    }, [expandedId]);

    const handleExpand = (itemId: string) => {
        setExpandedId(prevId => {
            if (prevId === itemId) {
                collapseItem();
                return null;
            } else {
                if (prevId !== null) {
                    collapseItem();
                }
                autoplay.current.stop();
                return itemId;
            }
        });
    };

    // Effect for Escape key listener
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                collapseItem();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [collapseItem]);

    // Effect for Click Outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (expandedId !== null && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                collapseItem();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [expandedId, collapseItem]);

    return (
        <Box my="xl" ref={containerRef}>
            <Title order={2} mb="md">{title}</Title>
            <Text size="sm" c="dark" mb="lg">
                {description}
            </Text>

            <Carousel
                withIndicators
                slideSize={{ base: '100%', sm: '50%', md: '33.3333%' }}
                slideGap={{ base: 'xs', sm: 'md' }}
                loop
                align="start"
                slidesToScroll={isMobile ? 1 : 2}
                plugins={[autoplay.current]}
                controlsOffset={isMobile ? 'xs' : 'md'}
                controlSize={isMobile ? 24 : 30}
                onMouseEnter={() => autoplay.current.stop()}
                onMouseLeave={() => autoplay.current.play()}
                styles={{
                    root: {
                        width: '100%'
                    },
                    container: {
                        gap: 'md'
                    },
                    slide: {
                        display: 'block',
                        padding: isMobile ? theme.spacing.xs : 0
                    },
                    control: {
                        '&&[data-inactive]': {
                            opacity: 0,
                            cursor: 'default'
                        },
                        border: `1px solid ${theme.colors.dark[3]}`,
                        backgroundColor: theme.white,
                        boxShadow: theme.shadows.sm,
                        '&&:hover': {
                            backgroundColor: theme.white
                        }
                    },
                    indicators: {
                        bottom: isMobile ? -30 : -20,
                        gap: isMobile ? theme.spacing.xs : theme.spacing.md
                    },
                    indicator: {
                        width: 12,
                        height: 4,
                        transition: 'width 250ms ease',
                        backgroundColor: theme.colors.secondary[6],
                        '&&[data-active]': {
                            width: isMobile ? 24 : 40,
                            backgroundColor: theme.colors.secondary[8],
                        },
                    },
                }}
            >
                {allSlides.map((item) => (
                    <Carousel.Slide key={item.uniqueId}>
                        <div style={{ 
                            height: 'auto',
                            maxWidth: isMobile ? '100%' : '90%',
                            margin: '0 auto'
                        }}>
                            {item.type === 'testimonial' ? (
                                <TestimonialSlide
                                    data={item as Testimonial}
                                    isExpanded={item.uniqueId === expandedId}
                                    onExpand={() => handleExpand(item.uniqueId)}
                                    onClose={collapseItem}
                                />
                            ) : (
                                <CaseStudySlide
                                    data={item as CaseStudy}
                                    isExpanded={item.uniqueId === expandedId}
                                    onExpand={() => handleExpand(item.uniqueId)}
                                    onClose={collapseItem}
                                />
                            )}
                        </div>
                    </Carousel.Slide>
                ))}
            </Carousel>
        </Box>
    );
} 