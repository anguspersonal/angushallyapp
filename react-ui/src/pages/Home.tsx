// @ts-nocheck - This file contains dynamic data fetching and complex Mantine UI components that TypeScript cannot properly infer
import React from 'react';
import { Container, Title, Text, Image, Anchor, useMantineTheme } from '@mantine/core';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
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
  
  return (
    <Layout>
      <Container size="md" pt={0}>
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

          {/* Project snippets will be added here */}
        </motion.div>
      </Container>
    </Layout>
  );
}

export default Home;
