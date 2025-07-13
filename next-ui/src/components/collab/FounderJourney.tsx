'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, Title, Text, useMantineTheme } from '@mantine/core';
import { IconRocket, IconUsers, IconMessageChatbot, IconFileDescription, IconChartBar } from '@tabler/icons-react';
import type { ComponentType } from 'react';

interface Step {
  title: string;
  description: string;
  icon: ComponentType<{ size: number; color?: string }>;
}

const steps: Step[] = [
  {
    title: 'You Apply',
    description:
      "You tell me what you're building, where you want to be, and what's holding you back. No pitch deck needed — just clarity, conviction, and a bit of ambition.",
    icon: IconFileDescription,
  },
  {
    title: 'We Talk',
    description:
      "If your idea has legs and you're serious, we book time. I'll challenge it, add insight, and suggest where I can help. All confidential — NDAs welcome.",
    icon: IconMessageChatbot,
  },
  {
    title: 'We Start to Collaborate',
    description:
      "This could be light — an hour a week, sparring, or a small project. We solve something real together and see how it feels.",
    icon: IconUsers,
  },
  {
    title: 'We Formalise',
    description:
      "If it's working and the value is clear, we agree terms. That could be equity, light-touch advisory, or stepping in deeper.",
    icon: IconChartBar,
  },
  {
    title: 'We Accelerate',
    description:
      "Now we're in. Building with conviction — toward traction, funding, or growth.",
    icon: IconRocket,
  },
];

// Animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.5,
      delayChildren: 0.3,
    }
  }
};

const lineVariants = {
  hidden: { height: '0%' },
  visible: {
    height: '100%',
    transition: { duration: 1.5 }
  }
};

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      damping: 15,
      stiffness: 70,
    }
  }
};

interface StepProps {
  title: string;
  description: string;
  icon: ComponentType<{ size: number; color?: string }>;
}

function Step({ title, description, icon: Icon }: StepProps) {
  const theme = useMantineTheme();

  return (
    <motion.div
      variants={stepVariants}
      style={{
        marginLeft: 60,
        marginBottom: '80px',
        position: 'relative',
      }}
    >
      {/* Dot on the vertical line */}
      <Box
        style={{
          position: 'absolute',
          left: -53,
          top: -8,
          width: 50,
          height: 50,
          backgroundColor: theme.colors.primary[6],
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={24} color={theme.white} />
      </Box>
      <Title ta="left" order={4} style={{ marginBottom: 8 }}>
        {title}
      </Title>
      <Text ta="left" size="sm" c="dark">{description}</Text>
    </motion.div>
  );
}

export default function FounderJourney() {
  const theme = useMantineTheme();

  return (
    <Box
      style={{
        position: 'relative',
        padding: '100px 0',
        maxWidth: '800px',
        margin: '0 auto',
        minHeight: '100vh',
      }}
    >
      {/* Box for Title/Text */}
      <Box mb="xl">
        <Title order={2} mb="lg">How We Start Building Together</Title>
        <Text size="sm" c="dark">
          Not a pitch deck. Not a contract. Just a conversation — and a shared intent to build something real.
        </Text>
      </Box>

      {/* Animation container */}
      <motion.div
        style={{ position: 'relative' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Vertical Line */}
        <motion.div
          style={{
            position: 'absolute',
            left: 30,
            top: 0,
            width: 4,
            backgroundColor: theme.colors.primary[6],
            transformOrigin: 'top',
            borderRadius: '2px',
          }}
          variants={lineVariants}
        />

        {/* Steps Container */}
        <Box style={{ position: 'relative', zIndex: 1 }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} icon={step.icon} />
          ))}
        </Box>
      </motion.div>
    </Box>
  );
} 