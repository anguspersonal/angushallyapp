'use client';

/**
 * `/personas` — hub page linking to the five rendered persona lenses.
 *
 * Each persona is a curated render of a research doc under docs/cvs/.
 * See docs/guides/persona-page-workflow.md for the methodology.
 */

import React from 'react';
import {
    Title,
    Text,
    Paper,
    Grid,
    ThemeIcon,
    Group,
    Stack,
    useMantineTheme,
    Box,
    Anchor,
} from '@mantine/core';
import {
    IconCode,
    IconChartBar,
    IconSchool,
    IconSparkles,
    IconTerminal2,
    IconTrophy,
    IconArrowRight,
    IconDownload,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import Link from 'next/link';
import { Section } from '@/components/layout';

type Color = 'primary' | 'secondary' | 'accent' | 'success' | 'dark';

const personas = [
    {
        href: '/dev',
        label: 'Developer',
        tagline: 'Builder with a strategist’s instincts and an operator’s discipline.',
        audience: 'Hiring engineers · technical clients · CTOs',
        question: '“Can he ship?”',
        icon: <IconCode size={28} />,
        color: 'primary' as Color,
    },
    {
        href: '/ai-pm',
        label: 'AI Product Manager',
        tagline: 'Product manager who builds the eval framework, not just the spec.',
        audience: 'AI startups · model labs · founders seeking a PM-shaped technical co-founder',
        question: '“Can he spec, ship, and *evaluate* an AI product?”',
        icon: <IconSparkles size={28} />,
        color: 'secondary' as Color,
    },
    {
        href: '/strategist',
        label: 'Data Strategist',
        tagline: 'Data valuation that survives contact with engineering reality.',
        audience: 'FTSE-100 data leaders · CDOs · Anmut alumni · data consultancies',
        question: '“Does he understand my data problem?”',
        icon: <IconChartBar size={28} />,
        color: 'success' as Color,
    },
    {
        href: '/teacher',
        label: 'Maths Teacher',
        tagline: 'Two years teaching GCSE and A-Level maths in Harlow. Where I learned to operate.',
        audience: 'School leadership · TeachFirst alumni · edtech · 1:1 tutoring',
        question: '“Can he hold a Year 10 set?”',
        icon: <IconSchool size={28} />,
        color: 'accent' as Color,
    },
    {
        href: '/harness',
        label: 'Harness Engineer',
        tagline: 'Code is ephemeral. The harness is leverage.',
        audience: 'Model labs · agent-tooling startups · MCP ecosystem',
        question: '“Can he build the runtime around the LLM?”',
        icon: <IconTerminal2 size={28} />,
        color: 'dark' as Color,
    },
    {
        href: '/debate',
        label: 'Debate Coach',
        tagline: 'Competed at the World University Debating Championships. Founded a school’s first debate program.',
        audience: 'Schools wanting a coach · debate-competition judges · executives wanting structured-argument coaching',
        question: '“Can he take my students to nationals?”',
        icon: <IconTrophy size={28} />,
        color: 'primary' as Color,
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants: Variants = {
    hidden: { y: 40, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const PersonasHubPage = () => {
    const theme = useMantineTheme();

    return (
        <Section width="wide" padY="default">
            <Stack gap="xl">
                {/* ---------- Hero ---------- */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Stack gap="md" ta="center">
                        <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.15em', color: theme.colors.primary[6] }}>
                            Personas
                        </Text>
                        <Title
                            order={1}
                            style={{
                                background: `linear-gradient(45deg, ${theme.colors.primary[6]}, ${theme.colors.secondary[6]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: 'clamp(2rem, 7vw, 3.5rem)',
                                fontWeight: 800,
                                lineHeight: 1.1,
                            }}
                        >
                            Five lenses on the same career.
                        </Title>
                        <Text size="lg" maw={680} mx="auto" c="dimmed">
                            A decade of work doesn&rsquo;t fit on one CV. Each page below frames the same career through one audience&rsquo;s question. The work is unchanged; the emphasis is curated.
                        </Text>
                    </Stack>
                </motion.div>

                {/* ---------- Persona cards ---------- */}
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    <Grid gutter="lg">
                        {personas.map((p) => (
                            <Grid.Col key={p.href} span={{ base: 12, md: 6 }}>
                                <motion.div variants={itemVariants} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                    <Link href={p.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <Paper
                                            p="xl"
                                            radius="md"
                                            style={{
                                                background: `linear-gradient(135deg, ${theme.colors[p.color][9]}, ${theme.colors[p.color][7]})`,
                                                color: theme.white,
                                                height: '100%',
                                                cursor: 'pointer',
                                                transition: 'box-shadow 0.2s ease',
                                            }}
                                        >
                                            <Group gap="md" mb="md" justify="space-between" align="flex-start" wrap="nowrap">
                                                <Group gap="sm" align="center">
                                                    <ThemeIcon size={52} radius="md" color={p.color} variant="filled">{p.icon}</ThemeIcon>
                                                    <Stack gap={0}>
                                                        <Text fz="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.1em', color: theme.colors.gray[3] }}>{p.label}</Text>
                                                        <Text fz="lg" fw={700} style={{ color: theme.white, fontStyle: 'italic' }}>{p.question}</Text>
                                                    </Stack>
                                                </Group>
                                                <IconArrowRight size={22} style={{ color: theme.colors.gray[3], flexShrink: 0 }} />
                                            </Group>
                                            <Text fz="md" mb="sm" style={{ color: theme.white, lineHeight: 1.4 }}>{p.tagline}</Text>
                                            <Text fz="xs" style={{ color: theme.colors.gray[3] }}>{p.audience}</Text>
                                        </Paper>
                                    </Link>
                                </motion.div>
                            </Grid.Col>
                        ))}
                    </Grid>
                </motion.div>

                {/* ---------- Operator (existing surfaces) + downloadable ---------- */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
                    <Paper p="lg" radius="md" withBorder>
                        <Group justify="space-between" align="center" wrap="wrap">
                            <Stack gap={4} style={{ flex: 1, minWidth: 280 }}>
                                <Text fz="xs" tt="uppercase" fw={700} style={{ letterSpacing: '0.1em', color: theme.colors.gray[6] }}>Operator / COO</Text>
                                <Text fw={600}>The broader career arc — investor / board / founder framing — lives at the existing surfaces.</Text>
                                <Group gap="sm" mt="xs">
                                    <Anchor component={Link} href="/" size="sm">Home</Anchor>
                                    <Text c="dimmed">·</Text>
                                    <Anchor component={Link} href="/about" size="sm">About</Anchor>
                                    <Text c="dimmed">·</Text>
                                    <Anchor component={Link} href="/projects" size="sm">Projects</Anchor>
                                </Group>
                            </Stack>
                            <Anchor href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                                <Group gap={6}>
                                    <IconDownload size={16} />
                                    <Text fz="sm" fw={600}>Operator resume (PDF)</Text>
                                </Group>
                            </Anchor>
                        </Group>
                    </Paper>
                </motion.div>

                {/* ---------- Methodology footnote ---------- */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.0 }}>
                    <Text fz="xs" ta="center" c="dimmed" maw={680} mx="auto">
                        Each persona page is curated from a research markdown that intentionally over-collects. Method is documented in <code>docs/guides/persona-page-workflow.md</code> in the repo.
                    </Text>
                </motion.div>
            </Stack>
        </Section>
    );
};

export default PersonasHubPage;
