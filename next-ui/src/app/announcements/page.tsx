'use client';

import { Container, Title, Text } from '@mantine/core';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0, y: -10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function AnnouncementsPage() {
  return (
    <Container size="sm" pt="xl">
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item}>
          <Title order={1} mb="md">
            Announcements
          </Title>
        </motion.div>
        <motion.div variants={item}>
          <Text>
            Welcome to the announcements page. Here you'll find the latest news and updates about our projects. Stay tuned!
          </Text>
        </motion.div>
      </motion.div>
    </Container>
  );
}
