'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Text, Title, useMantineTheme, type MantineTheme } from '@mantine/core';
import { Section } from '@/components/layout';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion';
import { motionTransitions } from '@/lib/theme';
import { GlassContent } from '@/components/design/Glass';
import { LazyImageSequence } from '@/components/media/LazyImageSequence';
import styles from './CareerTimeline.module.css';

const CARD_BORDER_RADIUS = 20; // Matches Glass.module.css `.content { border-radius: 20px; }`

export type CareerMilestone = {
  year: string;
  role: string;
  org: string;
  desc: string;
  image?: {
    src: string;
    alt: string;
  };
  images?: Array<{
    src: string;
    alt: string;
  }>;
  color: string;
  side: 'left' | 'right';
};

interface CareerTimelineProps {
  milestones: CareerMilestone[];
  eyebrow?: string;
  heading?: string;
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

/**
 * Animated border that draws outward from the top-centre of the card,
 * tracing both halves of the rounded rectangle in sync and meeting at the bottom-centre.
 * pathLength is bound to a scroll-progress MotionValue so the border "fills in" as the card
 * passes through the viewport.
 */
function MilestoneBorder({
  progress,
  strokeColor,
}: {
  progress: MotionValue<number>;
  strokeColor: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const { width, height } = size;
  const r = Math.min(CARD_BORDER_RADIUS, width / 2, height / 2);

  // Right half: top-centre → top-right corner → right side → bottom-right corner → bottom-centre.
  const rightPath =
    width > 0 && height > 0
      ? `M ${width / 2} 0 L ${width - r} 0 A ${r} ${r} 0 0 1 ${width} ${r} L ${width} ${height - r} A ${r} ${r} 0 0 1 ${width - r} ${height} L ${width / 2} ${height}`
      : '';

  // Left half: top-centre → top-left corner → left side → bottom-left corner → bottom-centre.
  const leftPath =
    width > 0 && height > 0
      ? `M ${width / 2} 0 L ${r} 0 A ${r} ${r} 0 0 0 0 ${r} L 0 ${height - r} A ${r} ${r} 0 0 0 ${r} ${height} L ${width / 2} ${height}`
      : '';

  return (
    <div
      ref={containerRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      {width > 0 && height > 0 && (
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          <motion.path
            d={rightPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ pathLength: progress, opacity: progress }}
          />
          <motion.path
            d={leftPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinecap="round"
            style={{ pathLength: progress, opacity: progress }}
          />
        </svg>
      )}
    </div>
  );
}

interface MilestoneProps {
  milestone: CareerMilestone;
  index: number;
  reducedMotion: boolean | null;
  cardVariants: Variants;
  theme: MantineTheme;
}

function Milestone({ milestone: m, index: i, reducedMotion, cardVariants, theme }: MilestoneProps) {
  const ref = useRef<HTMLDivElement>(null);
  // Per-card progress: starts when the card enters the viewport from the bottom (top at 80%),
  // completes as it leaves the upper third (bottom at 30%). Feels naturally tied to scrolling past.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 80%', 'end 30%'],
  });

  const isLeft = m.side === 'left';
  const milestoneImages = m.images ?? (m.image ? [m.image] : []);
  const dotColor =
    theme.colors[m.color as keyof typeof theme.colors]?.[6] ?? theme.colors.teal[6];

  return (
    <motion.div
      ref={ref}
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
          {!isLeft && milestoneImages.length > 0 && (
            <div className={styles.milestoneImageStackLeft}>
              <LazyImageSequence
                images={milestoneImages}
                className={styles.milestoneImageSequence}
                imageClassName={styles.milestoneImage}
              />
            </div>
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
          {isLeft && milestoneImages.length > 0 && (
            <div className={styles.milestoneImageStackRight}>
              <LazyImageSequence
                images={milestoneImages}
                className={styles.milestoneImageSequence}
                imageClassName={styles.milestoneImage}
              />
            </div>
          )}
        </div>

        {!reducedMotion && (
          <MilestoneBorder progress={scrollYProgress} strokeColor={dotColor} />
        )}
      </GlassContent>
    </motion.div>
  );
}

function CareerTimeline({
  milestones,
  eyebrow,
  heading,
}: CareerTimelineProps) {
  const theme = useMantineTheme();
  const reducedMotion = useReducedMotion();

  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 20%'],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const cardVariants = reducedMotion ? fadeIn : fadeUp;

  return (
    <Section width="wide" padY="none" className={styles.section} style={{ color: 'var(--site-ink)' }}>
        {(eyebrow || heading) && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={motionTransitions.viewportOnce}
            custom={0}
            variants={cardVariants}
          >
            {eyebrow && (
              <Text className={styles.sectionEyebrow} style={{ color: 'var(--mantine-color-dimmed)' }}>
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

        <div ref={timelineRef} className={styles.timeline}>
          <motion.div
            className={styles.timelineLine}
            style={reducedMotion ? undefined : { scaleY: lineScaleY, transformOrigin: 'top' }}
          />

          {milestones.map((m, i) => (
            <Milestone
              key={`${m.year}-${m.role}`}
              milestone={m}
              index={i}
              reducedMotion={reducedMotion}
              cardVariants={cardVariants}
              theme={theme}
            />
          ))}
        </div>
    </Section>
  );
}

export default CareerTimeline;
