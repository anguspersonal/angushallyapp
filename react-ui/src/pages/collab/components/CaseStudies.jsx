/**
 * TODO: Next Steps
 * 1. Content Updates:
 *    - Replace placeholder case study content with real examples
 *    - Create and add unique images for each case study (recommended size: 1200x630px)
 *    - Ensure each case study follows the Challenge → Solution → Outcome structure
 * 
 * 2. Site Credentialing:
 *    - Add testimonials section (possibly between Case Studies and Founder Journey)
 *    - Update the "Where I add the most value" section to include the links to new case studies
 *    - Create supporting blog posts that demonstrate expertise in each case study area
 *    - Consider adding logos of companies worked with (if permitted)
 *    - Add downloadable resources or white papers to showcase depth of knowledge
 */

import { Carousel } from '@mantine/carousel';
import { Card, Text, Title, Box, Flex, Image, useMantineTheme, Button } from '@mantine/core';
import { IconCheck, IconHammer, IconRocket, IconChartBar, IconBulb, IconUsers, IconShieldLock, } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import '@mantine/carousel/styles.css';
import { assets } from '../../../theme';

const caseStudies = [
  {
    id: 0,
    image: "/20250419_Analog_to_Digital_Transition_Teamvine.png",
    icon: <IconBulb size={24} />,
    title: "Future Factory Pivot to Teamvine",
    tags: ["startup", "grant funding", "product strategy"],
    challenge:
      "Pivoting from physical team-building kits to an online platform with no technical founder or external funding.",
    solution:
      "Secured a £100k Innovate UK grant, built the MVP with part-time developers, and launched the first digital product.",
    outcome:
      "Established Teamvine as a digital-first company and validated the new business model through early traction.",
    blogPostSlug: "/blog/future-factory-digital-pivot"
  },
  {
    id: 1,
    image: "/20250419_Digital_Courtroom_Scene.png",
    icon: <IconRocket size={24} />,
    title: "COVID Rollout – Remote Justice Enablement",
    tags: ["public sector", "covid response", "delivery leadership"],
    challenge:
      "Hundreds of legal staff needed access to remote court systems during lockdown, but onboarding was slow and unscalable.",
    solution:
      "Redesigned the onboarding process, managed a team of analysts, and scaled onboarding from 2 to 30 users/day.",
    outcome:
      "Enabled 500+ legal professionals across 5 agencies to access court remotely, keeping justice moving during lockdown.",
    blogPostSlug: "/blog/vej-pandemic-rollout"
  },
  {
    id: 2,
    image: "/20250419_Strategic_Corporate_Insights.png",
    icon: <IconChartBar size={24} />,
    title: "£4M Commercial Insight (Telecoms)",
    tags: ["data analysis", "customer segmentation", "enterprise"],
    challenge:
      "Client lacked a behaviour-based view of customers, limiting upsell opportunities across thousands of tariffs.",
    solution:
      "Developed four models using product usage data and cluster analysis to identify micro-segments.",
    outcome:
      "Identified £12.3M in opportunity; £4M uplift realised through revised sales targeting within a year.",
    blogPostSlug: "/blog/commercial-usage-insight"
  },
  {
    id: 3,
    image: "/20250419_Telecom_Store_Observation.png",
    icon: <IconUsers size={24} />,
    title: "Retail Journey Uplift – Secret Shopper Insight",
    tags: ["cx design", "conversion", "retail"],
    challenge:
      "Retail stores failed to capture consent from walkouts, limiting follow-up and conversion.",
    solution:
      "Performed secret shopper visits, identified the gap, and led a redesign of the customer journey.",
    outcome:
      "Proposed changes projected to increase revenue by £1.1M–£3.5M annually through re-engagement.",
    blogPostSlug: "/blog/retail-journey-insight"
  },
  {
    id: 4,
    image: "/20250419_Data_Operations_Room.png",
    icon: <IconShieldLock size={24} />,
    title: "DVSA Data Valuation & Strategy",
    tags: ["data strategy", "public sector", "valuation"],
    challenge:
      "DVSA held extensive datasets but lacked a strategy to prioritise data investment.",
    solution:
      "Led a valuation project to assess financial and strategic impact of data assets.",
    outcome:
      "Delivered a framework used to guide strategic data funding and investment prioritisation.",
    blogPostSlug: "/blog/dvsa-data-valuation"
  },
  {
    id: 5,
    image: "/20250419_Unified_Data_Illumination.png",
    icon: <IconHammer size={24} />,
    title: "Marketing Consent & Data Strategy (Telecom)",
    tags: ["gdpr", "data governance", "revenue modelling"],
    challenge:
      "Conflicting customer preferences across systems made many contacts unmarketable, limiting revenue.",
    solution:
      "Modelled uplift from unifying identity and consent data; built a £2.7M–£4.5M p.a. business case for centralisation.",
    outcome:
      "Influenced data roadmap; became a go-to for privacy strategy among MDs and data leads.",
    blogPostSlug: "/blog/telecom-gdpr-marketing-strategy"
  },
];

function CaseStudies() {
  const theme = useMantineTheme();

  return (
<Box my="xl">
  <Title order={2} mb="md">Real Impact</Title>
  <Text size="sm" color="dimmed" mb="lg">
        A few snapshots of where I've helped unlock clarity, traction, or delivery when it mattered.
  </Text>

  <Carousel
    withIndicators
    slideSize={{ base: '100%', sm: '50%', md: '33.3333%' }}
    slideGap={{ base: 0, sm: 'md' }}
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
      <Carousel.Slide key={item.id}>
            <Card shadow="md" padding={0} radius="md" withBorder style={{ height: '33em' }}>
              <Card.Section>
                <Box style={{ position: 'relative' }}>
                  <Image
                    src={item.image}
                    fallbackSrc={assets.placeholderImage.landscape}
                    height={160}
                    alt={item.title}
                    loading={index < 3 ? "eager" : "lazy"}
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
                justify="space-between"
                p="md"
                gap="xs"
                style={{ height: 'calc(100% - 160px)' }}
              >
                <Box>
                    <Title order={4} mb="xs" align="center">{item.title}</Title>
                    <Text size="xs" color="dimmed" mb="xs" align="center"><strong>Challenge:</strong> {item.challenge}</Text>
                    <Text size="xs" color="dimmed" mb="xs" align="center"><strong>What I did:</strong> {item.solution}</Text>
                    <Text size="xs" c="teal.6" align="center"><strong>Outcome:</strong> {item.outcome}</Text>
                </Box>

                {item.blogPostSlug && (
                  <Button
                    component={Link}
                    to={item.blogPostSlug}
                    variant="light"
                    size="xs" 
                    mt="md"
                  >
                    Read Related Post
                  </Button>
                )}
              </Flex>
        </Card>
      </Carousel.Slide>
    ))}
  </Carousel>
</Box>
  );
}

export default CaseStudies;