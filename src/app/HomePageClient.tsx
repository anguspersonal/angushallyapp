'use client';

import React from 'react';
import {
  Box,
  Container,
  Title,
  Text,
  SimpleGrid,
  Group,
} from '@mantine/core';
import NextImage from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import ProjectSnippet from '../components/ProjectSnippet';
import CareerTimeline from '../components/timeline/CareerTimeline';
import projectList from '../data/projectList';
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
  const nowSectionRef = React.useRef<HTMLElement | null>(null);

  const { scrollYProgress, scrollY } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const nameY = useTransform(scrollY, [0, 600], [0, -90]);

  const featuredProjects = projectList
    .filter((p) => p.status === 'done')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

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
                src="/20230208_AH_Profile_Professional_Balcony.original.jpg"
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
              <Title order={1} className={styles.headline} c="var(--site-ink)">
                Angus Hally
              </Title>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reduceMotion ? heroSubtitleEntranceReduced : heroSubtitleEntrance}
          >
            <Text className={styles.subtitleText} c="dimmed">
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

      <Box component="section" id="now" ref={nowSectionRef} className={styles.nowSection}>
        <Container size="lg">
          <ScrollReveal>
            <Title order={2} className={styles.sectionDisplay} mb="xl">
              What I&apos;m working on now
            </Title>
            <div className={styles.nowHero}>
              <RichLinkCard
                href={HEYLINA_URL}
                title={cardTitle}
                description={cardDescription}
                imageUrl={og?.image ?? null}
                domainLabel="heylina.ai"
              />
              <div className={styles.whatIDoThere}>
                <Text
                  className={styles.nowKicker}
                  tt="uppercase"
                  size="xs"
                  fw={600}
                  style={{ letterSpacing: '0.08em' }}
                  c="dimmed"
                >
                  WHAT I DO THERE
                </Text>
                <Text className={styles.whatIDoThereBody} c="var(--site-ink)">
                  COO. I look after operations, hiring, fundraising, and partnerships, while our team builds the product itself. It&apos;s the most exciting thing I&apos;ve ever worked on.
                </Text>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </Box>

      <CareerTimeline
        milestones={careerMilestones}
        eyebrow="The path here"
        heading="From classroom to startup"
      />

      <Box className={styles.featuredSection}>
        <Container size="md">
          <ScrollReveal>
            <Text className={styles.sectionEyebrow} tt="uppercase" size="xs" fw={600} style={{ letterSpacing: '0.08em' }} c="dimmed">
              What I&apos;m working on
            </Text>
            <Title order={2} className={styles.sectionDisplay} mb="xl">
              Latest work
            </Title>
          </ScrollReveal>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {featuredProjects.map((project) => (
              <ScrollReveal key={project.id}>
                <ProjectSnippet project={project} />
              </ScrollReveal>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box className={styles.ctaSection}>
        <Container size="sm">
          <ScrollReveal>
            <Title order={2} className={styles.ctaTitle} c="var(--site-ink)">
              Let&apos;s connect.
            </Title>
            <Text className={styles.ctaSubtitle} c="dimmed">
              Whether you want to talk startups, data strategy, or just say hello, I&apos;d love to hear from you.
            </Text>
            <SayHelloPill />
          </ScrollReveal>
        </Container>
      </Box>
    </Box>
  );
}
