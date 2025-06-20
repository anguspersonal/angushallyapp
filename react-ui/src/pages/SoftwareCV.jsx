import React, { useState } from 'react';
import { Container, Title, Text, Paper, Grid, List, ThemeIcon, rem, Badge, Group, Stack, useMantineTheme, Image, Overlay, Box } from '@mantine/core';
import { IconCode, IconDatabase, IconServer, IconTools, IconBrandReact, IconBrandNodejs, IconBrandPython, IconChevronRight, IconExternalLink, IconBrandCss3, IconBrandJavascript, IconMapPin, IconBrain, IconBookmark, IconRun } from '@tabler/icons-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { motionTransitions } from '../theme';
import { Link } from 'react-router-dom';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const SoftwareCV = () => {
    const theme = useMantineTheme();
    const [hoveredProject, setHoveredProject] = useState(null);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -20]);
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (projectIndex) => {
        setImageErrors(prev => ({
            ...prev,
            [projectIndex]: true
        }));
    };

    const skills = [
        {
            title: 'Frontend Development',
            icon: <IconBrandReact size={24} />,
            color: 'blue',
            listIcon: <IconBrandReact size={rem(14)} />,
            items: [
                'React.js with modern hooks and context API',
                'Responsive design with Mantine UI',
                'State management with Redux/Context',
                'TypeScript for type safety',
                'CSS/SCSS with modern practices'
            ]
        },
        {
            title: 'Backend Development',
            icon: <IconServer size={24} />,
            color: 'green',
            listIcon: <IconDatabase size={rem(14)} />,
            items: [
                'Node.js/Express.js RESTful APIs',
                'PostgreSQL database design and optimization',
                'Authentication with JWT and OAuth',
                'API integration and third-party services',
                'Server-side rendering and optimization'
            ]
        },
        {
            title: 'DevOps & Tools',
            icon: <IconTools size={24} />,
            color: 'violet',
            listIcon: <IconTools size={rem(14)} />,
            items: [
                'Git version control and GitHub workflows',
                'Docker containerization',
                'CI/CD pipeline implementation',
                'Heroku deployment',
                'Linux server management'
            ]
        }
    ];

    const projects = [
        {
            title: 'EatSafeUK',
            description: 'A public health application that helps users check hygiene scores of food establishments',
            color: 'teal',
            image: '/20250530_0936_Chef_Preparing_Ingredients_remix_01jwg594xxe4cvhwhc47d9t7r9.jpg',
            alt: 'AI-generated image of a chef preparing ingredients in a professional kitchen',
            link: '/projects/eat-safe-uk',
            listIcon: <IconMapPin size={rem(14)} />,
            features: [
                'Google Maps API integration for location services',
                'Food Standards Agency database integration',
                'Real-time establishment search and filtering',
            ]
        },
        {
            title: 'AI Text Analysis Tool',
            description: 'An intelligent text analysis application featuring advanced NLP capabilities',
            color: 'indigo',
            image: '/20250530_0955_Colorful_Data_Streams_remix_01jwg6b9xvfwjam1v66vs0ckqx.jpg',
            alt: 'AI-generated visualization of data streams and neural networks',
            link: '/projects/ai/text-analysis',
            listIcon: <IconBrain size={rem(14)} />,
            features: [
                'Advanced natural language processing',
                'Real-time text analysis',
                'Modern Mantine UI components'
            ]
        },
        {
            title: 'Bookmark Management System',
            description: 'A full-stack application integrating with Raindrop.io\'s API',
            color: 'orange',
            image: '/20250530_neural_network.jpg',
            alt: 'AI-generated visualization of interconnected neural networks',
            link: '/projects/bookmarks',
            listIcon: <IconBookmark size={rem(14)} />,
            features: [
                'OAuth2 authentication flow',
                'Real-time bookmark synchronization',
                'Custom categorization and tagging',
                'Responsive Material Design UI'
            ]
        },
        {
            title: 'Strava Integration',
            description: 'A fitness tracking application with Strava API integration',
            color: 'red',
            image: '/appshunter-io-KpuAFDLvj78-unsplash.jpg',
            alt: 'Photo by appshunter.io on Unsplash',
            link: '/projects/strava',
            listIcon: <IconRun size={rem(14)} />,
            features: [
                'Strava API integration for activity tracking',
                'Custom activity visualization',
                'User authentication and data privacy',
                'Real-time activity updates'
            ]
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <Container size="lg" py="xl">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <Stack spacing="xl">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ y }}
                    >
                        <Title
                            order={1}
                            mb="xl"
                            ta="center"
                            sx={{
                                background: `linear-gradient(45deg, ${theme.colors.primary[6]}, ${theme.colors.secondary[6]})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: '3rem',
                                fontWeight: 800
                            }}
                        >
                            Software Engineering Portfolio
                        </Title>
                    </motion.div>

                    <MotionPaper
                        shadow="sm"
                        p="xl"
                        radius="md"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.colors.dark[7]}, ${theme.colors.dark[8]})`,
                            color: theme.white
                        }}
                    >
                        <Title order={2} mb="xl" ta="center" sx={{ color: theme.white }}>Technical Expertise</Title>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Grid>
                                {skills.map((skill, index) => (
                                    <Grid.Col key={index} span={{ base: 12, md: 4 }} sx={{ display: 'flex' }}>
                                        <motion.div
                                            variants={itemVariants}
                                            whileHover={{
                                                y: -8,
                                                transition: { type: "spring", stiffness: 400, damping: 25 }
                                            }}
                                            style={{ willChange: 'transform', width: '100%', display: 'flex', height: '20em' }}
                                        >
                                            <Paper
                                                p="md"
                                                withBorder
                                                sx={{
                                                    background: `linear-gradient(135deg, ${theme.colors[skill.color][9]}, ${theme.colors[skill.color][7]})`,
                                                    color: theme.white,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Group position="apart" mb="md" sx={{ flexShrink: 0 }}>
                                                    <motion.div
                                                        whileHover={{
                                                            rotate: 360,
                                                            transition: { duration: 0.6, ease: "easeInOut" }
                                                        }}
                                                        style={{ willChange: 'transform' }}
                                                    >
                                                        <ThemeIcon size={50} radius="md" color={skill.color}>
                                                            {skill.icon}
                                                        </ThemeIcon>
                                                    </motion.div>
                                                    <Badge size="lg" variant="filled" color={skill.color}>
                                                        {skill.title}
                                                    </Badge>
                                                </Group>
                                                <List
                                                    spacing="xs"
                                                    size="sm"
                                                    sx={{
                                                        '& .mantine-List-itemWrapper': {
                                                            alignItems: 'flex-start'
                                                        },
                                                        '& .mantine-List-itemIcon': {
                                                            marginTop: '2px'
                                                        },
                                                        flexGrow: 1,
                                                        overflow: 'auto'
                                                    }}
                                                    icon={
                                                        <ThemeIcon color={skill.color} size={24} radius="xl">
                                                            {skill.listIcon}
                                                        </ThemeIcon>
                                                    }
                                                >
                                                    {skill.items.map((item, i) => (
                                                        <List.Item key={i}>{item}</List.Item>
                                                    ))}
                                                </List>
                                            </Paper>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </MotionPaper>

                    <MotionPaper
                        shadow="sm"
                        p="xl"
                        radius="md"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.colors.dark[7]}, ${theme.colors.dark[8]})`,
                            color: theme.white
                        }}
                    >
                        <Title order={2} mb="xl" ta="center" sx={{ color: theme.white }}>Key Projects</Title>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Grid>
                                {projects.map((project, index) => (
                                    <Grid.Col key={index} span={{ base: 12, md: 6 }}>
                                        <motion.div
                                            variants={itemVariants}
                                            whileHover={{
                                                y: -8,
                                                transition: { type: "spring", stiffness: 400, damping: 25 }
                                            }}
                                            onHoverStart={() => setHoveredProject(index)}
                                            onHoverEnd={() => setHoveredProject(null)}
                                            style={{ willChange: 'transform' }}
                                        >
                                            <Link to={project.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Paper
                                                    withBorder
                                                    h="31em"
                                                >

                                                    <MotionBox
                                                        sx={{
                                                            overflow: 'hidden',
                                                            borderRadius: theme.radius.md,
                                                            marginBottom: theme.spacing.md,
                                                            position: 'relative',
                                                        }}
                                                        whileHover={{ scale: 1.02 }}
                                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        style={{ willChange: 'transform' }}
                                                    >

                                                        <motion.div
                                                            initial={{ opacity: 0.2 }}
                                                            animate={{
                                                                opacity: hoveredProject === index ? 0.6 : 0.2,
                                                            }}
                                                            transition={{ duration: 0.3 }}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
                                                                pointerEvents: 'none'
                                                            }}
                                                        />
                                                        <Image
                                                            src={imageErrors[index] ? '/20250418_3BY2_Default_Image_Placeholder.png' : project.image}
                                                            height={200}
                                                            fit="cover"
                                                            onError={() => handleImageError(index)}
                                                            alt={project.alt || 'Project visualization'}
                                                        />
                                                    </MotionBox>
                                                    <Group position="apart" mb="md" p="md">
                                                        <Title order={3} size="h4">{project.title}</Title>
                                                        <motion.div
                                                            animate={{
                                                                x: hoveredProject === index ? 8 : 0,
                                                                rotate: hoveredProject === index ? 45 : 0
                                                            }}
                                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                            style={{ willChange: 'transform' }}
                                                        >
                                                            <IconExternalLink size={24} />
                                                        </motion.div>
                                                    </Group>
                                                    <Text size="sm" mb="md" sx={{ opacity: 0.9, flexGrow: 0 }}>
                                                        {project.description}
                                                    </Text>
                                                    <List
                                                        spacing="xs"
                                                        size="sm"
                                                        sx={{
                                                            '& .mantine-List-itemWrapper': {
                                                                alignItems: 'flex-start'
                                                            },
                                                            '& .mantine-List-itemIcon': {
                                                                marginTop: '2px'
                                                            },
                                                            flexGrow: 1
                                                        }}
                                                        icon={
                                                            <ThemeIcon color={project.color} size={24} radius="xl">
                                                                {project.listIcon}
                                                            </ThemeIcon>
                                                        }
                                                    >
                                                        {project.features.map((feature, i) => (
                                                            <List.Item key={i}>{feature}</List.Item>
                                                        ))}
                                                    </List>
                                                </Paper>
                                            </Link>
                                        </motion.div>
                                    </Grid.Col>
                                ))}
                            </Grid>
                        </motion.div>
                    </MotionPaper>
                </Stack>
            </motion.div>
        </Container>
    );
};

export default SoftwareCV; 