// pages/Collab.jsx
import React, { useRef } from 'react';
import { Container, Title, Text, List, ThemeIcon, Anchor, Group, Button, Stack, Box, Image, Flex, useMantineTheme, Accordion } from '@mantine/core';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@mantine/hooks';
import { IconCheck, IconTarget, IconLock, IconSettings, IconTargetArrow, IconTrendingUp, IconMicrophone, IconCoin, IconChartBar } from '@tabler/icons-react';
import Header from '../components/Header';
import TraitGrid from '../components/TraitGrid';
import '../general.css';

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

      {/* Hero Section - Responsive styles via inline style prop */}
      <Box>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>


          <Flex
            gap="xl"
            mih="auto" // Adjust min height dynamically
            style={{
              flexDirection: isSmallScreen ? 'column' : 'row',
              alignItems: 'center', // Always center align items in Flex
              justifyContent: isSmallScreen ? 'center' : 'flex-start',
              textAlign: isSmallScreen ? 'center' : 'left',
              paddingTop: isSmallScreen ? theme.spacing.md : 0, // Add some top padding on mobile
            }}
          >
            {/* Wrapper for Image to constrain size */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.8
              }}
              style={{
                maxWidth: '20em',
                width: '100%', // Fill the max width
                marginBottom: isSmallScreen ? theme.spacing.xl : 0 // Keep margin logic here
              }}
            >
              <Image
                src="/profile3.jpg"
                alt="Angus Hally"
                // Let the wrapper control width/height constraints 
                // w="auto"
                // h={200}
                radius="50%"
                fit="contain"
                style={{ display: 'block', width: '100%', height: 'auto' }} // Ensure image scales within wrapper
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
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.8
              }}
              className="centre_stage"
              style={{
                alignItems: isSmallScreen ? 'center' : 'flex-start',
                textAlign: isSmallScreen ? 'center' : 'left',
                width: '100%' // Allow text box to take available width
              }}
            >
              <Title
                order={1}
                style={{
                  textAlign: isSmallScreen ? 'center' : 'left',
                  fontSize: isSmallScreen ? theme.fontSizes.xl * 1.2 : undefined // Slightly larger title on mobile?
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
                From <a href='https://www.accenture.com/gb-en' target='_blank' rel='noopener noreferrer'>Accenture</a> to startups - I've built strategy, shipped products, and led through chaos.
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

      {/* What I Bring Section - Use style prop with primary[0] */}
      <Box style={{ background: '#E8EBE8', width: '100%' }}>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Flex
            direction={isSmallScreen ? 'column' : 'row'}
            gap="xl"
            align="center"
            justify="space-between"
            pl={isSmallScreen ? 0 : theme.spacing.xl * 3}
          >
            <Box style={{ flex: 1 }}>
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

      {/* Where I Add Value Section */}
      <Box>
        <Container size="lg" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Box my="xl">
            <Title order={2} mb="md">Where I Add Value</Title>
            <Text size="sm" color="dimmed" mb="lg">
              I don’t just advise — I embed, contribute, and help unlock traction. Here’s where I create the most impact:
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
                  Whether you’re still shaping the problem or refining your pitch, I’ll help sharpen what matters.
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

      {/* How I Work Section - No explicit background, revert content */}
      <Box>
        <Container size="md" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Title order={2} align="right">How I Work With Founders</Title>
          <br />
          <List type="ordered" align="right" spacing="md" size="lg">
            <List.Item><Text weight={600}>We talk. You tell me what you're working on.</Text></List.Item>
            <List.Item><Text weight={600}>I make a proposal. Just a clear, focused way I could help.</Text></List.Item>
            <List.Item><Text weight={600}>We get to work. I embed with your team and we move fast.</Text></List.Item>
          </List>
        </Container>
      </Box>

      {/* Value Section - Use style prop with secondary[0] */}
      <Box style={{ background: '#E8EDF2', width: '100%' }}>
        <Container size="sm" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Title order={2} align="left" color="secondary.8">Where I Add the Most Value</Title>
          <br />
          <List
            spacing="md"
            align="left"
            size="lg"
            icon={<ThemeIcon variant="filled" color="secondary.6" size={24} radius="xl"><IconTarget size={16} /></ThemeIcon>}
            styles={{ itemWrapper: { justifyContent: 'flex-start' } }}
          >
            <List.Item>Proposition Shaping</List.Item>
            <List.Item>Early GTM</List.Item>
            <List.Item>Data Strategy</List.Item>
            <List.Item>Product Strategy</List.Item>
            <List.Item>Technical Advisory</List.Item>
          </List>
        </Container>
      </Box>



      {/* What Makes This Work Section - No explicit background, revert content */}
      <Box>
        <Container size="sm" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Title order={2} align="right">What Makes This Work</Title>
          <br />
          <List
            align="right"
            spacing="md"
            size="lg"
            icon={<ThemeIcon variant="filled" color="green" size={24} radius="xl"><IconCheck size={16} /></ThemeIcon>}
            styles={{ itemWrapper: { justifyContent: 'flex-start' } }}
          >
            <List.Item>You've got an idea with real potential</List.Item>
            <List.Item>You're open to challenge</List.Item>
            <List.Item>You want to move fast</List.Item>
          </List>
        </Container>
      </Box>

      {/* Let's Talk Section - Use style prop with accent[0] */}
      <Box style={{ background: '#F9F5F3', width: '100%' }} ref={letsTalkRef}>
        <Container size="sm" p={isSmallScreen ? theme.spacing.sm : theme.spacing.lg}>
          <Title order={2} align="left" color="accent.8">Let's Talk</Title>
          <br />
          <Stack align="flex-start" spacing="md">
            <Text size="lg" align="left">Book a discovery call: <Anchor href="[Calendly link]">Calendly link</Anchor></Text>
            <Text size="lg" align="left">Or email me directly: <Anchor href="mailto:[email]">email</Anchor></Text>
          </Stack>
        </Container>
      </Box>
    </Stack>
  );
}

export default Collab;
