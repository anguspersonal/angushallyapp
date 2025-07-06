// pages/Collab.jsx
import React, { useRef } from 'react';
import { Container, Title, Text, Anchor, Group, Button, Stack, Box, Image, Flex, useMantineTheme, Accordion } from '@mantine/core';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@mantine/hooks';
import { IconSettings, IconTargetArrow, IconTrendingUp, IconMicrophone, IconCoin, IconChartBar } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import TraitGrid from './collab/components/TraitGrid';
import CustomCarousel from './collab/components/Carousel';
import FounderJourney from './collab/components/FounderJourney';
import { testimonials } from './collab/data/testimonials';
import { caseStudies } from './collab/data/caseStudies';
import { motionTransitions, assets } from '../theme';
import '../general.css';

// Styles that don't need to be recreated on each render
const sectionStyles = {
  transparent: { width: '100%' },
  colored: { background: 'var(--mantine-color-primary-0)', width: '100%' },
};

function Collab() {
  const letsTalkRef = useRef(null);
  const whatIBringRef = useRef(null);
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box>
      <Header />
      
      {/* Hero Section (1) */}
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
              src="/20250414_AH_Profile_CP_Summit.jpg"
              fallbackSrc={assets.placeholderImage.square}
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
              <Button component="a"
                href="/contact"
                variant="gradient"
                gradient={{ from: 'teal', to: 'blue' }}>Let's Talk</Button>
              <Button variant="outline" onClick={() => scrollToSection(whatIBringRef)}>Learn More</Button>
            </Group>
          </Box>
        </Flex>
      </Container>

      {/* What I Bring Section (2) */}
      <Box style={{ background: 'var(--mantine-color-primary-0)', width: '100%' }} ref={whatIBringRef}>
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

      {/* Where I Add The Most Value Section (3) */}
      <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
        <Title align="centre" order={2} mb="md">Where I Add The Most Value</Title>
        <Text size="sm" color="dimmed" mb="lg">
          I don't just advise — I embed, contribute, and help unlock traction. Here's where I create the most impact:
        </Text>
        <Box
          align="left"
          component={motion.div}
          initial={{ opacity: 0, y: +100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={motionTransitions.spring}
          my="xl"
        >
        

          <Accordion variant="separated" transitionDuration={200}>
            <Accordion.Item value="operations">
              <Accordion.Control icon={<IconSettings size={18} />}>
                Operational Clarity & Momentum
              </Accordion.Control>
              <Accordion.Panel>
                I help you build just enough structure to get out of chaos and into forward motion — without slowing things down.
                <br /><br />
                That means helping you:
                <ul>
                  <li>Scope priorities across product, people, and delivery</li>
                  <li>Build lightweight systems and rituals for execution</li>
                  <li>Get your early team aligned and moving fast</li>
                </ul>
                I've turned around floundering public sector projects <Anchor component={Link} to="/blog/vej-pandemic-rollout"><strong>(see: VEJ rollout)</strong></Anchor>, scaled startup operations from scratch <Anchor component={Link} to="/blog/future-factory-digital-pivot"><strong>(see: Teamvine)</strong></Anchor>, and led agile teams through high-pressure, time-sensitive delivery.
              </Accordion.Panel>

            </Accordion.Item>

            <Accordion.Item value="proposition">
              <Accordion.Control icon={<IconTargetArrow size={18} />}>
                Proposition Shaping
              </Accordion.Control>
              <Accordion.Panel>
                Whether you've got a half-formed idea or a product with traction, I help you sharpen what you're really offering — and why it matters.
                <br /><br />
                I can help you:
                <ul>
                  <li>Run structured discovery to clarify the problem you're solving</li>
                  <li>Craft a crisp, compelling value proposition</li>
                  <li>Test and refine your messaging with early users and investors</li>
                </ul>
                I've done this with early-stage founders <Anchor component={Link} to="/blog/retail-journey-insight"><strong>(see: Proposition Reset case)</strong></Anchor> and in pitching for grant funding <Anchor component={Link} to="/blog/future-factory-digital-pivot"><strong>(see: Future Factory / Teamvine)</strong></Anchor>. I translate complexity into narrative clarity — fast.
              </Accordion.Panel>

            </Accordion.Item>

            <Accordion.Item value="gtm">
              <Accordion.Control icon={<IconTrendingUp size={18} />}>
                Early Go-To-Market
              </Accordion.Control>
              <Accordion.Panel>
                I help you move from "we're building" to "people are using this" — by finding the fastest path to real traction.
                <br /><br />
                I support you to:
                <ul>
                  <li>Design and run your first outreach campaigns</li>
                  <li>Set up landing pages, feedback loops, and conversion paths</li>
                  <li>Collect signal to guide product and commercial focus</li>
                </ul>
                I've helped teams get to market while still building <Anchor component={Link} to="/blog/future-factory-digital-pivot"><strong>(see: Teamvine launch)</strong></Anchor> and helped large-scale clients unlock sales from dormant segments <Anchor component={Link} to="/blog/commercial-usage-insight"><strong>(see: Telecom Insight)</strong></Anchor>.
              </Accordion.Panel>

            </Accordion.Item>

            <Accordion.Item value="exposure">
              <Accordion.Control icon={<IconMicrophone size={18} />}>
                Exposure & Advocacy
              </Accordion.Control>
              <Accordion.Panel>
                I support founders to tell their story — at events, in decks, in investor meetings, and beyond.
                <br /><br />
                I can:
                <ul>
                  <li>Help refine your pitch and sharpen your narrative</li>
                  <li>Represent your startup at events and on stage</li>
                  <li>Coach you to pitch with clarity, confidence, and presence</li>
                </ul>
                I've presented to C-suites <Anchor component={Link} to="/blog/commercial-usage-insight"><strong>(Telecom £4M insight)</strong></Anchor>, secured grant funding <Anchor component={Link} to="/blog/future-factory-digital-pivot"><strong>(Teamvine)</strong></Anchor>, and often serve as a founder's external amplifier and co-strategist in the room.
              </Accordion.Panel>

            </Accordion.Item>

            <Accordion.Item value="fundraising">
              <Accordion.Control icon={<IconCoin size={18} />}>
                Fundraising Support
              </Accordion.Control>
              <Accordion.Panel>
                Fundraising's not just about the pitch — it's about story, structure, and confidence.
                <br /><br />
                I help with:
                <ul>
                  <li>Deck refinement and narrative framing</li>
                  <li>Structuring your ask, milestones, and equity logic</li>
                  <li>Warm intros, pitch prep, and investor Q&A</li>
                </ul>
                I've helped secure public funding <Anchor component={Link} to="/blog/future-factory-digital-pivot"><strong>(Innovate UK grant – Teamvine)</strong></Anchor> and regularly coach founders through positioning for pre-seed and seed. I bring strategic thinking plus delivery support so your raise gets you real momentum.
              </Accordion.Panel>

            </Accordion.Item>

            <Accordion.Item value="data">
              <Accordion.Control icon={<IconChartBar size={18} />}>
                Data & Measurement Strategy
              </Accordion.Control>
              <Accordion.Panel>
                Data isn't just dashboards — it's about knowing what matters and making better decisions faster.
                <br /><br />
                I help you:
                <ul>
                  <li>Define success metrics linked to growth and learning</li>
                  <li>Set up lightweight, scalable tracking systems</li>
                  <li>Link data insights to product, marketing, or funding priorities</li>
                </ul>
                I've built data valuation frameworks for national agencies <Anchor component={Link} to="/blog/dvsa-data-valuation"><strong>(DVSA)</strong></Anchor>, commercial models unlocking millions <Anchor component={Link} to="/blog/commercial-usage-insight"><strong>(Telecoms)</strong></Anchor>, and internal systems to track performance in startups <Anchor component={Link} to="/blog/future-factory-digital-pivot"><strong>(Teamvine)</strong></Anchor>.
              </Accordion.Panel>

            </Accordion.Item>
          </Accordion>
        </Box>
      </Container>

      {/* Impact Section (4) */}
      <Box style={{ background: 'var(--mantine-color-primary-0)', width: '100%' }}>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <CustomCarousel
            title="Impact & Testimonials"
            description="Real results and feedback from clients and partners"
            slides={[...testimonials, ...caseStudies].sort(() => Math.random() - 0.5)}
            type="mixed"
          />
        </Container>
      </Box>

      {/* Founder Journey Section (5) */}
      <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
        <FounderJourney />
      </Container>

      {/* Let's Talk Section (7) */}
      <Container size="sm" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg} ref={letsTalkRef}>
        <Title order={2} align="left" color="accent.8">Let's Talk</Title>
        <Text align="left" size="lg" mt="md" mb="xl">
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
  );
}

export default Collab;
