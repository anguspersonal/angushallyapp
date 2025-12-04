'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Title, Text, Image, Anchor, SimpleGrid, Button } from '@mantine/core';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Snippet from '../components/Snippet';
import ProjectSnippet from '../components/ProjectSnippet';
import { useLatestPost } from '@/services/content/hooks';
import projectList from '../data/projectList';
import { assets } from '../lib/theme';

// Animation variants
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface Project {
  id: number;
  name: string;
  desc: string;
  route: string;
  tags?: string[];
  created_at?: string;
}

export default function Home() {
  const { post: latestBlog } = useLatestPost();
  const [latestProject, setProject] = useState<Project | null>(null);

  // Fetch latest project
  useEffect(() => {
    async function getLatestProject() {
      try {
        const latestProjectData = projectList
          .filter(p => p.created_at)
          .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())[0];
        setProject(latestProjectData);
      } catch (error) {
        console.error("❌ Error fetching latest project:", error);
      }
    }
    getLatestProject();
  }, []);

  return (
    <Box>
      <Container size="md" py="xl">
        <motion.div initial="hidden" animate="visible">
          <motion.div 
            variants={contentVariants} 
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
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
              style={{
                border: '2px solid #dee2e6',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
              }}
            />
          </motion.div>

          <motion.div variants={contentVariants}>
            <Title order={1} ta="center" mb="lg">Welcome</Title>
          </motion.div>

          <motion.div variants={contentVariants}>
            <Text ta="center" mb="md">
              👋 Hi, I'm Angus. I'm a  consultant, amateur developer, and constant learner.
              This site is a mix of personal projects, career experiments and things
              I've learned by building, shipping, and sometimes failing.
            </Text>
            <Text ta="center" mb="lg">
              I'm also open to collaborating with early-stage founders; helping take raw ideas toward traction, funding, and real-world impact.
              Feel free to explore, poke around, and say hello via the{' '}
              <Anchor component={Link} href="/contact">contact me</Anchor> page!
            </Text>
          </motion.div>

          <motion.div variants={contentVariants}>
            <Text ta="center" size="sm" c="dark" mb="lg">
              Here's what I'm working on right now:
            </Text>
          </motion.div>

          <motion.div variants={contentVariants}>
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
          href="/contact"
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
