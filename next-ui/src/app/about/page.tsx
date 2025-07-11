'use client';

import { Container, Title, Text, Image, Anchor, Group, ActionIcon, Box } from '@mantine/core';
import { IconBrandLinkedin, IconBrandGithub, IconBrandX, IconBrandInstagram } from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { assets } from '../../lib/theme';

// Social media links with proper typing
interface SocialLink {
  readonly href: string;
  readonly icon: React.ComponentType<{ size: number }>;
  readonly label: string;
}

const socialLinks: readonly SocialLink[] = [
  {
    href: 'https://www.linkedin.com/in/angus-hally-9ab66a87',
    icon: IconBrandLinkedin,
    label: 'LinkedIn'
  },
  {
    href: 'https://github.com/anguspersonal',
    icon: IconBrandGithub,
    label: 'GitHub'
  },
  {
    href: 'https://x.com/HallyAngus',
    icon: IconBrandX,
    label: 'X (Twitter)'
  },
  {
    href: 'https://www.instagram.com/hallyangus/',
    icon: IconBrandInstagram,
    label: 'Instagram'
  }
] as const;

export default function About() {
    return (
        <Container size="sm" py="xl">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Title order={2} mb="lg">Hi, I'm Angus</Title>

                <Box mb="lg" style={{ maxWidth: 250, margin: '0 auto' }}>
                    <Image
                        src="/20230208_AH_Profile_Poser.jpg"
                        alt="Angus Hally"
                        fallbackSrc={assets.placeholderImage.square}
                        radius="xl"
                        style={{ display: 'block', width: '100%', height: 'auto' }}
                    />
                </Box>
                <br />

                <Text mb="md">
                    I'm a strategy consultant and amateur developer with a passion for the intersection of
                    <Text span fw={700}> business strategy,</Text> software, and data.
                </Text>

                <Text mb="md">
                    I started my career at
                    <Anchor href="https://www.accenture.com/gb-en" target="_blank" rel="noopener noreferrer"> Accenture</Anchor>,
                    cutting my teeth as an analyst in digital transformation projects across the
                    <Anchor href="https://www.royalnavy.mod.uk/" target="_blank" rel="noopener noreferrer"> Royal Navy</Anchor>,
                    <Anchor href="https://www.sussex-pcc.gov.uk/pcc-priorities/partnership-working/video-enabled-justice-vej/" target="_blank" rel="noopener noreferrer"> Police</Anchor>, and
                    <Anchor href="https://www.judiciary.uk/" target="_blank" rel="noopener noreferrer"> Courts and Tribunals Judiciary (CTJ)</Anchor>.
                    Later, I moved into Accenture's <Text span fw={700}>strategy division</Text>, working on
                    <Text span fw={700}> pricing, GDPR, and data-driven insights</Text> in large telecom and insurance companies.
                </Text>

                <Text mb="md">
                    Before all that, I was a <Text span fw={700}>mathematics teacher</Text> through the
                    <Anchor href="https://www.teachfirst.org.uk/" target="_blank" rel="noopener noreferrer"> TeachFirst program</Anchor>—to this day, the hardest thing I've done.
                </Text>

                <Text mb="md">
                    Currently, I work as a <Text span fw={700}>Data Strategy Manager at
                    <Anchor href="https://www.anmut.co.uk/" target="_blank" rel="noopener noreferrer"> Anmut</Anchor></Text>,
                    a data management consultancy shaking up the industry with its
                    <Anchor href="https://www.anmut.co.uk/solutions/data-valuation/" target="_blank" rel="noopener noreferrer"> data valuation service</Anchor> and
                    cutting-edge data maturity tools, like <Anchor href="https://www.anmut.co.uk/solutions/data-maturity/" target="_blank" rel="noopener noreferrer">Grace</Anchor>.
                </Text>

                <Text mb="md">
                    This website is my<Text span fw={700}> sandbox</Text>—a space to explore <Text span fw={700}> personal software projects</Text> and challenge myself to put what I learn and my thoughts out into the world.
                    Honestly, I find that terrifying. But growth comes from pushing past discomfort, and I believe the best way to develop is to
                    <Text span fw={700}> create, share, and learn from others</Text>.
                </Text>

                <Text mb="md">
                    If you have any thoughts, feedback, or just want to chat, feel free to reach out via the
                    <Anchor component={Link} href="/next/contact">Contact Me</Anchor> page.
                </Text>

                <Text fw={700} mb="lg">Thanks for stopping by—I appreciate it!</Text>

                <Group justify="center" gap="lg">
                    {socialLinks.map((social) => {
                        const IconComponent = social.icon;
                        return (
                            <ActionIcon 
                                key={social.label}
                                component="a" 
                                href={social.href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                variant="subtle" 
                                size="lg"
                                aria-label={social.label}
                            >
                                <IconComponent size={24} />
                            </ActionIcon>
                        );
                    })}
                </Group>
            </motion.div>
        </Container>
    );
}