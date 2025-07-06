import React from 'react';
import {
  Container,
  Paper,
  Title,
  Box,
  LoadingOverlay,
} from '@mantine/core';
import Header from '../../../components/Header';
import '../../../general.css';

export default function TextAnalysisAI() {

  return (
    <Box>
      <Header />
      <Container py="xl">
        <Title order={1} align="center" mb="xl">
          Work in Progress
        </Title>
        <Paper p="md" radius="md" withBorder>
          <LoadingOverlay visible={loading} overlayBlur={2} />

          
        </Paper>
      </Container>
    </Box>
  );
} 