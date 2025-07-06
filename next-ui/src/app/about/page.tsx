'use client';

import { Box, Container, Title, Text, Image, Anchor, Group, ActionIcon } from '@mantine/core';
import { IconBrandLinkedin, IconBrandGithub, IconBrandX, IconBrandInstagram } from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import { assets } from '../../lib/theme';

const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

export default function About() {
    return (
        <Box>
            <Header />
            <Container size="sm" py="xl">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div custom={0} variants={contentVariants}>
                        <Title order={2} mb="lg">Hi, I&apos;m Angus</Title>
                    </motion.div>

                    <motion.div custom={1} variants={contentVariants} mb="lg" style={{ maxWidth: 250, margin: '0 auto' }}>
                        <Image
                            src="/20230208_AH_Profile_Poser.jpg"
                            alt="Angus Hally"
                            fallbackSrc={assets.placeholderImage.square}
                            radius="xl"
                            style={{ display: 'block', width: '100%', height: 'auto' }}
                        />
                    </motion.div>
                    <br />

                    <motion.div custom={2} variants={contentVariants}>
                        <Text mb="md">
                            I&apos;m a strategy consultant and amateur developer with a passion for the intersection of
                            <Text span fw={700}> business strategy,</Text> software, and data.
                        </Text>
                    </motion.div>

                    <motion.div custom={3} variants={contentVariants}>
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
                    </motion.div>

                    <motion.div custom={4} variants={contentVariants}>
                        <Text mb="md">
                            Before all that, I was a <Text span fw={700}>mathematics teacher</Text> through the
                            <Anchor href="https://www.teachfirst.org.uk/" target="_blank" rel="noopener noreferrer"> TeachFirst program</Anchor>—to this day, the hardest thing I&apos;ve done.
                        </Text>
                    </motion.div>

                    <motion.div custom={5} variants={contentVariants}>
                        <Text mb="md">
                            Currently, I work as a <Text span fw={700}>Data Strategy Manager at
                            <Anchor href="https://www.anmut.co.uk/" target="_blank" rel="noopener noreferrer"> Anmut</Anchor></Text>,
                            a data management consultancy shaking up the industry with its
                            <Anchor href="https://www.anmut.co.uk/solutions/data-valuation/" target="_blank" rel="noopener noreferrer"> data valuation service</Anchor> and
                            cutting-edge data maturity tools, like <Anchor href="https://www.anmut.co.uk/solutions/data-maturity/" target="_blank" rel="noopener noreferrer">Grace</Anchor>.
                        </Text>
                    </motion.div>

                    <motion.div custom={6} variants={contentVariants}>
                        <Text mb="md">
                            This website is my<Text span fw={700}> sandbox</Text>—a space to explore <Text span fw={700}> personal software projects</Text> and challenge myself to put what I learn and my thoughts out into the world.
                            Honestly, I find that terrifying. But growth comes from pushing past discomfort, and I believe the best way to develop is to
                            <Text span fw={700}> create, share, and learn from others</Text>.
                        </Text>
                    </motion.div>

                    <motion.div custom={7} variants={contentVariants}>
                        <Text mb="md">
                            If you have any thoughts, feedback, or just want to chat, feel free to reach out via the
                            <Anchor component={Link} href="/next/contact">Contact Me</Anchor> page.
                        </Text>
                    </motion.div>

                    <motion.div custom={8} variants={contentVariants}>
                        <Text fw={700} mb="lg">Thanks for stopping by—I appreciate it!</Text>
                    </motion.div>

                    <motion.div custom={9} variants={contentVariants}>
                        <Group justify="center" gap="lg">
                            <ActionIcon component="a" href="https://www.linkedin.com/in/angus-hally-9ab66a87" target="_blank" rel="noopener noreferrer" variant="subtle" size="lg">
                                <IconBrandLinkedin size={24} />
                            </ActionIcon>
                            <ActionIcon component="a" href="https://github.com/anguspersonal" target="_blank" rel="noopener noreferrer" variant="subtle" size="lg">
                                <IconBrandGithub size={24} />
                            </ActionIcon>
                            <ActionIcon component="a" href="https://x.com/HallyAngus" target="_blank" rel="noopener noreferrer" variant="subtle" size="lg">
                                <IconBrandX size={24} />
                            </ActionIcon>
                            <ActionIcon component="a" href="https://www.instagram.com/hallyangus/" target="_blank" rel="noopener noreferrer" variant="subtle" size="lg">
                                <IconBrandInstagram size={24} />
                            </ActionIcon>
                        </Group>
                    </motion.div>
                </motion.div>
            </Container>
        </Box>
    );
}