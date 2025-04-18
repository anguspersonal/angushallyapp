import React from 'react';
import { Box, Container, Title, Divider } from '@mantine/core';
import '../index.css';
import "../general.css";
import TraitGrid from '../components/TraitGrid';

// You can keep or remove this import if you add a Header to the test page
import Header from '../components/Header'; 

function TestPage() {
  return (
    <Box>
      {/* Optional: Add Header if you want nav on the test page */}
       <Header />
      <h1>Test Page</h1>
      
      <Container size="lg" py="xl">
        <Title order={1} align="center" mb="xl">
          Component Test Page
        </Title>

        {/* Section 1: Explosion Test */}
        <Box mb="xl" style={{ border: '1px dashed lightgrey', padding: '1rem' }}>
          <Title order={3} mb="md" align="center">Trait Grid Component Test</Title>
          <TraitGrid />
        </Box>

        <Divider my="xl" label="Future Test Components Below" labelPosition="center" />

        {/* Placeholder for Next Test */}
        <Box>
          <Title order={3} mb="md">Placeholder for Next Test</Title>
        </Box>
        
      </Container>
    </Box>
  );
}

export default TestPage; 