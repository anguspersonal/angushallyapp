import { useState } from 'react';
import {
  Container,
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Box,
  LoadingOverlay,
  Alert,
  Anchor,
  SimpleGrid, 
  useMantineTheme
} from '@mantine/core';
import { motion } from 'framer-motion';
import { analyzeText } from './ai';
import { useAuth } from '../../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Header from "../../../components/Header";
import projectList from '../../../data/projectList';
import ProjectSnippet from '../../../components/ProjectSnippet';
import "../../../general.css";


export default function AI() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const theme = useMantineTheme();
  const projects = projectList;

  // Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
      opacity: 1,
      transition: {
          staggerChildren: 0.1, // Stagger snippets
          delayChildren: 0.2 // Delay after title
      }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
  }
};


  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const result = await analyzeText(input);
      setResponse(result);
    } catch (error) {
      if (error.status === 401) {
        setResponse('Please log in to use the AI Text Analysis feature.');
      } else {
        setResponse('Error: Failed to analyze text. Please try again.');
      }
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box>
        <Header />
        <Container py="xl">
          <Title order={1} align="center" mb="xl">
            AI Text Analysis
          </Title>
            <Container py="xl">
                <Title order={1} ta="center" mb="xl">My Projects</Title>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <SimpleGrid
                        cols={{ base: 1, sm: 2, md: 3 }} // Responsive columns
                        spacing="lg"
                    >
                        {projects.map((project, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <ProjectSnippet project={project} />
                            </motion.div>
                        ))}
                    </SimpleGrid>
                </motion.div>
            </Container>
          <Paper p="md" radius="md" withBorder>
            <LoadingOverlay visible={loading} overlayBlur={2} />

            <TextInput
              placeholder="Add input here"
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              mb="md"
              size="lg"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={handleSubmit}
                disabled={!input.trim() || loading}
              >
                Analyze
              </Button>
            </Box>

            {response && (
              <Paper mt="xl" p="md" withBorder>
                <Title order={3} mb="md">Analysis Result</Title>
                <Text>{response}</Text>
              </Paper>
            )}
          </Paper>
        </Container>
      </Box>
    );
  }
} 