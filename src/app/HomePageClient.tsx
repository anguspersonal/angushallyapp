'use client';

import React from 'react';
import {
  Box,
  Title,
  Text,
  Group,
} from '@mantine/core';
import { Section, Stack } from '@/components/layout';
import NextImage from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import CareerTimeline from '../components/timeline/CareerTimeline';
import { careerMilestones } from '@/data/careerMilestones';
import type { OpenGraphData } from '@/lib/og-fetch';
import styles from './page.module.css';
import { SayHelloPill } from '@/components/design/SayHelloPill';
import { ScrollHint } from '@/components/design/ScrollHint';
import { ScrollReveal } from '@/components/design/ScrollReveal';
import { RichLinkCard } from '@/components/RichLinkCard';
import {
  homeHeroEase,
  homeHeroTimings,
  homeHeroTimingsReduced,
} from '@/constants/homeHeroEntrance';

const HEYLINA_URL = 'https://heylina.ai';

const HEYLINA_CARD_FALLBACK_DESCRIPTION =
  'Emotionally intelligent AI that helps people process what they\'re feeling.';

const heroPhotoEntrance = {
  hidden: {
    opacity: 0,
    y: 56,
    scale: 0.74,
    rotate: -8,
    filter: 'blur(18px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: {
      delay: homeHeroTimings.photo.delay,
      duration: homeHeroTimings.photo.duration,
      ease: homeHeroEase,
    },
  },
};

const reducedMotionPhotoEntrance = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: homeHeroTimingsReduced.photo.delay,
      duration: homeHeroTimingsReduced.photo.duration,
    },
  },
};

/** Staggered after photo starts; full motion uses soft rise + fade */
const heroHeadlineEntrance = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: homeHeroTimings.headline.duration,
      ease: homeHeroEase,
      delay: homeHeroTimings.headline.delay,
    },
  },
};

const heroHeadlineEntranceReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: homeHeroTimingsReduced.headline.duration,
      delay: homeHeroTimingsReduced.headline.delay,
    },
  },
};

const heroSubtitleEntrance = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: homeHeroTimings.subtitle.duration,
      ease: homeHeroEase,
      delay: homeHeroTimings.subtitle.delay,
    },
  },
};

const heroSubtitleEntranceReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: homeHeroTimingsReduced.subtitle.duration,
      delay: homeHeroTimingsReduced.subtitle.delay,
    },
  },
};

const heroActionsEntrance = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: homeHeroTimings.actions.duration,
      ease: homeHeroEase,
      delay: homeHeroTimings.actions.delay,
    },
  },
};

const heroActionsEntranceReduced = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: homeHeroTimingsReduced.actions.duration,
      delay: homeHeroTimingsReduced.actions.delay,
    },
  },
};

function HeroChips() {
  return (
    <Group className={styles.heroChipRow} justify="center" gap={8} wrap="wrap">
      <span className={styles.heroChip}>
        <span className={styles.heroChipText}>
          Based in London
        </span>
      </span>
      <span className={styles.heroChip}>
        <span className={styles.heroChipText}>
          Shipping weekly
        </span>
      </span>
    </Group>
  );
}

export type HomePageClientProps = {
  og: OpenGraphData | null;
};

