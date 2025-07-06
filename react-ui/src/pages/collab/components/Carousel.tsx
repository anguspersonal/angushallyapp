// @ts-nocheck
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Box, Title, Text, useMantineTheme } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import Autoplay from 'embla-carousel-autoplay';
import '@mantine/carousel/styles.css';
import TestimonialSlide from './TestimonialSlide';
import CaseStudySlide from './CaseStudySlide';
import { testimonials } from '../data/testimonials';
import { caseStudies } from '../data/caseStudies';

function CustomCarousel({ /* title, description, slides, type */ }) {
    const theme = useMantineTheme();
    const [expandedId, setExpandedId] = useState(null);
    const autoplay = useRef(Autoplay({ delay: 2000 }));
    const containerRef = useRef(null);
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    // Combine and shuffle the slides only once on mount
    // Note: Currently using hardcoded testimonials and caseStudies instead of props
    const allSlides = useMemo(() => {
        return [...testimonials, ...caseStudies]
            .map(item => ({
                ...item,
                uniqueId: `${item.type}-${item.id}`
            }))
            .sort(() => Math.random() - 0.5);
    }, []);

    const collapseItem = useCallback(() => {
        if (expandedId !== null) {
            setExpandedId(null);
            autoplay.current.play();
        }
    }, [expandedId]);

    const handleExpand = (itemId) => {
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
        const handleKeyDown = (event) => {
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
        const handleClickOutside = (event) => {
            if (expandedId !== null && containerRef.current && !containerRef.current.contains(event.target)) {
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
            <Title order={2} mb="md">Featured Content</Title>
            <Text size="sm" color="dimmed" mb="lg">
                Testimonials and case studies from our collaborations
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
                onMouseEnter={autoplay.current.stop}
                onMouseLeave={autoplay.current.play}
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
                        '&[data-inactive]': {
                            opacity: 0,
                            cursor: 'default'
                        },
                        border: `1px solid ${theme.colors.gray[3]}`,
                        backgroundColor: theme.white,
                        boxShadow: theme.shadows.sm,
                        '&:hover': {
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
                        '&[data-active]': {
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
                                    data={item}
                                    isExpanded={item.uniqueId === expandedId}
                                    onExpand={() => handleExpand(item.uniqueId)}
                                    onClose={collapseItem}
                                />
                            ) : (
                                <CaseStudySlide
                                    data={item}
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

export default CustomCarousel; 