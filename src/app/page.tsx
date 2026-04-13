'use client';

import React from 'react';
import { Box, Container, Title, Text, Image, Button, SimpleGrid, useMantineTheme } from '@mantine/core';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { IconArrowDown } from '@tabler/icons-react';
import Snippet from '../components/Snippet';
import ProjectSnippet from '../components/ProjectSnippet';
import { useLatestPost } from '@/services/content/hooks';
import projectList from '../data/projectList';
import { assets, motionTransitions } from '../lib/theme';
import styles from './page.module.css';

// --- Animation variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...motionTransitions.spring, delay },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, delay },
  }),
};

// --- Data ---
const milestones = [
  {
    year: '2015',
    role: 'Mathematics Teacher',
    org: 'TeachFirst',
    desc: 'Teaching in London schools through the TeachFirst programme. To this day, the hardest thing I\'ve done.',
    color: 'accent',
    side: 'left' as const,
  },
  {
    year: '2017',
    role: 'Analyst & Strategist',
    org: 'Accenture',
    desc: 'Digital transformation across the Royal Navy, Police, and Courts. Then pricing strategy and GDPR in telecom and insurance.',
    color: 'secondary',
    side: 'right' as const,
  },
  {
    year: '2020',
    role: 'Data Strategy Manager',
    org: 'Anmut',
    desc: 'Data valuation and data maturity — helping organisations understand what their data is actually worth.',
    color: 'primary',
    side: 'left' as const,
  },
  {
    year: '2024',
    role: 'COO',
    org: 'HeyLina',
    desc: 'Building emotionally intelligent AI. The most exciting thing I\'ve ever worked on.',
    color: 'success',
    side: 'right' as const,
  },
];

export default function Home() {
  const theme = useMantineTheme();
  const { post: latestBlog } = useLatestPost();
  const { scrollYProgress } = useScroll();

  // Parallax: hero image moves slower than scroll
  const heroImageY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  // Fade hero on scroll
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  const latestProject = projectList
    .filter(p => p.created_at)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())[0];

  return (
    <Box>
      {/* ──────── HERO ──────── */}
      <motion.div style={{ opacity: heroOpacity }}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
            >
              <motion.div style={{ y: heroImageY }}>
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
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={0.15} variants={fadeUp}>
              <Title
                order={1}
                className={styles.headline}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary[8]}, ${theme.colors.secondary[6]})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                I build things at the
                <br />
                intersection of business
                <br />
                &amp; technology.
              </Title>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={0.35} variants={fadeUp}>
              <Text className={styles.subtitleText} c="gray" opacity={0.85}>
                Startup operator, amateur developer, constant learner.
                Currently COO at HeyLina, building emotionally intelligent AI.
              </Text>
            </motion.div>
          </div>

          <motion.div
            className={styles.scrollIndicator}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            >
              <IconArrowDown size={18} />
            </motion.div>
            <div className={styles.scrollLine} />
          </motion.div>
        </section>
      </motion.div>

      {/* ──────── JOURNEY ──────── */}
      <Box
        className={styles.journeySectionDark}
        style={{
          background: `linear-gradient(135deg, ${theme.colors.dark[8]}, ${theme.colors.dark[9]})`,
        }}
      >
        <Container size="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={motionTransitions.viewportOnce}
            custom={0}
            variants={fadeUp}
          >
            <Text className={styles.sectionSubtitle}>The path here</Text>
            <Title order={2} className={styles.sectionTitle}>
              From classroom to startup
            </Title>
          </motion.div>

          <div className={styles.timeline} style={{ '--timeline-color': `${theme.colors.secondary[6]}33` } as React.CSSProperties}>
            <div className={styles.timelineLine} />

            {milestones.map((m, i) => {
              const isLeft = m.side === 'left';

              return (
                <motion.div
                  key={m.year}
                  className={styles.milestone}
                  initial="hidden"
                  whileInView="visible"
                  viewport={motionTransitions.viewportOnce}
                  custom={i * 0.1}
                  variants={fadeUp}
                >
                  {/* Dot on the line */}
                  <div
                    className={styles.milestoneDot}
                    style={{ background: theme.colors[m.color as keyof typeof theme.colors]?.[6] ?? theme.colors.primary[6] }}
                  />

                  {/* Left column */}
                  <div className={styles.milestoneLeft}>
                    {isLeft ? (
                      <>
                        <div className={styles.milestoneYear}>{m.year}</div>
                        <div className={styles.milestoneRole}>{m.role}</div>
                        <div className={styles.milestoneOrg}>{m.org}</div>
                        <div className={styles.milestoneDescLeft}>{m.desc}</div>
                      </>
                    ) : null}
                  </div>

                  {/* Right column */}
                  <div className={styles.milestoneRight}>
                    {!isLeft ? (
                      <>
                        <div className={styles.milestoneYear}>{m.year}</div>
                        <div className={styles.milestoneRole}>{m.role}</div>
                        <div className={styles.milestoneOrg}>{m.org}</div>
                        <div className={styles.milestoneDescRight}>{m.desc}</div>
                      </>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </Box>

      {/* ──────── PHILOSOPHY QUOTE ──────── */}
      <Box className={styles.quoteBlock}>
        <Container size="sm">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={motionTransitions.viewportOnce}
            custom={0}
            variants={fadeIn}
          >
            <Text className={styles.quoteText}>
              &ldquo;Growth comes from pushing past discomfort. The best way to develop is to create, share, and learn from others.&rdquo;
            </Text>
            <Text className={styles.quoteAttribution}>— The philosophy behind this site</Text>
          </motion.div>
        </Container>
      </Box>

      {/* ──────── FEATURED WORK ──────── */}
      <Box className={styles.featuredSection}>
        <Container size="md">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={motionTransitions.viewportOnce}
            custom={0}
            variants={fadeUp}
          >
            <Text className={styles.sectionSubtitle}>What I&apos;m working on</Text>
            <Title order={2} className={styles.sectionTitle} mb="xl">
              Latest work
            </Title>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={motionTransitions.viewportOnce}
            custom={0.15}
            variants={fadeUp}
          >
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {latestBlog && <Snippet {...latestBlog} />}
              {latestProject && <ProjectSnippet project={latestProject} />}
            </SimpleGrid>
          </motion.div>
        </Container>
      </Box>

      {/* ──────── CTA ──────── */}
      <Box className={styles.ctaSection}>
        <Container size="sm">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={motionTransitions.viewportOnce}
            custom={0}
            variants={fadeUp}
          >
            <Title
              order={2}
              className={styles.ctaTitle}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary[8]}, ${theme.colors.secondary[6]})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Let&apos;s connect.
            </Title>
            <Text className={styles.ctaSubtitle}>
              Whether you want to talk startups, data strategy, or just say hello — I&apos;d love to hear from you.
            </Text>
            <Button
              component={Link}
              href="/contact"
              size="lg"
              variant="gradient"
              gradient={{ from: 'teal', to: 'blue' }}
              radius="xl"
            >
              Get in Touch
            </Button>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
