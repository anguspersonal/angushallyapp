'use client';

/**
 * `/ai-pm` — AI Product Manager persona page.
 *
 * Curated render of docs/cvs/ai-product-manager-cv.md. Eval-discipline
 * section is the differentiator for this persona vs the dev one;
 * everything else is supporting. See docs/guides/persona-page-workflow.md.
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
    Badge,
} from '@mantine/core';
import {
    IconCode,
    IconGitCommit,
    IconBrandGithub,
    IconCalendar,
    IconScale,
    IconFlask,
    IconStack,
    IconRocket,
    IconNetwork,
    IconDeviceMobile,
    IconSparkles,
    IconBriefcase,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Section } from '@/components/layout';
import statsData from '@/data/code-stats.json';

const formatCompact = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
    return `${n}`;
};

type Color = 'primary' | 'secondary' | 'accent' | 'success' | 'dark';

const evalPillars = [
    {
        icon: <IconScale size={28} />,
        title: 'Provenance',
        body: 'Every eval row carries judge_type, judge_model, judge_prompt_version, judge_rater_id. Regressions are diagnosable, not vibes.',
        color: 'primary' as Color,
    },
    {
        icon: <IconFlask size={28} />,
        title: 'Variants',
        body: 'Model × temperature × role-preset × message-style toggles with baseline-delta reporting. Comparison cost ≈ config-authoring cost.',
        color: 'secondary' as Color,
    },
    {
        icon: <IconStack size={28} />,
        title: 'Multi-scope rubrics',
        body: 'Message-level, turn-level, conversation-level, variant-level. Different questions live at different scopes; conflating them is the "metric up, product feels worse" trap.',
        color: 'accent' as Color,
    },
];

const products = [
    {
        title: 'HeyLina',
        tagline: 'AI product on iOS + Android · 2025–Present',
        body: 'Co-founder and COO. Own product strategy, GTM, fundraising, pricing, clinical advisor relationships, and the engineering process — alongside our mobile engineer.',
        stack: ['Expo / React Native', 'Firebase Functions', 'Pinecone', 'OpenAI', 'ElevenLabs'],
        color: 'success' as Color,
        icon: <IconDeviceMobile size={26} />,
    },
    {
        title: 'Lina Lab',
        tagline: 'Prompt-evaluation engine · part of the HeyLina stack',
        body: 'The discipline angle. FastAPI service with versioned prompt catalog, variant-comparison runtime, multi-scope eval, LLM-as-judge with full provenance, prompt soft-delete + version pinning, promotion pipeline.',
        stack: ['FastAPI', 'Pydantic', 'Supabase', 'Railway'],
        color: 'secondary' as Color,
        icon: <IconSparkles size={26} />,
        href: 'https://lina-lab-production.up.railway.app',
    },
    {
        title: 'AHKMS',
        tagline: 'Multi-platform AI knowledge-management product · Oct 2025–',
        body: 'Personal full-stack product. Capture → workflow → AI extraction → PARAMPS classification → human-in-the-loop review → derived artifacts with lineage tracking.',
        stack: ['Next.js 14', 'Express', 'React Native', 'Supabase'],
        color: 'primary' as Color,
        icon: <IconNetwork size={26} />,
        href: 'https://kms.angushally.com',
    },
    {
        title: 'Teamvine',
        tagline: 'Head of Product · 2020–2022',
        body: 'Shipped four digital products in six months while leading agile teams. Secured £100k UKRI grant. Operator function end-to-end: product, sales, marketing, compliance, governance, content, ops, IP.',
        stack: ['Agile', 'UKRI grant', '4 products / 6 months'],
        color: 'accent' as Color,
        icon: <IconBriefcase size={26} />,
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

const AiPmPersonaPage = () => {
    const theme = useMantineTheme();
    const gradient = `linear-gradient(135deg, ${theme.colors.dark[7]}, ${theme.colors.dark[8]})`;

    return (
        <Section width="wide" padY="default">
            <Stack gap="xl">
                {/* ---------- Hero ---------- */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Stack gap="xs" ta="center">
                        <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.15em', color: theme.colors.secondary[6] }}>
                            AI Product Manager
                        </Text>
                        <Title
                            order={1}
                            style={{
                                background: `linear-gradient(45deg, ${theme.colors.secondary[6]}, ${theme.colors.accent[6]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: 'clamp(2rem, 7vw, 3.5rem)',
                                fontWeight: 800,
                                lineHeight: 1.1,
                            }}
                        >
                            Product manager who builds the eval framework, not just the spec.
                        </Title>
                        <Text size="lg" maw={720} mx="auto" mt="md" c="gray.6">
                            Most AI products are run on vibes; this one isn&rsquo;t. Co-founder and COO at HeyLina shipping a longitudinal emotional-data product across mobile, backend, and an internal ops console — with a Python evaluation engine underneath that I personally architected and ship into.
                        </Text>
                    </Stack>
                </motion.div>

                {/* ---------- Eval discipline (the headline differentiator) ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb={4} ta="center" style={{ color: theme.white }}>Eval discipline</Title>
                        <Text ta="center" mb="xl" maw={680} mx="auto" style={{ color: theme.colors.gray[4] }}>
                            The differentiator vs. a generalist PM. From Lina Lab — HeyLina&rsquo;s prompt-evaluation engine.
                        </Text>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="xl">
                                {evalPillars.map((pillar) => (
                                    <Grid.Col key={pillar.title} span={{ base: 12, md: 4 }}>
                                        <motion.div variants={itemVariants}>
                                            <Paper p="lg" radius="md" style={{ background: `linear-gradient(135deg, ${theme.colors[pillar.color][9]}, ${theme.colors[pillar.color][7]})`, color: theme.white, height: '100%' }}>
                                                <ThemeIcon size={52} radius="md" color={pillar.color} variant="filled" mb="md">{pillar.icon}</ThemeIcon>
                                                <Title order={3} size="h4" style={{ color: theme.white }} mb="xs">{pillar.title}</Title>
                                                <Text fz="sm" style={{ color: theme.colors.gray[2] }}>{pillar.body}</Text>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                        <Text ta="center" mt="xl" fz="xs" style={{ color: theme.colors.gray[6] }}>
                            Implementation: <code>scenario_types.py</code> · 8 MECE kickoff types · scenarios in Supabase · prompt soft-delete + version pinning · promotion pipeline with Slack notifications.
                        </Text>
                    </Paper>
                </motion.div>

                {/* ---------- Selected products ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb="xl" ta="center" style={{ color: theme.white }}>Selected products</Title>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="lg">
                                {products.map((p) => (
                                    <Grid.Col key={p.title} span={{ base: 12, md: 6 }}>
                                        <motion.div variants={itemVariants} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                            <Paper p="lg" radius="md" style={{ background: `linear-gradient(135deg, ${theme.colors[p.color][9]}, ${theme.colors[p.color][7]})`, color: theme.white, height: '100%' }}>
                                                <Group gap="sm" mb="sm" align="flex-start">
                                                    <ThemeIcon size={42} radius="md" color={p.color} variant="filled">{p.icon}</ThemeIcon>
                                                    <Stack gap={0}>
                                                        <Title order={3} size="h4" style={{ color: theme.white }}>{p.title}</Title>
                                                        <Text fz="xs" style={{ color: theme.colors.gray[3] }}>{p.tagline}</Text>
                                                    </Stack>
                                                </Group>
                                                <Text fz="sm" mb="md" style={{ color: theme.colors.gray[2] }}>{p.body}</Text>
                                                <Group gap={6}>
                                                    {p.stack.map((s) => (
                                                        <Badge key={s} size="xs" variant="light" color={p.color}>{s}</Badge>
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

                {/* ---------- By the numbers (engineering credibility) ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb={4} ta="center" style={{ color: theme.white }}>Engineering credibility</Title>
                        <Text ta="center" mb="xl" style={{ color: theme.colors.gray[4] }}>
                            I read PRs, write PRs, ship PRs. The dev work is the credential.
                        </Text>
                        <Grid gutter="xl">
                            {[
                                { icon: <IconCode size={28} />, value: formatCompact(statsData.headline.totalLinesAdded), label: 'lines added', color: 'primary' as Color },
                                { icon: <IconGitCommit size={28} />, value: statsData.headline.totalCommits.toLocaleString('en-GB'), label: 'commits', color: 'secondary' as Color },
                                { icon: <IconBrandGithub size={28} />, value: `${statsData.headline.reposContributedTo}`, label: 'repos', color: 'accent' as Color },
                                { icon: <IconCalendar size={28} />, value: `${statsData.activity.totalActiveDays}`, label: 'active days', color: 'success' as Color },
                            ].map((stat) => (
                                <Grid.Col key={stat.label} span={{ base: 6, md: 3 }}>
                                    <Stack align="center" gap="xs">
                                        <ThemeIcon size={48} radius="md" color={stat.color}>{stat.icon}</ThemeIcon>
                                        <Text fz="2rem" fw={800} style={{ color: theme.white, lineHeight: 1 }}>{stat.value}</Text>
                                        <Text fz="xs" ta="center" style={{ color: theme.colors.gray[4] }}>{stat.label}</Text>
                                    </Stack>
                                </Grid.Col>
                            ))}
                        </Grid>
                    </Paper>
                </motion.div>

                {/* ---------- Commercial / GTM ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Group gap="md" mb="md">
                            <ThemeIcon size={42} radius="md" color="success" variant="light"><IconRocket size={24} /></ThemeIcon>
                            <Title order={3}>Commercial & GTM</Title>
                        </Group>
                        <Text size="sm" c="gray.6">
                            Founded HeyLina with a clinical-emotional-data thesis; positioning had to thread a regulatory needle (longitudinal emotional data is adjacent to clinical without being a medical device). Pricing strategy informed by years of data-valuation work. Clinical advisor relationships run by me directly. Interim raise currently running. Stakeholder-as-translator (clinical advisors, investors, engineers) is the day job.
                        </Text>
                    </Paper>
                </motion.div>
            </Stack>
        </Section>
    );
};

export default AiPmPersonaPage;
