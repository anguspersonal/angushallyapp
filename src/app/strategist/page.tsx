'use client';

/**
 * `/strategist` — Data Strategy persona page.
 *
 * Curated render of docs/cvs/data-strategy-cv.md. Source-material
 * gap: several engagements are anonymised pending Angus's confirmation
 * on what's publicly nameable.
 * See docs/guides/persona-page-workflow.md.
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
    Badge,
} from '@mantine/core';
import {
    IconChartBar,
    IconRuler,
    IconCoin,
    IconCar,
    IconShield,
    IconBuilding,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import NextImage from 'next/image';
import { Section } from '@/components/layout';

type Color = 'primary' | 'secondary' | 'accent' | 'success' | 'dark';

const engagements = [
    {
        title: 'FTSE-100 data valuation',
        meta: 'Anmut · 2022–2025',
        body: 'Led engagements helping enterprise clients quantify the financial value of their data estate. Forces a chain from data → decision → revenue/cost impact rather than treating data as a balance-sheet abstraction. Outputs ranged from board-level valuations to asset-level prioritisation feeding platform investment.',
        tags: ['Data valuation', 'C-suite', 'P&L impact'],
        color: 'primary' as Color,
        icon: <IconCoin size={24} />,
    },
    {
        title: 'JLR — client-side data strategy',
        meta: 'Anmut · ~2024',
        body: 'Client-side at Jaguar Land Rover. Reported into senior data leaders on strategy and prioritisation. Attended JLR Data Fest 2024 as part of the engagement.',
        tags: ['Automotive', 'Client-side', 'Strategy'],
        color: 'secondary' as Color,
        icon: <IconCar size={24} />,
    },
    {
        title: 'Grace — data-maturity tool',
        meta: 'Anmut · 2022–2025',
        body: "Contributor on Grace, Anmut's data-maturity diagnostic. Scores an organisation across capability dimensions, produces a maturity baseline + improvement roadmap. Used in initial engagements to scope where the value-creation opportunity actually sits.",
        tags: ['Data maturity', 'Diagnostic', 'Roadmap'],
        color: 'accent' as Color,
        icon: <IconRuler size={24} />,
    },
    {
        title: 'FTSE-100 sector data-value research',
        meta: 'Anmut · 2023–2024',
        body: "Contribution to Anmut's published thinking on data value across sectors. Mapped how data contributes to enterprise value differently in financial services vs. consumer goods vs. industrials vs. healthcare.",
        tags: ['Research', 'Cross-sector', 'Published'],
        color: 'success' as Color,
        icon: <IconChartBar size={24} />,
    },
    {
        title: 'Pricing & GDPR — telecoms + insurance',
        meta: 'Accenture Strategy · 2019–2020',
        body: 'Pricing strategy and GDPR engagements at large telecoms and insurance clients. The analyst-to-strategy transition. Cross-functional work with data, legal, and commercial leaders.',
        tags: ['Pricing', 'GDPR', 'Telecoms', 'Insurance'],
        color: 'dark' as Color,
        icon: <IconShield size={24} />,
    },
    {
        title: 'Digital transformation — UK public sector',
        meta: 'Accenture · 2018–2019',
        body: 'Digital-transformation programmes across the Royal Navy, the Police, and the Courts & Tribunals Judiciary. Where I cut my teeth understanding how strategy actually contacts operations in legacy estates.',
        tags: ['Public sector', 'Royal Navy', 'Police', 'Courts'],
        color: 'primary' as Color,
        icon: <IconBuilding size={24} />,
    },
];

const frameworks = [
    {
        title: 'Data valuation',
        sub: 'Anmut methodology',
        body: 'Data asset taxonomy → use case mapping → value chain → P&L impact. The chain that turns "we have lots of data" into "this dataset is worth £X."',
        color: 'primary' as Color,
    },
    {
        title: 'Data maturity',
        sub: 'Multi-dimensional',
        body: "Capability assessment across data dimensions (governance, architecture, analytics, culture) → baseline → roadmap → prioritised investment.",
        color: 'secondary' as Color,
    },
    {
        title: 'Pricing strategy',
        sub: 'Value-based + GDPR-aware',
        body: 'Willingness-to-pay analysis, value-based pricing, and the GDPR-constrained question of how to monetise data without inheriting risk.',
        color: 'accent' as Color,
    },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const StrategistPersonaPage = () => {
    const theme = useMantineTheme();
    const gradient = `linear-gradient(135deg, ${theme.colors.dark[7]}, ${theme.colors.dark[8]})`;

    return (
        <Section width="wide" padY="default">
            <Stack gap="xl">
                {/* ---------- Hero ---------- */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Grid gutter="xl" align="center">
                        <Grid.Col span={{ base: 12, md: 7 }}>
                            <Stack gap="xs">
                                <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.15em', color: theme.colors.secondary[6] }}>
                                    Data Strategist
                                </Text>
                                <Title
                                    order={1}
                                    style={{
                                        background: `linear-gradient(45deg, ${theme.colors.secondary[6]}, ${theme.colors.primary[6]})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: 'clamp(2rem, 6vw, 3.25rem)',
                                        fontWeight: 800,
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Data valuation that survives contact with engineering reality.
                                </Title>
                                <Text size="lg" mt="md" c="gray.6">
                                    Three years at Anmut leading data-valuation and data-maturity engagements helping enterprise clients price what their data is actually worth. Four years at Accenture before that on digital transformation across UK public sector and pricing / GDPR work in telecoms and insurance.
                                </Text>
                                <Text size="sm" mt="md" c="gray.6">
                                    Distinct from <em>strategist-who-deck-builds-and-exits</em>: every recommendation has been pressure-tested by someone (often me) shipping the system downstream of it.
                                </Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Box style={{ position: 'relative', borderRadius: theme.radius.md, overflow: 'hidden', aspectRatio: '4/3' }}>
                                <NextImage
                                    src="/20241023_Anmut_JLR_Data_Fest.jpg"
                                    alt="Angus and Anmut colleagues at JLR Data Fest"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    style={{ objectFit: 'cover' }}
                                />
                            </Box>
                        </Grid.Col>
                    </Grid>
                </motion.div>

                {/* ---------- Selected engagements ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb={4} ta="center" style={{ color: theme.white }}>Selected engagements</Title>
                        <Text ta="center" mb="xl" style={{ color: theme.colors.gray[4] }} fz="sm">
                            Several FTSE-100 clients are anonymised pending confirmation on what&rsquo;s publicly nameable. Specific clients on request.
                        </Text>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="lg">
                                {engagements.map((e) => (
                                    <Grid.Col key={e.title} span={{ base: 12, md: 6 }}>
                                        <motion.div variants={itemVariants} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                            <Paper p="lg" radius="md" style={{ background: `linear-gradient(135deg, ${theme.colors[e.color][9]}, ${theme.colors[e.color][7]})`, color: theme.white, height: '100%' }}>
                                                <Group gap="sm" mb="sm" align="flex-start">
                                                    <ThemeIcon size={42} radius="md" color={e.color} variant="filled">{e.icon}</ThemeIcon>
                                                    <Stack gap={0}>
                                                        <Title order={3} size="h4" style={{ color: theme.white }}>{e.title}</Title>
                                                        <Text fz="xs" style={{ color: theme.colors.gray[3] }}>{e.meta}</Text>
                                                    </Stack>
                                                </Group>
                                                <Text fz="sm" mb="md" style={{ color: theme.colors.gray[2] }}>{e.body}</Text>
                                                <Group gap={6}>
                                                    {e.tags.map((t) => (
                                                        <Badge key={t} size="xs" variant="light" color={e.color}>{t}</Badge>
                                                    ))}
                                                </Group>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </Paper>
                </motion.div>

                {/* ---------- Frameworks ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb="xl" ta="center" style={{ color: theme.white }}>Frameworks I work in</Title>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="lg">
                                {frameworks.map((f) => (
                                    <Grid.Col key={f.title} span={{ base: 12, md: 4 }}>
                                        <motion.div variants={itemVariants}>
                                            <Paper p="lg" radius="md" withBorder style={{ background: 'transparent', borderColor: theme.colors.dark[4], height: '100%' }}>
                                                <Text fz="xs" tt="uppercase" fw={700} style={{ color: theme.colors[f.color][4], letterSpacing: '0.1em' }} mb={4}>{f.sub}</Text>
                                                <Title order={3} size="h4" style={{ color: theme.white }} mb="sm">{f.title}</Title>
                                                <Text fz="sm" style={{ color: theme.colors.gray[3] }}>{f.body}</Text>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </Paper>
                </motion.div>

                {/* ---------- Engineering bridge ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Title order={3} mb="xs">Strategy is more durable when the strategist can also stand up the system downstream of it.</Title>
                        <Text size="sm" c="gray.6">
                            Unusually for a strategist, I can read schemas, evaluate platform decisions, and ship the prototype that proves the strategy.
                        </Text>
                    </Paper>
                </motion.div>
            </Stack>
        </Section>
    );
};

export default StrategistPersonaPage;