export default function HomePageClient({ og }: HomePageClientProps) {
  const reduceMotion = useReducedMotion();
  /** Phones — kill the scroll-scale on the HeyLina card (1.8x would overflow viewport). */
  const isMobile = useMediaQuery('(max-width: 48em)');
  const nowSectionRef = React.useRef<HTMLElement | null>(null);
  const heyLinaCardRef = React.useRef<HTMLDivElement | null>(null);
  const [heyLinaCardHeight, setHeyLinaCardHeight] = React.useState(0);
  const whatIDoThereRef = React.useRef<HTMLDivElement | null>(null);

  const { scrollYProgress, scrollY } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const nameY = useTransform(scrollY, [0, 600], [0, -90]);

  const { scrollYProgress: nowEntry } = useScroll({
    target: nowSectionRef,
    offset: ['start end', 'start 35%'],
  });
  const nowPullY = useTransform(nowEntry, [0, 1], [-140, 0]);
  const nowOpacity = useTransform(nowEntry, [0, 0.4, 1], [0, 0.6, 1]);

  // HeyLina card scroll-driven scale: grows large as it crosses centre, shrinks again on exit.
  // Origin is top-centre so it only grows downward (heading above stays put);
  // marginBottom is animated to match the scaled-up height so following content gets pushed down.
  const { scrollYProgress: heyLinaScroll } = useScroll({
    target: heyLinaCardRef,
    offset: ['start end', 'end start'],
  });
  const heyLinaScale = useTransform(heyLinaScroll, [0, 0.5, 1], [1, 1.8, 1.8]);
  const heyLinaSpacer = useTransform(
    heyLinaScale,
    (s) => `${Math.max(0, (s - 1) * heyLinaCardHeight)}px`,
  );

  // "WHAT I DO THERE" reveal: bound to its own viewport-entry progress so it only
  // appears once the block is genuinely visible (not just technically in the document flow).
  const { scrollYProgress: whatIDoThereScroll } = useScroll({
    target: whatIDoThereRef,
    offset: ['start 85%', 'start 55%'],
  });
  const whatIDoThereOpacity = useTransform(whatIDoThereScroll, [0, 1], [0, 1]);
  const whatIDoThereY = useTransform(whatIDoThereScroll, [0, 1], [24, 0]);

  // Track the card's natural (unscaled) height so the spacer below scales 1:1.
  React.useEffect(() => {
    const node = heyLinaCardRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setHeyLinaCardHeight(entry.contentRect.height);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const cardTitle = (og?.title?.trim() || 'HeyLina');
  const cardDescription =
    (og?.description?.trim() || HEYLINA_CARD_FALLBACK_DESCRIPTION);

  return (
    <Box>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div style={reduceMotion ? undefined : { y: heroImageY }}>
            <motion.div
              className={styles.profileImageFrame}
              initial="hidden"
              animate="visible"
              variants={reduceMotion ? reducedMotionPhotoEntrance : heroPhotoEntrance}
            >
              <NextImage
                src="/20230208_AH_Profile_Professional_Balcony.jpg"
                alt="Angus Hally professional portrait on a balcony"
                width={440}
                height={440}
                priority
                fetchPriority="high"
                sizes="(max-width: 480px) 50vw, 220px"
                className={styles.profileImage}
              />
            </motion.div>
          </motion.div>

          <motion.div
            style={reduceMotion ? undefined : { y: nameY }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={reduceMotion ? heroHeadlineEntranceReduced : heroHeadlineEntrance}
            >
              <Title order={1} className={styles.headline} style={{ color: 'var(--site-ink)' }}>
                Angus Hally
              </Title>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reduceMotion ? heroSubtitleEntranceReduced : heroSubtitleEntrance}
          >
            <Text className={styles.subtitleText} style={{ color: 'var(--mantine-color-dimmed)' }}>
              Building HeyLina, emotionally intelligent AI.
            </Text>
          </motion.div>

          <motion.div
            className={styles.heroActions}
            initial="hidden"
            animate="visible"
            variants={reduceMotion ? heroActionsEntranceReduced : heroActionsEntrance}
          >
            <HeroChips />
            <ScrollHint targetRef={nowSectionRef} />
          </motion.div>
        </div>
      </section>

      <Section
        id="now"
        outerRef={nowSectionRef}
        className={styles.nowSection}
        ariaLabel="What I'm working on now"
      >
        <motion.div
          style={
            reduceMotion
              ? undefined
              : { y: nowPullY, opacity: nowOpacity, willChange: 'transform' }
          }
        >
          <Stack gap="intra">
            <Title order={2} className={styles.sectionDisplay}>
              What I&apos;m working on now
            </Title>
            <Stack gap="intra" className={styles.nowHero}>
              <motion.div
                ref={heyLinaCardRef}
                style={
                  reduceMotion
                    ? undefined
                    : {
                        scale: isMobile ? 1 : heyLinaScale,
                        transformOrigin: 'top center',
                        marginBottom: isMobile ? 0 : heyLinaSpacer,
                        position: 'relative',
                        zIndex: 5,
                        willChange: isMobile ? undefined : 'transform',
                      }
                }
              >
                <RichLinkCard
                  href={HEYLINA_URL}
                  title={cardTitle}
                  description={cardDescription}
                  imageUrl={og?.image ?? null}
                  domainLabel="heylina.ai"
                />
              </motion.div>
              <motion.div
                ref={whatIDoThereRef}
                style={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: whatIDoThereOpacity,
                        y: whatIDoThereY,
                      }
                }
              >
                <div className={styles.whatIDoThere}>
                  <Text
                    className={styles.nowKicker}
                    tt="uppercase"
                    size="xs"
                    fw={600}
                    style={{ letterSpacing: '0.08em', color: 'var(--mantine-color-dimmed)' }}
                  >
                    WHAT I DO THERE
                  </Text>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <Text className={styles.whatIDoThereBody} style={{ marginBottom: '1em', color: 'var(--site-ink)' }}>
                      I am <strong>COO and co-founder</strong> of HeyLina. The shorthand is I'm a <strong>data strategist</strong> with a builder&apos;s bias and an <strong>operator&apos;s discipline</strong>. A decade across Accenture and Anmut gives me the framework behind our longitudinal emotional data play.
                    </Text>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <Text className={styles.whatIDoThereBody} style={{ marginBottom: '1em', color: 'var(--site-ink)' }}>
                      I built our marketing site, our internal operating system, and the engineering process around our mobile developer. I run <strong>app store launch operations</strong>, the interim raise, our clinical advisor relationships, compliance, and pricing.
                    </Text>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Text className={styles.whatIDoThereBody} style={{ color: 'var(--site-ink)' }}>
                      Bri makes the company exist; I make sure it compounds. It is the <strong>most exciting thing</strong> I have ever worked on.
                    </Text>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    style={{ textAlign: 'center', marginTop: '2em' }}
                  >
                    <Text
                      className={styles.whatIDoThereBody}
                      style={{ marginBottom: '1em', cursor: 'pointer', color: 'var(--site-ink)' }}
                      onClick={() => {
                        const timeline = document.getElementById('career-timeline');
                        timeline?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      How I got here{' '}
                      <motion.span
                        initial={{ rotate: 0 }}
                        whileInView={{ rotate: [0, 20, -10, 20, -10, 0] }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        style={{ display: 'inline-block' }}
                      >
                        👋
                      </motion.span>
                    </Text>
                    <motion.div
                      animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      whileHover={{ y: 0, scale: 1.05 }}
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        color: 'var(--site-ink-muted)',
                        border: '0.5px solid var(--site-ink-muted)',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        background: 'transparent'
                      }}
                      onClick={() => {
                        const timeline = document.getElementById('career-timeline');
                        timeline?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    >
                      <IconChevronDown size={20} stroke={1.5} />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </Stack>
          </Stack>
        </motion.div>
      </Section>

      <div id="career-timeline">
        <CareerTimeline
          milestones={careerMilestones}
          heading="From classroom to startup"
        />
      </div>

      <Section width="narrow" padY="loose">
        <ScrollReveal>
          <Stack gap="intra" style={{ alignItems: 'center', textAlign: 'center' }}>
            <Title order={2} className={styles.ctaTitle} style={{ color: 'var(--site-ink)' }}>
              Let&apos;s connect{' '}
              <motion.span
                initial={{ rotate: 0 }}
                whileInView={{ rotate: [0, 20, -10, 20, -10, 0] }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ display: 'inline-block' }}
              >
                👋
              </motion.span>
            </Title>
            <Text className={styles.ctaSubtitle} style={{ color: 'var(--mantine-color-dimmed)' }}>
              Whether you want to talk startups, data strategy, or just say hello, I&apos;d love to hear from you.
            </Text>
            <SayHelloPill />
          </Stack>
        </ScrollReveal>
      </Section>
    </Box>
  );
}
