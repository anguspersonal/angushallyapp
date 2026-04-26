'use client';

import React, { useRef } from 'react';
import { Box, Container, Text, Title, useMantineTheme } from '@mantine/core';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { motionTransitions } from '@/lib/theme';
import { GlassContent } from '@/components/design/Glass';
import styles from './CareerTimeline.module.css';

export type CareerMilestone = {
  year: string;
  role: string;
  org: string;
  desc: string;
  color: string;
  side: 'left' | 'right';
};

interface CareerTimelineProps {
  milestones: CareerMilestone[];
  eyebrow?: string;
  heading?: string;
  variant?: 'light' | 'dark';
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...motionTransitions.spring, delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay },
  }),
};

function CareerTimeline({
  milestones,
  eyebrow,
  heading,
  variant = 'light',
}: CareerTimelineProps) {
  const theme = useMantineTheme();
  const isDark = variant === 'dark';
  const reducedMotion = useReducedMotion();

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 20%'],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const lineColor = isDark ? 'rgba(250, 247, 240, 0.22)' : 'rgba(13, 31, 30, 0.12)';

  const cardVariants = reducedMotion ? fadeIn : fadeUp;

  return (
    <Box className={styles.section} style={{ color: 'var(--site-ink)' }}>
      <Container size="lg">
        {(eyebrow || heading) && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={motionTransitions.viewportOnce}
            custom={0}
            variants={cardVariants}
          >
            {eyebrow && (
              <Text className={styles.sectionEyebrow} c="dimmed">
                {eyebrow}
              </Text>
            )}
            {heading && (
              <Title
                order={2}
                className={styles.sectionTitle}
                style={{
                  fontFamily: 'var(--font-display), League Gothic, sans-serif',
                  textTransform: 'uppercase',
                  fontWeight: 400,
                }}
              >
                {heading}
              </Title>
            )}
          </motion.div>
        )}

        <div
          ref={timelineRef}
          className={styles.timeline}
          style={{ ['--timeline-color' as string]: lineColor } as React.CSSProperties}
        >
          <motion.div
            className={styles.timelineLine}
            style={reducedMotion ? undefined : { scaleY: lineScaleY, transformOrigin: 'top' }}
          />

          {milestones.map((m, i) => {
            const isLeft = m.side === 'left';
            const dotColor =
              theme.colors[m.color as keyof typeof theme.colors]?.[6] ?? theme.colors.teal[6];

            return (
              <motion.div
                key={`${m.year}-${m.role}`}
                className={styles.milestone}
                initial="hidden"
                whileInView="visible"
                viewport={motionTransitions.viewportOnce}
                custom={i * 0.1}
                variants={cardVariants}
              >
                <div className={styles.milestoneDot} style={{ background: dotColor }} />

                <GlassContent
                  className={styles.milestoneGlass}
                  p={{ base: 'md', sm: 'lg' }}
                  style={{
                    flex: 1,
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                  }}
                >
                  <div className={styles.milestoneLeft}>
                    {isLeft && (
                      <>
                        <div className={styles.milestoneYear}>{m.year}</div>
                        <div className={styles.milestoneRole}>{m.role}</div>
                        <div className={styles.milestoneOrg}>{m.org}</div>
                        <div className={styles.milestoneDescLeft}>{m.desc}</div>
                      </>
                    )}
                  </div>

                  <div className={styles.milestoneRight}>
                    {!isLeft && (
                      <>
                        <div className={styles.milestoneYear}>{m.year}</div>
                        <div className={styles.milestoneRole}>{m.role}</div>
                        <div className={styles.milestoneOrg}>{m.org}</div>
                        <div className={styles.milestoneDescRight}>{m.desc}</div>
                      </>
                    )}
                  </div>
                </GlassContent>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </Box>
  );
}

export default CareerTimeline;
