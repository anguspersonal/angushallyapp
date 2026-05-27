'use client';

/**
 * `/debate` — Debate Coach persona page.
 *
 * Curated render of docs/cvs/debate-coach-cv.md. Was blocked until
 * Angus surfaced source material on 2026-05-27: LSE Debate 2013–2016
 * (member + General Secretary), WUDC Malaysia 2015 (232/731), founded
 * Burnt Mill Academy debate program. See docs/guides/persona-page-workflow.md.
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
    IconTrophy,
    IconWorld,
    IconSchool,
    IconUsers,
    IconScale,
    IconClock,
    IconHeart,
    IconBolt,
    IconChecklist,
    IconStars,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Section } from '@/components/layout';

type Color = 'primary' | 'secondary' | 'accent' | 'success' | 'dark';

const headlineStats = [
    {
        icon: <IconTrophy size={28} />,
        value: '232 / 731',
        label: 'WUDC 2015 individual ranking',
        sub: 'Kuala Lumpur, Malaysia',
        color: 'success' as Color,
    },
    {
        icon: <IconWorld size={28} />,
        value: '3',
        label: 'years on LSE Debate Team',
        sub: 'Member, then General Secretary',
        color: 'primary' as Color,
    },
    {
        icon: <IconSchool size={28} />,
        value: 'Founder',
        label: 'Burnt Mill debate program',
        sub: 'Took the school to its first inter-school competitions',
        color: 'accent' as Color,
    },
    {
        icon: <IconUsers size={28} />,
        value: '100+',
        label: 'competitions attended',
        sub: 'UK + continental Europe',
        color: 'secondary' as Color,
    },
];

const lessons = [
    {
        icon: <IconScale size={24} />,
        title: 'Argue both sides at full strength before you commit',
        body: 'The single most under-priced cognitive skill in business. Debate is the only training I know that drills it; you literally don\'t find out which side you\'re on until 15 minutes before round-start.',
        color: 'primary' as Color,
    },
    {
        icon: <IconClock size={24} />,
        title: 'Hold structure under time pressure',
        body: 'Seven minutes to make the case, three minutes of points-of-information from opponents, immediate adjudication. There is nowhere for waffle to hide.',
        color: 'secondary' as Color,
    },
    {
        icon: <IconBolt size={24} />,
        title: 'Performance discipline under hostile examination',
        body: 'What survives PoIs is what survives investor Q&A, board challenges, and clinical-advisor scrutiny. Same muscle.',
        color: 'accent' as Color,
    },
    {
        icon: <IconHeart size={24} />,
        title: 'Adversarial respect',
        body: 'The team you beat in round 3 is the team you have a drink with at finals night. Disagreement is what debate is for; treating opponents as enemies is the amateur move.',
        color: 'success' as Color,
    },
];

const principles = [
    'Format first. Get the BP structure, roles, and time signature memorised before anything stylistic. The structure does the heavy lifting.',
    'PoIs are the test. Anyone can prepare a 7-minute speech; the differentiator is the 30 seconds when an opponent stands up.',
    'Roleplay the judge in feedback. Students improve fastest when they learn to predict what the adjudicator will write.',
    'Match the motion to the student early. Confidence compounds; running a 14-year-old against a Schools\' Mace final on their second week is bad coaching.',
    'Travel the team. A school\'s first inter-school competition is the inflection point — get them through the door of someone else\'s auditorium.',
];

const arcs = [
    {
        title: 'Competitor',
        sub: 'LSE Debate Team · 2013–2016',
        body: 'Three full seasons on the LSE Debate Team — member then General Secretary. Hundreds of competitions across UK and continental Europe: inter-university opens, IVs, and majors in the British Parliamentary format. Culminated in the **World University Debating Championships 2015 in Kuala Lumpur, Malaysia**, finishing 232nd out of 731 individual debaters globally on the WUDC 2015 tab. General-Secretary work included club operations, novice training, captaincy decisions, and pastoral cover for junior debaters.',
        color: 'primary' as Color,
        icon: <IconTrophy size={28} />,
    },
    {
        title: 'Coach',
        sub: 'Burnt Mill Academy · Harlow · 2016–2018',
        body: 'Founded the school\'s debate program during a two-year TeachFirst placement at Burnt Mill Academy — no prior infrastructure. Took Burnt Mill to **its first inter-school debate competitions**, the school\'s debut on the competitive schools\' circuit. Coaching context: a non-selective state secondary; students starting from scratch in both format knowledge and the confidence to argue in front of strangers.',
        color: 'accent' as Color,
        icon: <IconSchool size={28} />,
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

const DebatePersonaPage = () => {
    const theme = useMantineTheme();
    const gradient = `linear-gradient(135deg, ${theme.colors.dark[7]}, ${theme.colors.dark[8]})`;

    return (
        <Section width="wide" padY="default">
            <Stack gap="xl">
                {/* ---------- Hero ---------- */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Stack gap="xs" ta="center">
                        <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.15em', color: theme.colors.success[6] }}>
                            Debate Coach
                        </Text>
                        <Title
                            order={1}
                            style={{
                                background: `linear-gradient(45deg, ${theme.colors.success[6]}, ${theme.colors.primary[6]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: 'clamp(1.85rem, 6vw, 3rem)',
                                fontWeight: 800,
                                lineHeight: 1.1,
                            }}
                        >
                            Competed at the World University Debating Championships. Founded a school&rsquo;s first debate program.
                        </Title>
                        <Text size="lg" maw={720} mx="auto" mt="md" c="gray">
                            Two arcs of debate: three seasons on the LSE Debate Team (2013&ndash;2016) as member then General Secretary, culminating in WUDC Malaysia 2015 &mdash; then founded the Burnt Mill Academy debate program in Harlow during TeachFirst, taking the school to its first inter-school competitions.
                        </Text>
                    </Stack>
                </motion.div>

                {/* ---------- Headline stats ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="xl">
                                {headlineStats.map((s) => (
                                    <Grid.Col key={s.label} span={{ base: 12, sm: 6, md: 3 }}>
                                        <motion.div variants={itemVariants}>
                                            <Stack align="center" gap="xs" ta="center">
                                                <ThemeIcon size={52} radius="md" color={s.color}>{s.icon}</ThemeIcon>
                                                <Text fz="2rem" fw={800} style={{ color: theme.white, lineHeight: 1 }}>{s.value}</Text>
                                                <Text fz="sm" fw={600} style={{ color: theme.colors.gray[2] }}>{s.label}</Text>
                                                <Text fz="xs" style={{ color: theme.colors.gray[5] }}>{s.sub}</Text>
                                            </Stack>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                        <Text ta="center" mt="xl" fz="xs" style={{ color: theme.colors.gray[6] }}>
                            WUDC 2015 ranking: official tab roster (source on request).
                        </Text>
                    </Paper>
                </motion.div>

                {/* ---------- Two arcs ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb={4} ta="center" style={{ color: theme.white }}>Two arcs</Title>
                        <Text ta="center" mb="xl" maw={680} mx="auto" style={{ color: theme.colors.gray[4] }}>
                            First compete. Then coach the program you start from scratch.
                        </Text>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="lg">
                                {arcs.map((a) => (
                                    <Grid.Col key={a.title} span={{ base: 12, md: 6 }}>
                                        <motion.div variants={itemVariants} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                                            <Paper p="lg" radius="md" style={{ background: `linear-gradient(135deg, ${theme.colors[a.color][9]}, ${theme.colors[a.color][7]})`, color: theme.white, height: '100%' }}>
                                                <Group gap="sm" mb="sm" align="flex-start">
                                                    <ThemeIcon size={48} radius="md" color={a.color} variant="filled">{a.icon}</ThemeIcon>
                                                    <Stack gap={0}>
                                                        <Title order={3} size="h4" style={{ color: theme.white }}>{a.title}</Title>
                                                        <Text fz="xs" style={{ color: theme.colors.gray[3] }}>{a.sub}</Text>
                                                    </Stack>
                                                </Group>
                                                <Text fz="sm" style={{ color: theme.colors.gray[2] }}>{a.body}</Text>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </Paper>
                </motion.div>

                {/* ---------- What debate taught me ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb={4} ta="center" style={{ color: theme.white }}>What debate teaches</Title>
                        <Text ta="center" mb="xl" maw={680} mx="auto" style={{ color: theme.colors.gray[4] }}>
                            What I learned competing &mdash; and what coaching teaches students.
                        </Text>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible">
                            <Grid gutter="lg">
                                {lessons.map((l) => (
                                    <Grid.Col key={l.title} span={{ base: 12, md: 6 }}>
                                        <motion.div variants={itemVariants}>
                                            <Paper p="lg" radius="md" style={{ background: `linear-gradient(135deg, ${theme.colors[l.color][9]}, ${theme.colors[l.color][7]})`, color: theme.white, height: '100%' }}>
                                                <ThemeIcon size={44} radius="md" color={l.color} variant="filled" mb="sm">{l.icon}</ThemeIcon>
                                                <Title order={3} size="h4" style={{ color: theme.white }} mb="xs">{l.title}</Title>
                                                <Text fz="sm" style={{ color: theme.colors.gray[2] }}>{l.body}</Text>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </Paper>
                </motion.div>

                {/* ---------- Coaching principles ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Group gap="md" mb="md">
                            <ThemeIcon size={42} radius="md" color="success" variant="light"><IconChecklist size={24} /></ThemeIcon>
                            <Title order={3}>How I&rsquo;d coach</Title>
                        </Group>
                        <Stack gap="sm">
                            {principles.map((p, i) => (
                                <Group key={i} gap="sm" align="flex-start" wrap="nowrap">
                                    <Badge size="sm" variant="filled" color="success" style={{ flexShrink: 0, marginTop: 2 }}>{i + 1}</Badge>
                                    <Text size="sm" c="gray">{p}</Text>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                </motion.div>

                {/* ---------- Continuing relevance ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Group gap="md" mb="md">
                            <ThemeIcon size={42} radius="md" color="primary" variant="light"><IconStars size={24} /></ThemeIcon>
                            <Title order={3}>Debate never stopped being useful</Title>
                        </Group>
                        <Text size="sm" c="gray" mb="sm">
                            <strong>Investor Q&A</strong> &mdash; adversarial scrutiny under pressure, in a board context. Same muscle as PoIs.
                        </Text>
                        <Text size="sm" c="gray" mb="sm">
                            <strong>Briefing clinical advisors</strong> &mdash; structured argument with cross-examination from domain experts.
                        </Text>
                        <Text size="sm" c="gray">
                            <strong>Cross-functional argument</strong> &mdash; taking the other side at full strength before committing to one. The single most under-priced cognitive skill in operating work.
                        </Text>
                    </Paper>
                </motion.div>
            </Stack>
        </Section>
    );
};

export default DebatePersonaPage;
