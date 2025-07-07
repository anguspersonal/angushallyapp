import React from 'react';
import { Box, Center, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { motion, LazyMotion, domAnimation } from 'framer-motion';

const traits = [
  {
    label: 'Consultant',
    icon: '💼',
    description: 'From Accenture: strategy and structured delivery.'
  },
  {
    label: 'Startup Operator',
    icon: '🚀',
    description: 'From Teamvine: ran product, ops, and delivery.'
  },
  {
    label: 'Generalist',
    icon: '🧩',
    description: 'I flex across roles and fill gaps fast.'
  },
  {
    label: 'Full Stack Dev',
    icon: '💻',
    description: 'Built and shipped apps — technical fluency.'
  },
  {
    label: 'Data Strategist',
    icon: '📊',
    description: 'At Anmut: data as an asset, with business value.'
  },
  {
    label: 'Leader',
    icon: '🔥',
    description: 'Team energy, clarity under pressure.'
  },
  {
    label: 'Advocate',
    icon: '📣',
    description: 'I represent ideas, teams, and missions well.'
  },
];

const radius = 160; // distance from center
const itemContainerPadding = 50; // Explicit padding around orbit circle
const containerSize = radius * 2 + itemContainerPadding * 2; // Calculate total container size
const centerOffset = radius + itemContainerPadding; // Center coordinate within the container

// Define fixed size for the orbiting items
const itemWidth = 100; 
const itemHeight = 80;


function CollabOrbit() {
  const theme = useMantineTheme();
  // Transition with repeat
  const orbitTransition = { repeat: Infinity, duration: 1 }; 

  return (
    <LazyMotion features={domAnimation}>
      <Center style={{ height: '100%', minHeight: containerSize }}>
        <Box
          style={{
            position: 'relative',
            width: containerSize,
            height: containerSize,
          }}
        >
          {/* Center label */}
          <Center
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              textAlign: 'center',
            }}
          >
            <Text size="lg" fw={700}>
              Angus Hally
              <br />
              <Text size="sm" c="dimmed">
                Founder-Ready Operator
              </Text>
            </Text>
          </Center>

          {/* Rotating container - use animate */}
          <motion.div
            animate={{ rotate: 360 }} // Use animate for continuous loop
            transition={orbitTransition} // Use repeating transition
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            {traits.map((trait, index) => {
              const angle = (360 / traits.length) * index;
              const rad = (angle * Math.PI) / 180;
              const x = radius * Math.cos(rad);
              const y = radius * Math.sin(rad);

              return (
                <Tooltip
                  label={trait.description}
                  withArrow
                  position="right"
                  key={index}
                >
                  {/* Inner div - use animate */}
                  <motion.div
                    animate={{ rotate: -360 }} // Use animate for continuous loop
                    transition={orbitTransition} // Use same repeating transition
                    style={{
                      position: 'absolute',
                      top: `${centerOffset + y}px`,
                      left: `${centerOffset + x}px`,
                      transform: 'translate(-50%, -50%)',
                      transformOrigin: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      width: `${itemWidth}px`,
                      height: `${itemHeight}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text size="xl" style={{ fontSize: 28 }}>
                      {trait.icon}
                    </Text>
                    <Text size="sm" mt={4}>
                      {trait.label}
                    </Text>
                  </motion.div>
                </Tooltip>
              );
            })}
          </motion.div>
        </Box>
      </Center>
    </LazyMotion>
  );
}

export default CollabOrbit; 