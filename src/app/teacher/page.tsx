'use client';

/**
 * `/teacher` — Maths Teacher persona page.
 *
 * Curated render of docs/cvs/maths-teacher-cv.md. Source material is
 * thin (one resume bullet, one milestone photo) — page is structured
 * around the "what teaching taught me" narrative + pedagogical
 * principles. Outcomes card is intentionally honest about evidence
 * pending. See docs/guides/persona-page-workflow.md.
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
    IconSchool,
    IconBook,
    IconStethoscope,
    IconHeart,
    IconRoute,
    IconHourglass,
    IconUsers,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import NextImage from 'next/image';
import { Section } from '@/components/layout';

type Color = 'primary' | 'secondary' | 'accent' | 'success' | 'dark';

const lessons = [
    {
        icon: <IconUsers size={24} />,
        title: 'The gap between your model and theirs',
        body: 'Knowing where your understanding of a topic differs from the student’s — and reasoning across that gap — is the same skill that lets me brief engineers as a non-engineer and brief investors as a non-investor.',
        color: 'primary' as Color,
    },
    {
        icon: <IconHeart size={24} />,
        title: 'Composure under low-status conditions',
        body: 'Holding a Year 10 bottom set on a Friday afternoon is a particular kind of performance discipline. Everything since has had a lower difficulty floor.',
        color: 'accent' as Color,
    },
    {
        icon: <IconRoute size={24} />,
        title: 'Routine as a force multiplier',
        body: 'Lesson structure — do-now, modelling, independent practice, plenary — is what makes the classroom function. The same shape underwrites a startup operating system, a code-review process, a meeting agenda.',
        color: 'secondary' as Color,
    },
    {
        icon: <IconHourglass size={24} />,
        title: 'Marking 31 books at midnight on Sunday',
        body: 'Operator stamina starts here. So does the willingness to do the unglamorous part of the job rather than perform around it.',
        color: 'success' as Color,
    },
];

const principles = [
    'Diagnostic-first: find the misconception, then teach the correction. Don’t re-teach what’s already known.',
    'Worked examples beat explanation. Modelling out loud beats both.',
    'Spaced retrieval over re-exposure.',
    'A student who can apply a concept in a non-routine context has really got it.',
    'The single biggest determinant of A-Level outcomes is whether the student is willing to be wrong in front of you. Work on that before working on technique.',
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const TeacherPersonaPage = () => {
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
                                <Text fz="sm" tt="uppercase" fw={700} style={{ letterSpacing: '0.15em', color: theme.colors.accent[6] }}>
                                    Maths Teacher
                                </Text>
                                <Title
                                    order={1}
                                    style={{
                                        background: `linear-gradient(45deg, ${theme.colors.accent[6]}, ${theme.colors.primary[6]})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        fontSize: 'clamp(1.85rem, 6vw, 3rem)',
                                        fontWeight: 800,
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Two years teaching GCSE and A-Level maths in Harlow. The hardest thing I&rsquo;ve done.
                                </Title>
                                <Text size="lg" mt="md" c="dimmed">
                                    TeachFirst leadership-development placement at Burnt Mill Academy, 2016&ndash;2018. Where I learned to operate &mdash; the product-and-operator instinct, the willingness to teach, the comfort with being wrong in public all trace back to those two years.
                                </Text>
                            </Stack>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <Box style={{ position: 'relative', borderRadius: theme.radius.md, overflow: 'hidden', aspectRatio: '4/3' }}>
                                <NextImage
                                    src="/20180311_Teaching_Harlow_UK.jpeg"
                                    alt="Angus teaching mathematics at Burnt Mill Academy in Harlow"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 40vw"
                                    style={{ objectFit: 'cover' }}
                                />
                            </Box>
                        </Grid.Col>
                    </Grid>
                </motion.div>

                {/* ---------- The placement ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Group gap="md" mb="sm" align="flex-start">
                            <ThemeIcon size={48} radius="md" color="accent" variant="light"><IconSchool size={26} /></ThemeIcon>
                            <Stack gap={0}>
                                <Title order={3}>Burnt Mill Academy &mdash; Harlow, Essex</Title>
                                <Text fz="sm" c="dimmed">TeachFirst placement &middot; 2016&ndash;2018</Text>
                            </Stack>
                        </Group>
                        <Text size="sm" c="dimmed" mb="md">
                            A large secondary school serving a mixed-intake catchment in Essex. Mathematics department; GCSE foundation and higher tier classes plus A-Level mathematics. TeachFirst recruits high-performing graduates into challenging schools on a two-year training programme that combines a PGCE with deep operational immersion in a single school.
                        </Text>
                        <Group gap={6}>
                            <Badge size="sm" variant="light" color="accent">GCSE Maths</Badge>
                            <Badge size="sm" variant="light" color="accent">A-Level Maths</Badge>
                            <Badge size="sm" variant="light" color="accent">PGCE alongside</Badge>
                            <Badge size="sm" variant="light" color="accent">Two-year placement</Badge>
                        </Group>
                    </Paper>
                </motion.div>

                {/* ---------- Outcomes (honest placeholder) ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder style={{ borderStyle: 'dashed' }}>
                        <Group gap="md" align="flex-start">
                            <ThemeIcon size={48} radius="md" color="gray" variant="light"><IconStethoscope size={26} /></ThemeIcon>
                            <Stack gap={4} style={{ flex: 1 }}>
                                <Title order={4}>Cohort outcomes</Title>
                                <Text fz="sm" c="dimmed">
                                    Class-level exam-result deltas pending. The honest version of this page leads with where students started in mock results vs where they finished at GCSE/A-Level &mdash; once Angus surfaces the data from his TeachFirst archive, this card upgrades.
                                </Text>
                            </Stack>
                        </Group>
                    </Paper>
                </motion.div>

                {/* ---------- What teaching taught me ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                    <Paper shadow="sm" p="xl" radius="md" style={{ background: gradient, color: theme.white }}>
                        <Title order={2} mb={4} ta="center" style={{ color: theme.white }}>What teaching taught me</Title>
                        <Text ta="center" mb="xl" maw={640} mx="auto" style={{ color: theme.colors.gray[4] }}>
                            The transferable skills. Why this CV is also relevant for an edtech ventures audience or anyone hiring an operator who has held a classroom.
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

                {/* ---------- Pedagogical principles ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Group gap="md" mb="md">
                            <ThemeIcon size={42} radius="md" color="accent" variant="light"><IconBook size={24} /></ThemeIcon>
                            <Title order={3}>How I&rsquo;d teach now</Title>
                        </Group>
                        <Stack gap="sm">
                            {principles.map((p, i) => (
                                <Group key={i} gap="sm" align="flex-start" wrap="nowrap">
                                    <Badge size="sm" variant="filled" color="accent" style={{ flexShrink: 0, marginTop: 2 }}>{i + 1}</Badge>
                                    <Text size="sm" c="dimmed">{p}</Text>
                                </Group>
                            ))}
                        </Stack>
                    </Paper>
                </motion.div>

                {/* ---------- Continuing relevance ---------- */}
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                    <Paper shadow="sm" p="xl" radius="md" withBorder>
                        <Title order={4} mb="xs">Teaching never stopped.</Title>
                        <Text size="sm" c="dimmed">
                            I currently brief, mentor, and teach across a non-technical co-founder, a mobile engineer, clinical advisors, and investors. The teaching skill stayed live.
                        </Text>
                    </Paper>
                </motion.div>
            </Stack>
        </Section>
    );
};

export default TeacherPersonaPage;
