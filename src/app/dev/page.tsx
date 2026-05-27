'use client';

/**
 * `/dev` — Developer persona page.
 *
 * Curated render of docs/cvs/dev-cv.md. The research markdown is the
 * substrate; this page is the engaging visual presentation. See
 * docs/guides/persona-page-workflow.md for the workflow.
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
    Anchor,
} from '@mantine/core';
import {
    IconCode,
    IconGitCommit,
    IconBrandGithub,
    IconCalendar,
    IconBrandTypescript,
    IconExternalLink,
    IconDeviceMobile,
    IconCpu,
    IconDatabase,
    IconSparkles,
    IconBuildingBank,
    IconNetwork,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Section } from '@/components/layout';
import statsData from '@/data/code-stats.json';

// ---------- formatting helpers ----------
const formatCompact = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
    return `${n}`;
};
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatISODate = (iso: string): string => {
    const d = new Date(iso);
    return `${d.getUTCDate()} ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

// ---------- content ----------
type ProjectColor = 'primary' | 'secondary' | 'accent' | 'success' | 'dark';

interface Project {
    title: string;
    tagline: string;
    description: string;
    stack: string[];
    proves: string[];
    color: ProjectColor;
    href?: string;
    icon: React.ReactNode;
}

const projects: Project[] = [
    {
        title: 'HeyLina',
        tagline: 'Customer-facing AI product · mobile + backend + internal ops console',
        description:
            'Three-surface monorepo: Expo / React Native customer app, Firebase Cloud Functions v2 backend, and an internal React + Vite ops console. RAG-augmented chat with user-scoped Pinecone indexes, GPT-4o + GPT-4o-audio-preview, ElevenLabs TTS, prompt config served live from Firestore.',
        stack: ['Expo', 'React Native', 'Firebase Functions v2', 'Pinecone', 'OpenAI', 'ElevenLabs'],
        proves: [
            'Production mobile + backend monorepo',
            'RAG with user-scoped vector indexes',
            'Firestore RBAC with field-level write rules & soft-delete window',
        ],
        color: 'success',
        icon: <IconDeviceMobile size={28} />,
    },
    {
        title: 'Lina Lab',
        tagline: 'Prompt-evaluation engine for HeyLina · Python / FastAPI',
        description:
            'The evaluation backbone behind HeyLina. Versioned prompt catalog, variant-comparison runtime, multi-scope eval framework (message / turn / conversation / variant). Data model leads with eight MECE kickoff types in scenario_types.py against scenarios stored in Supabase.',
        stack: ['FastAPI', 'Pydantic', 'Supabase', 'Railway', 'OpenAI', 'Tiktoken'],
        proves: [
            'LLM-as-judge with full provenance (judge_type, judge_model, judge_prompt_version, judge_rater_id)',
            'Variant experiments × model × temperature × role-preset × message-style',
            'Prompt soft-delete + version pinning so historical runs resolve',
        ],
        color: 'secondary',
        icon: <IconSparkles size={28} />,
        href: 'https://lina-lab-production.up.railway.app',
    },
    {
        title: 'AHKMS',
        tagline: 'Multi-platform AI knowledge-management system · Oct 2025–',
        description:
            'Turborepo monorepo: packages/web (Next.js 14 on Vercel), packages/worker (Express on Railway in Docker with poppler-utils), packages/mobile (Expo / React Native), packages/shared (typed contracts). Supabase for Postgres, Auth, Storage, Edge Functions.',
        stack: ['Next.js 14', 'Express', 'React Native', 'Supabase', 'Docker', 'Vercel', 'Railway'],
        proves: [
            'PARAMPS taxonomy across 7 migrations and 11 lifecycle states',
            'Capture → workflow → AI extraction → human-in-the-loop review pipeline',
            'Multi-platform architecture with shared typed contracts',
        ],
        color: 'primary',
        icon: <IconNetwork size={28} />,
        href: 'https://kms.angushally.com',
    },
    {
        title: 'angushallyapp',
        tagline: 'This site — full-stack personal platform',
        description:
            'Next.js 15 / React 19 monorepo with Node / Express backend and PostgreSQL (Knex migrations). Mantine 8 UI, Supabase SSR, Framer Motion. Hosted across Heroku and Vercel.',
        stack: ['Next.js 15', 'React 19', 'Node/Express', 'PostgreSQL', 'Knex', 'Mantine 8'],
        proves: [
            'Habit tracker, Strava sync, FSA hygiene lookup, blog, contact form',
            'Google OAuth 2.0 + JWT auth with RBAC',
            'Puppeteer-driven resume PDF builder + @anthropic-ai/sdk-backed chat',
        ],
        color: 'accent',
        icon: <IconCode size={28} />,
        href: 'https://angushally.com',
    },
    {
        title: 'Nexus',
        tagline: 'Chat-first unified personal workspace',
        description:
            'React / TypeScript / Vite SPA with Firebase (Firestore + Auth + Hosting). Tests the hypothesis that one chat input over a structured personal knowledge graph is enough surface area for life + work.',
        stack: ['React', 'Vite', 'TypeScript', 'Firebase', 'Tailwind', 'shadcn-ui'],
        proves: [
            'Chat-first interaction model',
            'Firestore data modelling for personal knowledge graphs',
        ],
        color: 'dark',
        icon: <IconCpu size={28} />,
    },
    {
        title: 'LLM Council',
        tagline: 'Weekend hack · multi-model evaluation via OpenRouter',
        description:
            'Three-stage local tool: query fans out to GPT-5.1, Gemini 3 Pro, Claude Sonnet 4.5, Grok 4; models anonymously cross-rank each other; a Chairman model synthesises the final answer. Honest framing: 99% vibe-coded.',
        stack: ['Python', 'uv', 'React', 'Vite', 'OpenRouter'],
        proves: [
            'Multi-model orchestration pattern',
            'Anonymised cross-rank → chairman synthesis flow',
        ],
        color: 'primary',
        icon: <IconBuildingBank size={28} />,
    },
];

interface SkillGroup {
    title: string;
    icon: React.ReactNode;
    color: ProjectColor;
    items: string[];
}

const skillGroups: SkillGroup[] = [
    {
        title: 'Languages & runtimes',
        icon: <IconBrandTypescript size={24} />,
        color: 'primary',
        items: ['TypeScript (strict)', 'JavaScript', 'Python', 'SQL'],
    },
    {
        title: 'Frontend',
        icon: <IconCode size={24} />,
        color: 'accent',
        items: ['React 19', 'Next.js 15 (App Router)', 'React Native (Expo)', 'Vite', 'Tailwind', 'Mantine', 'shadcn / Radix UI', 'Framer Motion'],
    },
    {
        title: 'Backend',
        icon: <IconCpu size={24} />,
        color: 'secondary',
        items: ['Node.js', 'Express', 'Firebase Cloud Functions v2', 'FastAPI + Pydantic', 'Supabase Edge Functions (Deno)'],
    },
    {
        title: 'Data & ML',
        icon: <IconDatabase size={24} />,
        color: 'success',
        items: ['PostgreSQL + Knex', 'Supabase', 'Firestore', 'Pinecone (vector)', 'OpenAI', '@anthropic-ai/sdk', 'LlamaIndex', 'ElevenLabs', 'OpenRouter'],
    },
];

// ---------- motion config ----------
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const DevPersonaPage = () => {
    const theme = useMantineTheme();
    const gradient = `linear-gradient(135deg, ${theme.colors.dark[7]}, ${theme.colors.dark[8]})`;

    return (
        <Section width="wide" padY="default">
            <Stack gap="xl">
                {/* ---------- Hero ---------- */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    <Stack gap="xs" ta="center">
                        <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.15em', color: theme.colors.primary[6] }}>
                            Developer
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
                            Builder with a strategist&rsquo;s instincts and an operator&rsquo;s discipline.
                        </Title>
                        <Text size="lg" maw={720} mx="auto" mt="md" c="gray">
                            Co-founder and COO who ships code. Over the last two years I&rsquo;ve built the Python evaluation engine that runs HeyLina&rsquo;s prompt iteration, a multi-platform AI knowledge-management system, a full-stack personal site, and the internal tooling and engineering process behind HeyLina&rsquo;s mobile product.
                        </Text>
                    </Stack>
                </motion.div>

                {/* ---------- By the numbers ---------- */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb={4} ta="center" style={{ color: theme.white }}>By the numbers</Title>
                        <Text ta="center" mb="xl" style={{ color: theme.colors.gray[4] }}>
                            Across {statsData.headline.reposContributedTo} GitHub repos · {statsData.activity.firstDay.slice(0, 4)}–{statsData.activity.lastDay.slice(0, 4)}
                        </Text>
                        <Grid gutter="xl">
                            {[
                                { icon: <IconCode size={28} />, value: formatCompact(statsData.headline.totalLinesAdded), label: 'lines added', color: 'primary' as const },
                                { icon: <IconGitCommit size={28} />, value: statsData.headline.totalCommits.toLocaleString('en-GB'), label: 'commits', color: 'secondary' as const },
                                { icon: <IconBrandGithub size={28} />, value: `${statsData.headline.reposContributedTo}`, label: 'repos contributed to', color: 'accent' as const },
                                { icon: <IconCalendar size={28} />, value: `${statsData.activity.totalActiveDays}`, label: 'active days', color: 'success' as const },
                            ].map((stat) => (
                                <Grid.Col key={stat.label} span={{ base: 6, md: 3 }}>
                                    <Stack align="center" gap="xs">
                                        <ThemeIcon size={52} radius="md" color={stat.color}>{stat.icon}</ThemeIcon>
                                        <Text fz="2.25rem" fw={800} style={{ color: theme.white, lineHeight: 1 }}>{stat.value}</Text>
                                        <Text fz="sm" ta="center" style={{ color: theme.colors.gray[4] }}>{stat.label}</Text>
                                    </Stack>
                                </Grid.Col>
                            ))}
                        </Grid>
                        <Box mt="xl" pt="md" style={{ borderTop: `1px solid ${theme.colors.dark[5]}` }}>
                            <Text fz="xs" tt="uppercase" ta="center" mb="sm" style={{ color: theme.colors.gray[5], letterSpacing: '0.1em' }}>
                                Top languages
                            </Text>
                            <Group gap="lg" justify="center">
                                {statsData.languagesRanked.slice(0, 5).map((lang) => (
                                    <Group gap={6} key={lang.name}>
                                        <Text fw={600} style={{ color: theme.white }}>{lang.name}</Text>
                                        <Text fz="sm" style={{ color: theme.colors.gray[4] }}>{Math.round(lang.pct * 100)}%</Text>
                                    </Group>
                                ))}
                            </Group>
                        </Box>
                        <Text ta="center" mt="md" fz="xs" style={{ color: theme.colors.gray[6] }}>
                            Computed locally via <code>git log --numstat</code>. Updated {formatISODate(statsData.generatedAt)}.
                        </Text>
                    </Paper>
                </motion.div>

                {/* ---------- Selected projects ---------- */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb="xl" ta="center" style={{ color: theme.white }}>Selected projects</Title>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="lg">
                                {projects.map((p) => (
                                    <Grid.Col key={p.title} span={{ base: 12, md: 6 }}>
                                        <motion.div variants={itemVariants} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                            <Paper p="lg" radius="md" style={{ background: `linear-gradient(135deg, ${theme.colors[p.color][9]}, ${theme.colors[p.color][7]})`, color: theme.white, height: '100%' }}>
                                                <Group justify="space-between" mb="sm" align="flex-start">
                                                    <Group gap="sm">
                                                        <ThemeIcon size={42} radius="md" color={p.color} variant="filled">{p.icon}</ThemeIcon>
                                                        <Stack gap={0}>
                                                            <Title order={3} size="h4" style={{ color: theme.white }}>{p.title}</Title>
                                                            <Text fz="xs" style={{ color: theme.colors.gray[3] }}>{p.tagline}</Text>
                                                        </Stack>
                                                    </Group>
                                                    {p.href && (
                                                        <Anchor href={p.href} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.gray[3] }}>
                                                            <IconExternalLink size={18} />
                                                        </Anchor>
                                                    )}
                                                </Group>
                                                <Text fz="sm" mb="md" style={{ color: theme.colors.gray[2] }}>{p.description}</Text>
                                                <Group gap={6} mb="md">
                                                    {p.stack.map((s) => (
                                                        <Badge key={s} size="xs" variant="light" color={p.color}>{s}</Badge>
                                                    ))}
                                                </Group>
                                                <Stack gap={4}>
                                                    {p.proves.map((line, i) => (
                                                        <Text key={i} fz="xs" style={{ color: theme.colors.gray[2] }}>• {line}</Text>
                                                    ))}
                                                </Stack>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </Paper>
                </motion.div>

                {/* ---------- Technical skills ---------- */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb="xl" ta="center" style={{ color: theme.white }}>Technical skills</Title>
                        <Grid gutter="lg">
                            {skillGroups.map((g) => (
                                <Grid.Col key={g.title} span={{ base: 12, sm: 6, md: 3 }}>
                                    <Paper p="md" radius="md" withBorder style={{ background: 'transparent', borderColor: theme.colors.dark[4], height: '100%' }}>
                                        <Group gap="sm" mb="sm">
                                            <ThemeIcon size={36} radius="md" color={g.color}>{g.icon}</ThemeIcon>
                                            <Text fw={700} style={{ color: theme.white }}>{g.title}</Text>
                                        </Group>
                                        <Stack gap={4}>
                                            {g.items.map((item) => (
                                                <Text key={item} fz="sm" style={{ color: theme.colors.gray[3] }}>• {item}</Text>
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Grid.Col>
                            ))}
                        </Grid>
                    </Paper>
                </motion.div>

                {/* ---------- Engineering practices ---------- */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Title order={3} mb="sm">Engineering practices</Title>
                        <Text size="sm" c="gray">
                            TypeScript-strict everywhere · conventional commits · Husky + lint-staged + Prettier (with Tailwind plugin) gating pushes · monorepo workspaces (pnpm, Turborepo) when more than one runtime surface earns it · ADR-style decision notes when a design choice is load-bearing · two-tier branching (feature → dev → main) on HeyLina, single-trunk on smaller repos · AI-augmented authoring (Claude Code, Cursor) treated as a tool, not a substitute for understanding.
                        </Text>
                    </Paper>
                </motion.div>
            </Stack>
        </Section>
    );
};

export default DevPersonaPage;
