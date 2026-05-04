'use client';

import React from 'react';
import Link from 'next/link';
import {
  Title,
  Text,
  Anchor,
  Box,
  Stack,
  Divider,
} from '@mantine/core';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import CareerTimeline from '@/components/timeline/CareerTimeline';
import { careerMilestones } from '@/data/careerMilestones';
import { Section } from '@/components/layout';
import styles from './about.module.css';

export default function About() {
  return (
    <>
      <Section width="narrow" padY="default">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Title
            order={1}
            mb="lg"
            ta="center"
            style={{
              fontFamily: 'var(--font-display), League Gothic, sans-serif',
              textTransform: 'uppercase',
              fontWeight: 400,
              color: 'var(--site-ink)',
            }}
          >
            Hi, I&apos;m Angus
          </Title>

          <Box mb="xl" className={styles.portraitWrap}>
            <NextImage
              src="/20230208_AH_Profile_Poser.jpg"
              alt="Angus Hally"
              width={360}
              height={360}
              priority
              fetchPriority="high"
              sizes="(max-width: 480px) 80vw, 360px"
              className={styles.portrait}
              style={{ borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto' }}
            />
          </Box>

          <Stack gap="lg" mt="xl" className={styles.prose}>
            <Text>
              I&apos;m a startup operator and amateur developer with a passion for the intersection of business strategy,
              software, and data.
            </Text>

            <Text>
              I am COO and co-founder of{' '}
              <Anchor href="https://heylina.com" target="_blank" rel="noopener noreferrer">
                HeyLina
              </Anchor>
              . The shorthand is a data strategist with a builder&apos;s bias and an operator&apos;s discipline. A decade across Accenture and Anmut gives me the framework behind our longitudinal emotional data play. I built our marketing site, our internal operating system, and the engineering process around our mobile developer. I run app store launch operations, the interim raise, our clinical advisor relationships, compliance, and pricing. Bri makes the company exist; I make sure it compounds. It is the most exciting thing I have ever worked on.
            </Text>

            <Text>
              Before that, I was a Data Strategy Manager at{' '}
              <Anchor href="https://www.anmut.co.uk/" target="_blank" rel="noopener noreferrer">
                Anmut
              </Anchor>
              , working on data valuation and data maturity tools like Grace.
            </Text>

            <Text>
              I started my career at Accenture, cutting my teeth as an analyst on digital transformation projects across the
              Royal Navy, Police, and Courts and Tribunals Judiciary (CTJ). Later, I moved into Accenture&apos;s strategy division,
              working on pricing, GDPR, and data-driven insights in large telecom and insurance companies.
            </Text>

            <Text>
              Before all that, I was a mathematics teacher through the TeachFirst programme. To this day, the hardest thing
              I&apos;ve done.
            </Text>

            <Text>
              <em>
                This website is my sandbox, a space to explore personal software projects and challenge myself to put what I
                learn and my thoughts out into the world.
              </em>{' '}
              Honestly, I find that terrifying. But growth comes from pushing past discomfort, and I believe the best way to
              develop is to create, share, and learn from others.
            </Text>

            <Text>
              If you have any thoughts, feedback, or just want to chat, feel free to reach out via the{' '}
              <Anchor component={Link} href="/contact">
                Contact Me
              </Anchor>{' '}
              page.
            </Text>

            <Text fw={700}>Thanks for stopping by. I appreciate it.</Text>
          </Stack>
        </motion.div>
      </Section>

      <Divider my={0} opacity={0.2} />

      <CareerTimeline
        milestones={careerMilestones}
        eyebrow="The career arc"
        heading={"What I've been up to"}
      />

      <Section width="narrow" padY="default">
        <Box className={styles.pullquote} my="xl">
          <span className={styles.pullquoteMark} aria-hidden>
            &ldquo;
          </span>
          <Text component="p" className={styles.pullquoteText}>
            A person honestly documenting their one shot at life. What they&apos;re building, what they&apos;ve learned, and how
            they think. Hope others will find it useful now, or at least, something for my kids to look back on in future.
          </Text>
        </Box>

        <Text ta="center" mt="xl" style={{ color: 'var(--mantine-color-dimmed)' }}>
          If you want the fuller story, the full timeline lives{' '}
          <Anchor component={Link} href="/projects/timeline">
            here
          </Anchor>{' '}
          (sign-in required).
        </Text>
      </Section>
    </>
  );
}
