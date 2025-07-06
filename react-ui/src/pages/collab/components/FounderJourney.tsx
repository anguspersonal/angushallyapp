'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Box, Title, Text, useMantineTheme } from '@mantine/core';
import { IconRocket, IconUsers, IconMessageChatbot, IconFileDescription, IconChartBar } from '@tabler/icons-react';

const steps = [
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

// Define animation variants for the container, line, and steps
// This uses Framer Motion's parent-child animation propagation
const containerVariants = {
  hidden: {}, // Empty object since the container itself doesn't animate
  visible: {
    transition: {
      staggerChildren: 0.5, // Delay between each child animation
      delayChildren: 0.3, // Initial delay before first child starts
    }
  }
};

// Line variant that responds to parent container's visibility
const lineVariants = {
  hidden: { height: '0%' },
  visible: {
    height: '100%',
    transition: { duration: 1.5, ease: "easeOut" }
  }
};

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
        <Text size="sm" color="dimmed">
          Not a pitch deck. Not a contract. Just a conversation — and a shared intent to build something real.
        </Text>
      </Box>

      {/* Animation container - This controls the coordinated animation sequence */}
      <motion.div
        style={{ position: 'relative' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-100px" }} // Removed once: true to allow repeating
        variants={containerVariants}
      >
        {/* Vertical Line - Animated relative to container's state */}
        <motion.div
          style={{
            position: 'absolute',
            left: 30,
            top: 0,
            width: 4,
            backgroundColor: theme.colors.blue[6],
            transformOrigin: 'top',
            borderRadius: '2px',
            // height controlled by animation
          }}
          variants={lineVariants}
        />

        {/* Steps Container */}
        <Box style={{ position: 'relative', zIndex: 1 }}>
          {steps.map((step, index) => (
            <Step key={index} index={index} title={step.title} description={step.description} icon={step.icon} />
          ))}
        </Box>
      </motion.div>
    </Box>
  );
}

// Step component with animations based on parent container
function Step({ title, description, index, icon: Icon }) {
  const theme = useMantineTheme();

  // Step variants - will be triggered by parent container
  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 70,
        // These transitions apply to this specific step
        // The staggering is handled by the parent
      }
    }
  };

  return (
    <motion.div
      // Connect to parent's animation state via variants
      variants={stepVariants}
      // No initial/whileInView needed - parent controls this
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
          backgroundColor: theme.colors.blue[6],
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={24} color={theme.white} />
      </Box>
      <Title align="left" order={4} style={{ marginBottom: 8 }}>
        {title}
      </Title>
      <Text align="left" size="sm" color="dimmed">{description}</Text>
    </motion.div>
  );
}
