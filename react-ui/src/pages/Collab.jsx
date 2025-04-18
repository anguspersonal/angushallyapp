// pages/Collab.jsx
import React, { useRef } from 'react';
import { Container, Title, Text, Anchor, Group, Button, Stack, Box, Image, Flex, useMantineTheme, Accordion } from '@mantine/core';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@mantine/hooks';
import { IconSettings, IconTargetArrow, IconTrendingUp, IconMicrophone, IconCoin, IconChartBar } from '@tabler/icons-react';
import Header from '../components/Header';
import TraitGrid from '../components/TraitGrid';
import CaseStudies from '../components/CaseStudies';
import FounderJourney from '../components/FounderJourney';
import { motionTransitions } from '../theme';
import '../general.css';

// Styles that don't need to be recreated on each render
const sectionStyles = {
  transparent: { width: '100%' },
  colored: { background: 'var(--mantine-color-primary-0)', width: '100%' },
};

function Collab() {
  const letsTalkRef = useRef(null);
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Stack spacing={0}>
      <Header />

      {/* Hero Section (1) - No background */}
      <Box style={sectionStyles.transparent}>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Flex
            gap="xl"
            mih="auto"
            style={{
              flexDirection: isSmallScreen ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: isSmallScreen ? 'center' : 'flex-start',
              textAlign: isSmallScreen ? 'center' : 'left',
              paddingTop: isSmallScreen ? theme.spacing.md : 0,
            }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={motionTransitions.spring}
              style={{
                maxWidth: '20em',
                width: '100%',
                marginBottom: isSmallScreen ? theme.spacing.xl : 0
              }}
            >
              <Image
                src="/profile3.jpg"
                alt="Angus Hally - Strategy Consultant and Startup Operator"
                radius="50%"
                fit="contain"
                loading="eager"
                style={{ display: 'block', width: '100%', height: 'auto' }}
                sx={(theme) => ({
                  flexShrink: 0,
                  border: `2px solid ${theme.colors.gray[3]}`,
                  boxShadow: theme.shadows.md,
                })}
              />
            </Box>

            <Box
              component={motion.div}
              initial={{ opacity: 0, x: +100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={motionTransitions.spring}
              className="centre_stage"
              style={{
                alignItems: isSmallScreen ? 'center' : 'flex-start',
                textAlign: isSmallScreen ? 'center' : 'left',
                width: '100%'
              }}
            >
              <Title
                order={1}
                style={{
                  textAlign: isSmallScreen ? 'center' : 'left',
                  fontSize: isSmallScreen ? theme.fontSizes.xl * 1.2 : undefined
                }}
              >
                Turn Ideas into Traction
              </Title>
              <Text
                size="xl"
                style={{
                  marginBottom: '1rem',
                  textAlign: isSmallScreen ? 'center' : 'left'
                }}
              >
                From <Anchor href='https://www.accenture.com/gb-en' target='_blank' rel='noopener noreferrer'>Accenture</Anchor> to startups — I've built strategy, shipped products, and led through chaos.
                I'm a generalist operator with technical fluency, data strategy expertise, and real startup experience.
                Now I work with early-stage founders to shape ideas, build traction, and move fast.
              </Text>
              <Group
                spacing="xl"
                style={{
                  justifyContent: isSmallScreen ? 'center' : 'flex-start'
                }}
              >
                <Button variant="gradient" gradient={{ from: 'teal', to: 'blue' }} onClick={() => scrollToSection(letsTalkRef)}>Let's Talk</Button>
                <Button variant="outline" onClick={() => scrollToSection(letsTalkRef)}>Learn More</Button>
              </Group>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* What I Bring Section (2) - Colored */}
      <Box style={sectionStyles.colored}>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Flex
            direction={isSmallScreen ? 'column' : 'row'}
            gap="xl"
            align="center"
            justify="space-between"
            pl={isSmallScreen ? 0 : theme.spacing.xl * 3}
          >
            <Box 
              style={{ flex: 1 }}
              component={motion.div}
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={motionTransitions.spring}
            >
              <Title align="left" order={2} size="h1" mb="md">⚡What I Bring</Title>
              <Text size="lg" mb="xl" align="justify">
                I bring a rare combination of strategy, execution,
                and empathy — shaped by experience in consulting, startups, product, and code. I've delivered under pressure,
                built from zero, and led with energy and care. These eight traits capture how I show up in early-stage teams.
              </Text>
            </Box>

            <Box
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                width: isSmallScreen ? '100%' : 'auto',
                minHeight: isSmallScreen ? '60vh' : 'auto'
              }}
            >
              <TraitGrid />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Where I Add Value Section (3) - No background */}
      <Box style={sectionStyles.transparent}>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: +100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={motionTransitions.spring}
            my="xl"
          >
            <Title order={2} mb="md">Where I Add The Most Value</Title>
            <Text size="sm" color="dimmed" mb="lg">
              I don't just advise — I embed, contribute, and help unlock traction. Here's where I create the most impact:
            </Text>

            <Accordion variant="separated" transitionDuration={200}>
              <Accordion.Item value="operations">
                <Accordion.Control icon={<IconSettings size={18} />}>
                  Operational Clarity & Momentum
                </Accordion.Control>
                <Accordion.Panel>
                  I help you put just enough process in place to move fast and scale well — without adding friction.
                  From scoping priorities to building team rhythms, I bring momentum to messy early-stage operations.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="proposition">
                <Accordion.Control icon={<IconTargetArrow size={18} />}>
                  Proposition Shaping
                </Accordion.Control>
                <Accordion.Panel>
                  I turn raw ideas into clear, tested value propositions that land with users and investors.
                  Whether you're still shaping the problem or refining your pitch, I'll help sharpen what matters.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="gtm">
                <Accordion.Control icon={<IconTrendingUp size={18} />}>
                  Early Go-To-Market
                </Accordion.Control>
                <Accordion.Panel>
                  I help you launch early campaigns, engage first users, and start getting signal on what works.
                  This includes messaging, outreach, conversion paths, and customer discovery.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="exposure">
                <Accordion.Control icon={<IconMicrophone size={18} />}>
                  Exposure & Advocacy
                </Accordion.Control>
                <Accordion.Panel>
                  I represent your startup at events, pitches, and in the press — or help you do it with clarity and confidence.
                  I support storytelling, investor comms, and getting your vision across to the right people.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="fundraising">
                <Accordion.Control icon={<IconCoin size={18} />}>
                  Fundraising Support
                </Accordion.Control>
                <Accordion.Panel>
                  From refining your deck and narrative to warm intros and prep, I help you raise smarter and show up strong in the room.
                  I support pre-seed and seed-stage founders ready to put their case forward.
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="data">
                <Accordion.Control icon={<IconChartBar size={18} />}>
                  Data & Measurement Strategy
                </Accordion.Control>
                <Accordion.Panel>
                  I help you decide what to measure, how to measure it, and why it matters.
                  We'll build lightweight, scalable systems to track performance and inform smart decisions.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Box>
        </Container>
      </Box>

      {/* Case Studies Section (4) - Colored */}
      <Box style={sectionStyles.colored}>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <CaseStudies />
        </Container>
      </Box>

      {/* Founder Journey Section (5) - No background */}
      <Box style={sectionStyles.transparent}>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <FounderJourney />
        </Container>
      </Box>

      {/* Let's Talk Section (6) - Colored */}
      <Box style={sectionStyles.colored} ref={letsTalkRef}>
        <Container size="sm" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Title order={2} align="left" color="accent.8">Let's Talk</Title>
          <Text size="lg" mt="md" mb="xl">
            Ready to explore how we can work together? Fill out the contact form below and I'll get back to you within 24 hours to schedule a discovery call.
          </Text>
          <Button 
            component="a" 
            href="/contact"
            size="lg"
            variant="gradient" 
            gradient={{ from: 'teal', to: 'blue' }}
          >
            Contact Me
          </Button>
        </Container>
      </Box>
    </Stack>
  );
}

export default Collab;
