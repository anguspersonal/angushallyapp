'use client';

/**
 * `/harness` — Harness Engineer persona page.
 *
 * Curated render of docs/cvs/harness-engineer-cv.md. The "harness
 * engineer" framing: builds the scaffolding around an LLM (skills,
 * agents, eval, ops) rather than the model itself.
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
    Accordion,
    Code,
} from '@mantine/core';
import {
    IconTerminal2,
    IconSparkles,
    IconRobot,
    IconCalendarStats,
    IconClipboardCheck,
    IconSettings,
    IconNetwork,
    IconFileText,
    IconHammer,
    IconMessageDots,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Section } from '@/components/layout';

type Color = 'primary' | 'secondary' | 'accent' | 'success' | 'dark';

const skillBuckets = [
    {
        title: 'Daily OS & capture',
        sub: 'Rituals + second-brain + conversation ergonomics',
        icon: <IconCalendarStats size={26} />,
        color: 'success' as Color,
        skills: ['/dos-eod', '/dos-reflect', '/dos-inbox', '/dos-braindump', '/heylina-notion', '/heylina-pptx', '/capture', '/quick-capture', '/prep', '/whatsapp-blast', '/personal-style', '/handoff', '/route', '/explain', '/boss-mode'],
    },
    {
        title: 'Spec-driven development',
        sub: '/spec-* pipeline from req → design → tasks → impl → verify',
        icon: <IconFileText size={26} />,
        color: 'primary' as Color,
        skills: ['/spec-debate', '/spec-req', '/spec-design', '/spec-tasks', '/spec-impl', '/spec-verify', '/to-prd', '/to-issues'],
    },
    {
        title: 'PR review, QA & repo hygiene',
        sub: 'Code review, branch ops, repo cleanliness',
        icon: <IconClipboardCheck size={26} />,
        color: 'secondary' as Color,
        skills: ['/qa-review', '/address-review', '/review-and-comment', '/create-clean-tree', '/wrap', '/merge-prune', '/sync-dotclaude', '/git-guardrails-claude-code', '/setup-pre-commit', '/repo-organizer', '/archiver', '/cloud-env', '/setup-matt-pocock-skills'],
    },
    {
        title: 'Engineering discipline',
        sub: 'SOLID, TDD, architecture, shipping',
        icon: <IconHammer size={26} />,
        color: 'accent' as Color,
        skills: ['/solid', '/architect-senior-engineer', '/improve-codebase-architecture', '/tdd', '/prototype', '/pragmatist'],
    },
    {
        title: 'Dialogue, diagnostics & content',
        sub: 'Grill, fix, explain, edit',
        icon: <IconMessageDots size={26} />,
        color: 'dark' as Color,
        skills: ['/diagnose', '/fix', '/fix-failing-tests', '/triage', '/grill-me', '/grill-with-docs', '/low-brain-grill', '/discuss', '/deep-thinking', '/zoom-out', '/voice-of-user', '/edit-article', '/caveman'],
    },
];

const agents = [
    { name: 'architect-senior-engineer', body: 'Design / refactor with senior-engineer discipline.', color: 'primary' as Color },
    { name: 'pragmatist', body: 'Ship-focused scope cutter when scope creeps.', color: 'accent' as Color },
    { name: 'synthesiser', body: 'Weighs arguments from multiple agents and recommends a call.', color: 'secondary' as Color },
    { name: 'voice-of-user', body: 'Represents end-user needs against technical preferences.', color: 'success' as Color },
    { name: 'ui-ux', body: 'Interface review and pixel-perfect refinement.', color: 'primary' as Color },
    { name: 'repo-organizer / archiver', body: 'Repo cleanliness specialists; feature-folder archiving.', color: 'dark' as Color },
];

const exemplars = [
    {
        title: 'Lina Lab',
        sub: 'Production eval harness · Python / FastAPI on Railway',
        body: 'Versioned prompt catalog · LLM-as-judge with provenance (judge_type, judge_model, judge_prompt_version, judge_rater_id) · variant experiments · multi-scope rubrics · prompt soft-delete + version pinning · Slack-notified promotion pipeline · clinical-safety risk classification.',
        color: 'secondary' as Color,
        icon: <IconSparkles size={28} />,
    },
    {
        title: 'AHKMS',
        sub: 'Agentic-pipeline orchestration · webhook-driven',
        body: 'Capture → workflow webhook fires Express worker → AI extraction → PARAMPS classification → human-in-the-loop review → derived artifacts with lineage tracking. Not "agents" in the SDK sense — but agentic orchestration in the operational sense.',
        color: 'primary' as Color,
        icon: <IconNetwork size={28} />,
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

const HarnessPersonaPage = () => {
    const theme = useMantineTheme();
    const gradient = `linear-gradient(135deg, ${theme.colors.dark[7]}, ${theme.colors.dark[8]})`;
    const mono = 'ui-monospace, "JetBrains Mono", "Cascadia Mono", Menlo, Consolas, monospace';

    return (
        <Section width="wide" padY="default">
            <Stack gap="xl">
                {/* ---------- Hero ---------- */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Stack gap="xs" ta="center">
                        <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.15em', color: theme.colors.dark[3], fontFamily: mono }}>
                            ~/.claude/ — harness engineer
                        </Text>
                        <Title
                            order={1}
                            style={{
                                background: `linear-gradient(45deg, ${theme.colors.dark[5]}, ${theme.colors.primary[6]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: 'clamp(2rem, 7vw, 3.5rem)',
                                fontWeight: 800,
                                lineHeight: 1.1,
                            }}
                        >
                            Code is ephemeral. The harness is leverage.
                        </Title>
                        <Text size="lg" maw={720} mx="auto" mt="md" c="gray.6">
                            I build the scaffolding <em>around</em> the LLM — slash-commands, agents, eval harnesses, MCP server choices, hook configuration — rather than the model itself. The footprint shows up in three places: custom Claude Code skills + agents I&rsquo;ve authored, Lina Lab (a production prompt-evaluation engine), and AHKMS (a webhook-driven AI orchestration pipeline).
                        </Text>
                    </Stack>
                </motion.div>

                {/* ---------- Custom skills overview ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb={4} ta="center" style={{ color: theme.white }}>Custom skills authored</Title>
                        <Text ta="center" mb="xl" maw={680} mx="auto" style={{ color: theme.colors.gray[4] }}>
                            36 user-level skills in <Code style={{ background: theme.colors.dark[5], color: theme.colors.gray[2] }}>~/.claude/skills/</Code> plus plugin-namespaced HeyLina rituals. Each slash-command compresses a recurring workflow. Grouped by job.
                        </Text>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="lg">
                                {skillBuckets.map((bucket) => (
                                    <Grid.Col key={bucket.title} span={{ base: 12, sm: 6, md: 4 }}>
                                        <motion.div variants={itemVariants}>
                                            <Paper p="lg" radius="md" style={{ background: `linear-gradient(135deg, ${theme.colors[bucket.color][9]}, ${theme.colors[bucket.color][7]})`, color: theme.white, height: '100%' }}>
                                                <ThemeIcon size={44} radius="md" color={bucket.color} variant="filled" mb="sm">{bucket.icon}</ThemeIcon>
                                                <Title order={4} style={{ color: theme.white }} mb={4}>{bucket.title}</Title>
                                                <Text fz="xs" mb="sm" style={{ color: theme.colors.gray[3] }}>{bucket.sub}</Text>
                                                <Stack gap={2}>
                                                    {bucket.skills.slice(0, 6).map((s) => (
                                                        <Text key={s} fz="xs" style={{ color: theme.colors.gray[2], fontFamily: mono }}>{s}</Text>
                                                    ))}
                                                    {bucket.skills.length > 6 && (
                                                        <Text fz="xs" fs="italic" style={{ color: theme.colors.gray[4] }}>
                                                            + {bucket.skills.length - 6} more
                                                        </Text>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>

                        {/* Drop-down: full skills list */}
                        <Box mt="xl">
                            <Accordion variant="separated" radius="md" styles={{ item: { background: theme.colors.dark[6], border: `1px solid ${theme.colors.dark[4]}` }, label: { color: theme.white }, chevron: { color: theme.white } }}>
                                <Accordion.Item value="all-skills">
                                    <Accordion.Control icon={<IconTerminal2 size={18} style={{ color: theme.colors.gray[3] }} />}>
                                        <Text fz="sm" fw={600} style={{ color: theme.white }}>Full skill list — every authored slash-command</Text>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Stack gap="sm">
                                            {skillBuckets.map((bucket) => (
                                                <Box key={bucket.title}>
                                                    <Text fz="xs" tt="uppercase" fw={700} style={{ color: theme.colors[bucket.color][4], letterSpacing: '0.08em' }} mb={4}>{bucket.title}</Text>
                                                    <Group gap={6}>
                                                        {bucket.skills.map((s) => (
                                                            <Code key={s} style={{ background: theme.colors.dark[5], color: theme.colors.gray[2], fontFamily: mono }}>{s}</Code>
                                                        ))}
                                                    </Group>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        </Box>
                    </Paper>
                </motion.div>

                {/* ---------- Custom agents ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb="xs" ta="center" style={{ color: theme.white }}>Custom agents</Title>
                        <Text ta="center" mb="xl" maw={680} mx="auto" style={{ color: theme.colors.gray[4] }}>
                            Multi-agent patterns for harder calls. <Code style={{ background: theme.colors.dark[5], color: theme.colors.gray[2] }}>/spec-debate</Code> orchestrates five (drafter → reviewer → defender → judge → implementer) and scores against a rubric.
                        </Text>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="md">
                                {agents.map((a) => (
                                    <Grid.Col key={a.name} span={{ base: 12, sm: 6, md: 4 }}>
                                        <motion.div variants={itemVariants}>
                                            <Paper p="md" radius="md" withBorder style={{ background: 'transparent', borderColor: theme.colors.dark[4], height: '100%' }}>
                                                <Group gap={6} mb="xs">
                                                    <ThemeIcon size={28} radius="md" color={a.color} variant="light"><IconRobot size={16} /></ThemeIcon>
                                                    <Text fw={700} style={{ color: theme.white, fontFamily: mono }} fz="sm">{a.name}</Text>
                                                </Group>
                                                <Text fz="sm" style={{ color: theme.colors.gray[3] }}>{a.body}</Text>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </Paper>
                </motion.div>

                {/* ---------- Production exemplars ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb="xl" ta="center" style={{ color: theme.white }}>Production harness in the wild</Title>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="lg">
                                {exemplars.map((e) => (
                                    <Grid.Col key={e.title} span={{ base: 12, md: 6 }}>
                                        <motion.div variants={itemVariants} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                            <Paper p="lg" radius="md" style={{ background: `linear-gradient(135deg, ${theme.colors[e.color][9]}, ${theme.colors[e.color][7]})`, color: theme.white, height: '100%' }}>
                                                <Group gap="sm" mb="sm" align="flex-start">
                                                    <ThemeIcon size={48} radius="md" color={e.color} variant="filled">{e.icon}</ThemeIcon>
                                                    <Stack gap={0}>
                                                        <Title order={3} size="h4" style={{ color: theme.white }}>{e.title}</Title>
                                                        <Text fz="xs" style={{ color: theme.colors.gray[3] }}>{e.sub}</Text>
                                                    </Stack>
                                                </Group>
                                                <Text fz="sm" style={{ color: theme.colors.gray[2] }}>{e.body}</Text>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </Paper>
                </motion.div>

                {/* ---------- Harness ops ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Group gap="md" mb="md">
                            <ThemeIcon size={42} radius="md" color="primary" variant="light"><IconSettings size={24} /></ThemeIcon>
                            <Title order={3}>Harness configuration & ops</Title>
                        </Group>
                        <Stack gap="sm">
                            <Text size="sm" c="gray.6">
                                <strong>dotclaude repo</strong> — versioned <Code>~/.claude/</Code> config: skills, agents, settings, hooks. Treated as a portfolio artefact, not a scratchpad.
                            </Text>
                            <Text size="sm" c="gray.6">
                                <strong>Pre-push gates</strong> — <Code>.husky/pre-push</Code> runs typecheck + lint + test before push. Claude-Code hooks block destructive git commands (push, reset --hard, branch -D).
                            </Text>
                            <Text size="sm" c="gray.6">
                                <strong>MCP server choices</strong> — Notion (multiple workspaces), Slack, Gmail (forked from <Code>gongrzhe</Code>), Supabase, Vercel, computer-use (native Windows control), Claude-in-Chrome (browser DOM), PostHog, Composio (auth broker), Dex (CRM). Each MCP has a job.
                            </Text>
                            <Text size="sm" c="gray.6">
                                <strong>AI co-author footprint at scale</strong> — <Code>Co-Authored-By: Claude Opus 4.7</Code> on most recent commits. 2,391 commits, 1.12M lines added across 44 repos.
                            </Text>
                        </Stack>
                    </Paper>
                </motion.div>
            </Stack>
        </Section>
    );
};

export default HarnessPersonaPage;
