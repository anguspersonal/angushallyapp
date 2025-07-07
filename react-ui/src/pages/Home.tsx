// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Box, Container, Title, Text, Image, Anchor, SimpleGrid, useMantineTheme, Button } from '@mantine/core';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Snippet from '../components/Snippet';
import ProjectSnippet from '../components/ProjectSnippet';
import { fetchLatestBlog } from '../pages/blog/fetchBlogData';
import projectList from '../data/projectList';
import { assets } from '../theme';
import "../general.css";

// Animation variants
const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
          transition: {
        delay: i * 0.1,
        duration: 0.5
      }
  })
};

function Home() {
  const theme = useMantineTheme();
  const [latestBlog, setBlog] = useState(null);
  const [latestProject, setProject] = useState(null);

  // Fetch latest blog
  useEffect(() => {
    async function getLatestblog() {
      const latestBlogData = await fetchLatestBlog();
      setBlog(latestBlogData);
    }
    getLatestblog();
  }, []);

  // Fetch latest project
  useEffect(() => {
    async function getLatestProject() {
      try {
        const latestProjectData = projectList
          .filter(p => p.created_at)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        setProject(latestProjectData);
      } catch (error) {
        console.error("❌ Error fetching latest project:", error);
      }
    }
    getLatestProject();
  }, []);

  return (
    <Box>
      <Header />
      <Container size="md" py="xl">
        <motion.div initial="hidden" animate="visible">
          <motion.div custom={0} variants={contentVariants} style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            <Image
              src="/20250329_AH_Profile_Wales.jpg"
              alt="Angus Hally, out hiking in Wales"
              fallbackSrc={assets.placeholderImage.square}
              radius="50%"
              h={300}
              w={300}
              fit="cover"
              mx="auto"
              mb="md"
              styles={{
                root: { border: `2px solid ${theme.colors.gray[3]}`, boxShadow: theme.shadows.sm }
              }}
            />
          </motion.div>

          <motion.div custom={1} variants={contentVariants}>
            <Title order={1} ta="center" mb="lg">Welcome</Title>
          </motion.div>

          <motion.div custom={2} variants={contentVariants}>
            <Text ta="center" mb="md">
              👋 Hi, I'm Angus. I'm a strategy consultant, amateur developer, and constant learner.
              This site is a mix of personal projects, career experiments and things
              I've learned by building, shipping, and sometimes failing.
            </Text>
            <Text ta="center" mb="lg">
              I'm also open to collaborating with early-stage founders; helping take raw ideas toward traction, funding, and real-world impact.
              Feel free to explore, poke around, and say hello via the <Anchor component={Link} to="/contact">contact me</Anchor> page!
            </Text>
          </motion.div>

          <motion.div custom={3} variants={contentVariants}>
            <Text ta="center" size="sm" c="dimmed" mb="lg">
              Here's what I'm working on right now:
            </Text>
          </motion.div>

          <motion.div custom={4} variants={contentVariants}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {latestBlog && <Snippet {...latestBlog} />}
              {latestProject && <ProjectSnippet project={latestProject} />}
            </SimpleGrid>
          </motion.div>
        </motion.div>
      </Container>
      <Box ta="center" mb="xl">
        <Button
          component={Link}
          to="/contact"
          size="lg"
          variant="gradient"
          gradient={{ from: 'teal', to: 'blue' }}
        >
          Contact Me
        </Button>
      </Box>
    </Box>
  );
}

export default Home;
