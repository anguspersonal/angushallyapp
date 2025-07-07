import React from 'react';
import { Box, Container, Title, SimpleGrid } from '@mantine/core';
import { motion, Variants } from 'framer-motion';
import Header from '../components/Header';
import projectList from '../data/projectList';
import ProjectSnippet from '../components/ProjectSnippet';
import "../general.css";

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

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
};

function Projects() {
    const projects = projectList;
    // console.log('Projects.js: projects:', projects);

    return (
        <Box>
            <Header />
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
        </Box>
    );
}

export default Projects;