'use client';

import React from 'react';
import {
  Box,
  Container,
  Title,
  Text,
  Image,
  SimpleGrid,
  Stack,
  Group,
} from '@mantine/core';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import ProjectSnippet from '../components/ProjectSnippet';
import CareerTimeline, { type CareerMilestone } from '../components/timeline/CareerTimeline';
import projectList from '../data/projectList';
import { assets } from '../lib/theme';
import styles from './page.module.css';
import { GlassChrome, GlassContent } from '@/components/design/Glass';
import { SayHelloPill } from '@/components/design/SayHelloPill';
import { ScrollReveal } from '@/components/design/ScrollReveal';
import { useDocumentColorScheme } from '@/hooks/useDocumentColorScheme';

export const careerMilestones: CareerMilestone[] = [
  {
    year: '2015',
    role: 'Mathematics Teacher',
    org: 'TeachFirst / Burnt Mill Academy',
    desc: "Teaching in London schools through TeachFirst. To this day, the hardest thing I've done.",
    color: 'accent',
    side: 'left',
  },
  {
    year: '2017',
    role: 'Analyst then Strategist',
    org: 'Accenture',
    desc: 'Digital transformation across the Royal Navy, Police, and Courts. Then pricing strategy and GDPR in telecom and insurance.',
    color: 'secondary',
    side: 'right',
  },
  {
    year: '2020',
    role: 'COO',
    org: 'Teamvine (Future Factory Ltd)',
    desc: 'Oversaw product, customer services, sales, marketing, compliance, governance, content, ops, IP. Led agile dev teams. Shipped 4 digital products in 6 months. Secured £100k UKRI grant.',
    color: 'primary',
    side: 'left',
  },
  {
    year: '2022',
    role: 'Data Strategy Manager',
    org: 'Anmut',
    desc: 'Data valuation and data maturity. Helping organisations understand what their data is actually worth.',
    color: 'secondary',
    side: 'right',
  },
  {
    year: '2025',
    role: 'COO',
    org: 'HeyLina',
    desc: "Building emotionally intelligent AI. The most exciting thing I've ever worked on.",
    color: 'success',
    side: 'left',
  },
];

const NOW_TILES = [
  {
    label: 'Role',
    body: 'COO at HeyLina, building emotionally intelligent AI.',
  },
  {
    label: 'Building',
    body: 'Agentic workflows that feel human, not robotic.',
  },
  {
    label: 'Reading',
    body: '(placeholder - swap in current book)',
  },
  {
    label: 'Training',
    body: '(placeholder - current sport/goal)',
  },
] as const;

function HeroChips() {
  return (
    <Group justify="center" gap="sm" mt="lg" wrap="wrap">
      <GlassChrome py={6} px="lg" style={{ height: 40, display: 'inline-flex', alignItems: 'center' }}>
        <Text size="sm" c="var(--site-ink)" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--site-accent)',
              flexShrink: 0,
            }}
            aria-hidden
          />
          Available for chats
        </Text>
      </GlassChrome>
      <GlassChrome py={6} px="lg" style={{ height: 40, display: 'inline-flex', alignItems: 'center' }}>
        <Text size="sm" c="var(--site-ink)">
          Based in London
        </Text>
      </GlassChrome>
      <GlassChrome py={6} px="lg" style={{ height: 40, display: 'inline-flex', alignItems: 'center' }}>
        <Text size="sm" c="var(--site-ink)">
          Shipping weekly
        </Text>
      </GlassChrome>
    </Group>
  );
}

export default function Home() {
  const timelineVariant = useDocumentColorScheme();
  const reduceMotion = useReducedMotion();

  const { scrollYProgress, scrollY } = useScroll();
  const heroImageY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const nameY = useTransform(scrollY, [0, 600], [0, -90]);

  const featuredProjects = projectList
    .filter((p) => p.status === 'done')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <Box>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <motion.div style={reduceMotion ? undefined : { y: heroImageY }}>
            <Image
              src="/20250329_AH_Profile_Wales.jpg"
              alt="Angus Hally, hiking in Wales"
              fallbackSrc={assets.placeholderImage.square}
              h={220}
              w={220}
              fit="cover"
              mx="auto"
              mb="xl"
              className={styles.profileImage}
            />
          </motion.div>

          <motion.div
            style={reduceMotion ? undefined : { y: nameY }}
          >
            <Title order={1} className={styles.headline} c="var(--site-ink)">
              Angus Hally
            </Title>
          </motion.div>

          <Text className={styles.subtitleText} c="dimmed">
            Building HeyLina, emotionally intelligent AI.
          </Text>

          <Stack align="center" gap="md" mt="md">
            <SayHelloPill />
            <HeroChips />
          </Stack>
        </div>
      </section>

      <Box component="section" className={styles.nowSection}>
        <Container size="lg">
          <ScrollReveal>
            <Text className={styles.sectionEyebrow} tt="uppercase" size="xs" fw={600} style={{ letterSpacing: '0.08em' }} c="dimmed">
              Snapshot
            </Text>
            <Title order={2} className={styles.sectionDisplay} mb="xl">
              What I&apos;m working on now
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {NOW_TILES.map((tile) => (
                <GlassContent key={tile.label} p="lg">
                  <Text
                    size="sm"
                    tt="uppercase"
                    fw={600}
                    mb="xs"
                    style={{ fontFamily: 'var(--font-display), League Gothic, sans-serif' }}
                    c="dimmed"
                  >
                    {tile.label}
                  </Text>
                  <Text size="md" c="var(--site-ink)">
                    {tile.body}
                  </Text>
                </GlassContent>
              ))}
            </SimpleGrid>
          </ScrollReveal>
        </Container>
      </Box>

      <CareerTimeline
        milestones={careerMilestones}
        eyebrow="The path here"
        heading="From classroom to startup"
        variant={timelineVariant}
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
