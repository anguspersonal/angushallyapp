'use client';

import React, { useRef } from 'react';
import { Badge, Container } from '@mantine/core';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import timelineData from '@/data/personalTimeline.json';
import styles from './TimelinePage.module.css';
import { GlassContent } from '@/components/design/Glass';

type TimelineCategory =
  | 'foundational'
  | 'personal'
  | 'enterprise'
  | 'community'
  | 'education'
  | 'milestone'
  | 'career'
  | 'rupture'
  | 'relationships';

type TimelineEntry = {
  date: string;
  title: string;
  body: string;
  category: TimelineCategory;
  stub?: boolean;
};

const CATEGORY_META: Record<
  TimelineCategory,
  { label: string; color: 'primary' | 'secondary' | 'accent' | 'success' | 'gray' | 'dark' }
> = {
  foundational: { label: 'Foundational', color: 'primary' },
  personal: { label: 'Personal', color: 'secondary' },
  enterprise: { label: 'Enterprise', color: 'accent' },
  community: { label: 'Community', color: 'success' },
  education: { label: 'Education', color: 'primary' },
  milestone: { label: 'Milestone', color: 'success' },
  career: { label: 'Career', color: 'secondary' },
  rupture: { label: 'Rupture', color: 'gray' },
  relationships: { label: 'Relationships', color: 'accent' },
};

const entries = timelineData as TimelineEntry[];

function EntryCard({
  entry,
  meta,
  isLeft,
  reducedMotion,
}: {
  entry: TimelineEntry;
  meta: (typeof CATEGORY_META)[TimelineCategory];
  isLeft: boolean;
  reducedMotion: boolean | null;
}) {
  const enterFrom = reducedMotion ? { opacity: 0 } : { opacity: 0, x: isLeft ? -40 : 40, y: 20 };

  const inner = (
    <>
      <div className={styles.badgeRow}>
        <Badge color={meta.color} size="xs" variant="light">
          {meta.label}
        </Badge>
        {entry.stub && (
          <Badge color="gray" size="xs" variant="outline">
            Draft
          </Badge>
        )}
      </div>
      <div className={styles.date}>{entry.date}</div>
      <div className={styles.entryTitle}>{entry.title}</div>
      <div className={styles.body}>{entry.body}</div>
    </>
  );

  return (
    <motion.div
      className={isLeft ? styles.cardLeft : styles.cardRight}
      initial={enterFrom}
      whileInView={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={
        reducedMotion ? { duration: 0.3 } : { type: 'spring', stiffness: 90, damping: 22, duration: 0.8 }
      }
    >
      <GlassContent p="lg">{inner}</GlassContent>
    </motion.div>
  );
}

export default function TimelinePage() {
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start 90%', 'end 10%'],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Container size="lg" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Timeline</h1>
        <p className={styles.subtitle}>
          The honest, personal version. Life, career, and the moments in between, gathered in one place.
        </p>
      </div>

      <div ref={wrapRef} className={styles.timelineWrap}>
        <motion.div className={styles.centralLine} style={reducedMotion ? undefined : { scaleY: lineScaleY }} />

        {entries.map((entry, i) => {
          const isLeft = i % 2 === 0;
          const meta = CATEGORY_META[entry.category];
          const showEra = i === 0 || entry.category !== entries[i - 1].category;

          return (
            <React.Fragment key={`${entry.date}-${entry.title}`}>
              {showEra && (
                <motion.div
                  className={styles.eraBand}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.eraLabel}>{meta.label}</div>
                </motion.div>
              )}

              <div className={styles.entry}>
                <div className={styles.dot} style={{ background: `var(--mantine-color-${meta.color}-6)` }} />

                {isLeft ? (
                  <>
                    <EntryCard entry={entry} meta={meta} isLeft reducedMotion={reducedMotion} />
                    <div className={styles.emptyCell} />
                  </>
                ) : (
                  <>
                    <div className={styles.emptyCell} />
                    <EntryCard entry={entry} meta={meta} isLeft={false} reducedMotion={reducedMotion} />
                  </>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Container>
  );
}
