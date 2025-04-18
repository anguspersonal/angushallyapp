/**
 * TODO: Next Steps
 * 1. Content Updates:
 *    - Replace placeholder case study content with real examples
 *    - Create and add unique images for each case study (recommended size: 1200x630px)
 *    - Ensure each case study follows the Challenge → Solution → Outcome structure
 * 
 * 2. Site Credentialing:
 *    - Add testimonials section (possibly between Case Studies and Founder Journey)
 *    - Create supporting blog posts that demonstrate expertise in each case study area
 *    - Consider adding logos of companies worked with (if permitted)
 *    - Add downloadable resources or white papers to showcase depth of knowledge
 */

import { Carousel } from '@mantine/carousel';
import { Card, Text, Title, Box, Flex, Image, useMantineTheme } from '@mantine/core';
import { IconCheck, IconHammer, IconRocket, IconChartBar, IconBulb, IconUsers } from '@tabler/icons-react';
import '@mantine/carousel/styles.css';
import { useMediaQuery } from '@mantine/hooks';

const caseStudies = [
  {
    image: "/case-studies/project-turnaround.jpg",
    icon: <IconHammer size={24} />,
    title: 'Project Turnaround (Anmut)',
    challenge: 'Project floundering from unclear scope and misaligned stakeholders.',
    solution: 'Aligned team, clarified scope, rebuilt delivery rhythm.',
    outcome: 'Delivered on time, regained client trust, and rebuilt momentum.'
  },
  {
    image: "/case-studies/covid-rollout.jpg",
    icon: <IconRocket size={24} />,
    title: 'COVID Rollout Acceleration (Accenture)',
    challenge: 'Urgent remote onboarding process was too slow.',
    solution: 'Redesigned onboarding workflow, scaled up delivery.',
    outcome: 'Scaled onboarding from 2 → 30 users/day within one week.'
  },
  {
    image: "/case-studies/product-foundations.jpg",
    icon: <IconBulb size={24} />,
    title: 'Product Foundations (Teamvine)',
    challenge: 'No internal delivery systems or product roadmap.',
    solution: 'Took ownership of product and ops — roadmap, content, compliance.',
    outcome: 'Built solid product foundation, enabling future scale.'
  },
  {
    image: "/case-studies/revenue-insight.jpg",
    icon: <IconChartBar size={24} />,
    title: 'Revenue Insight (Telecom Client)',
    challenge: 'Low conversion across digital channels.',
    solution: 'Built four customer data models to uncover cross-sell opportunities.',
    outcome: 'Unlocked £4M in incremental revenue through smarter targeting.'
  },
  {
    image: "/case-studies/value-prop.jpg",
    icon: <IconUsers size={24} />,
    title: 'Value Proposition Reset (Startup Founder)',
    challenge: 'Founder struggling to articulate what the product really did.',
    solution: 'Facilitated discovery sessions, rewrote the core proposition, and rebuilt pitch deck.',
    outcome: 'Clearer messaging, stronger pitch, and early investor interest.'
  },
  {
    image: "/case-studies/team-alignment.jpg",
    icon: <IconCheck size={24} />,
    title: 'Team Alignment Under Pressure (Multi-Stakeholder Public Project)',
    challenge: 'Conflicting priorities across multiple departments derailing delivery.',
    solution: 'Ran alignment workshops, reset goals, clarified roles.',
    outcome: 'Project realigned, delivered on time, and stakeholders reengaged.'
  }
];

function CaseStudies() {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const isMediumScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  // Determine slides per view based on screen size
  const slidesPerView = isSmallScreen ? 1 : isMediumScreen ? 2 : 3;

  return (
    <Box my="xl">
      <Title order={2} mb="md">Real Impact</Title>
      <Text size="sm" color="dimmed" mb="lg">
        A few snapshots of where I've helped unlock clarity, traction, or delivery when it mattered.
      </Text>

      <Carousel
        withIndicators
        slideSize={`${100 / slidesPerView}%`}
        slideGap="md"
        loop
        align="start"
        slidesToScroll={1}
        styles={{
          indicators: {
            bottom: -20,
          },
          indicator: {
            width: 12,
            height: 4,
            transition: 'width 250ms ease',
            backgroundColor: theme.colors.secondary[6],
            '&[data-active]': {
              width: 40,
              backgroundColor: theme.colors.secondary[8],
            },
          },
        }}
      >
        {caseStudies.map((item, index) => (
          <Carousel.Slide key={index}>
            <Card shadow="md" padding={0} radius="md" withBorder style={{ height: '25em' }}>
              <Card.Section>
                <Box style={{ position: 'relative' }}>
                  <Image
                    src={item.image}
                    height={160}
                    alt={item.title}
                    loading={index < slidesPerView ? "eager" : "lazy"}
                    style={{ objectFit: 'cover' }}
                  />
                  <Box
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: 'white',
                      borderRadius: '50%',
                      padding: 8,
                      boxShadow: theme.shadows.sm
                    }}
                  >
                    {item.icon}
                  </Box>
                </Box>
              </Card.Section>
              <Flex
                direction="column"
                align="center"
                justify="center"
                p="md"
                gap="sm"
              >
                <Title order={4} mb="xs" align="center">{item.title}</Title>
                <Text size="xs" color="dimmed" mb="xs" align="center"><strong>Challenge:</strong> {item.challenge}</Text>
                <Text size="xs" color="dimmed" mb="xs" align="center"><strong>What I did:</strong> {item.solution}</Text>
                <Text size="xs" c="teal.6" align="center"><strong>Outcome:</strong> {item.outcome}</Text>
              </Flex>
            </Card>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Box>
  );
}

export default CaseStudies;