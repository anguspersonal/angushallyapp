import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Box, Container, Title, SimpleGrid, Anchor } from '@mantine/core';
import { motion, Variants } from 'framer-motion';
import { fetchBlogList } from "./blog/fetchBlogData";
import "../index.css";
import BlogSnippet from "./blog/components/BlogSnippet";
import Header from "../components/Header";
import "../general.css";
import './blog/blog.css';
import { BlogPostSummary } from "../types/blog";

// Animation variants (can reuse from Projects)
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

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 }
    }
};

function Blog() {
    const [posts, setPosts] = useState<BlogPostSummary[]>([]);

    useEffect(() => {
        async function fetchData() {
            const blogs = await fetchBlogList();
            setPosts(blogs);
        }
        fetchData();
    }, []);

    return (
        <Box>
            <Header />
            <Container py="xl">
                <Title order={1} ta="center" mb="xl">Blog</Title>
                
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <SimpleGrid
                        cols={{ base: 1, sm: 2, md: 3 }} // Responsive columns
                        spacing="lg"
                    >
                        {posts.map((post) => (
                            <motion.div key={post.id} variants={itemVariants}>
                                <Anchor 
                                    component={Link} 
                                    to={`/blog/${post.slug}`} 
                                    underline="never"
                                >
                                    <BlogSnippet post={post} />
                                </Anchor>
                            </motion.div>
                        ))}
                    </SimpleGrid>
                </motion.div>
            </Container>
        </Box>
    );
}

export default Blog;
