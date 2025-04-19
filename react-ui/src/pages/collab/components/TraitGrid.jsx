import React from 'react';
import { Box, Center, Text, Image, HoverCard, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { motionTransitions } from '../../../theme'; // Import theme transitions

const traits = [
  // Order determines placement in grid cells (top-left to bottom-right, skipping center)
  { 
    label: 'Leader', 
    icon: '🔥', 
    tooltip: 'Resilient, energising, clear under pressure', 
    full: 'From leading in classrooms, teams, and delivery, I bring clarity and resilience, to keep momentum when it gets messy.'
  },         // Cell 1/1
  { 
    label: 'Advocate', 
    icon: '📣', 
    tooltip: 'External voice — story, pitch, presence', 
    full: 'From public speaking and founder events, I bring confident communication, to help your team show up powerfully.'
  },       // Cell 1/2
  { 
    label: 'Consultant', 
    icon: '💼', 
    tooltip: 'Strategy and structured delivery', 
    full: 'From Accenture, I bring strategic thinking and delivery discipline, to move fast without losing focus.'
  },     // Cell 1/3 
  { 
    label: 'Data Strategist', 
    icon: '📊', 
    tooltip: 'Data as an asset — structured, valuable, actionable', 
    full: 'From Anmut, I bring a data strategy lens, to help teams prioritise, structure, and extract value from their data.'
  }, // Cell 2/1
  // Skip cell 2/2 (logo)
  { 
    label: 'Generalist', 
    icon: '🧩', 
    tooltip: 'Adaptable across roles, functions, and phases', 
    full: 'From working across teams and sectors, I bring a generalist mindset, to plug in where needed and create momentum.'
  },     // Cell 2/3
  { 
    label: 'Full Stack Dev', 
    icon: '💻', 
    tooltip: 'Technical fluency — I can build, not just talk', 
    full: 'From self-taught full stack development, I bring technical fluency, to bridge product and engineering and move faster.'
  }, // Cell 3/1
  { 
    label: 'Startup Operator', 
    icon: '🚀', 
    tooltip: 'Hands-on startup experience across product and ops', 
    full: 'From Teamvine, I bring real startup execution across product, ops, and growth, to help build what matters under pressure.'
  },// Cell 3/2
  { 
    label: 'Conscientious', 
    icon: '🫶', 
    tooltip: 'I care deeply about people, outcomes, and integrity', 
    full: 'From teaching and team building, I bring conscientious care, to design with empathy and do what\'s right — not just fast.'
  }   // Cell 3/3 (New)
];

// Define grid areas corresponding to the traits array order
const gridAreas = [
  '1 / 1', '1 / 2', '1 / 3',
  '2 / 1',          '2 / 3', // Center (2/2) is skipped
  '3 / 1', '3 / 2', '3 / 3'
];

// Define component dimensions using viewport units (vmin)
const itemSizeVmin = 20; // Base size for desktop
const mobileItemSizeVmin = 25; // Larger size for mobile
const logoSizeVmin = itemSizeVmin * 0.6; // Logo size relative to item size
const containerSizeVmin = itemSizeVmin * 3; // Grid is 3x3

// Simpler animation variants for scale/opacity within grid cells
const itemVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5
  },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      delay: i * 0.1
    }
  })
};

// Add container variants for staggered animation
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

function TraitGrid() {
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const currentItemSize = isSmallScreen ? mobileItemSizeVmin : itemSizeVmin;

  return (
    <LazyMotion features={domAnimation}>
      <Center style={{ height: '100%', minHeight: `calc(${currentItemSize * 3}vmin + 50px)` }}> 
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={motionTransitions.viewportRepeat}
        >
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(3, ${currentItemSize}vmin)`,
              gridTemplateRows: `repeat(3, ${currentItemSize}vmin)`,
              width: `${currentItemSize * 3}vmin`,
              height: `${currentItemSize * 3}vmin`,
              position: 'relative',
            }}
          >
            {/* Center Logo - Place in grid cell 2/2 - using vmin */}
            <Center
              style={{
                gridArea: '2 / 2', // Place in center cell
                width: `${logoSizeVmin}vmin`, 
                height: `${logoSizeVmin}vmin`,
                margin: 'auto', // Center logo within the grid cell
                zIndex: 10 // Keep logo potentially on top if needed
              }}
            >
              <Image 
                src="/AH-logo-no-background.ico" 
                alt="AH Logo"
                fit="contain"
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
            </Center>

            {/* Map traits to grid cells */} 
            {traits.map((trait, index) => (
              <HoverCard 
                width={280} 
                shadow="md" 
                withArrow
                key={trait.label} 
                position="right"
              >
                <HoverCard.Target>
                  <motion.div
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={motionTransitions.viewportRepeat}
                    style={{
                      gridArea: gridAreas[index], 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      padding: '0.5vmin',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <motion.div
                      whileHover={{ 
                        scale: 1.3,
                        rotate: [0, 3, -3, 3, 0]
                      }}
                      transition={{ 
                        rotate: { duration: 1, ease: "easeInOut", repeat: 0 },
                        scale: { type: "spring", stiffness: 400, damping: 15 }
                      }}
                    >
                      <Text size="xl" style={{ fontSize: `calc(1rem + ${currentItemSize * 0.1}vmin)`, lineHeight: 1 }}>
                        {trait.icon}
                      </Text>
                      <Text size="xs" mt={4} style={{ fontSize: `calc(0.6rem + ${currentItemSize * 0.05}vmin)` }}> 
                        {trait.label}
                      </Text>
                    </motion.div>
                  </motion.div>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Text size="sm">{trait.full}</Text>
                </HoverCard.Dropdown>
              </HoverCard>
            ))}
            {/* Note: One grid cell (likely 3/3) will be empty if only 7 traits */} 
          </Box>
        </motion.div>
      </Center>
    </LazyMotion>
  );
}

export default TraitGrid; 