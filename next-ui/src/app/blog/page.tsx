'use client';

import React from "react";
import Link from "next/link";
import { Container, Title, SimpleGrid, Anchor, Loader, Alert } from '@mantine/core';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import BlogSnippet from '../../components/blog/BlogSnippet';
import { usePosts } from '@/services/content/hooks';

// Animation variants
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

export default function Blog() {
    const { data: posts, isLoading, error } = usePosts({ sortBy: 'createdAt', order: 'desc' });

    return (
        <Container py="xl">
            <Title order={1} ta="center" mb="xl">Blog</Title>
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {isLoading && (
                    <Loader size="sm" />
                )}

                {error && (
                    <Alert color="red" title="Error loading posts" mt="md">
                        {error}
                    </Alert>
                )}

                <SimpleGrid
                    cols={{ base: 1, sm: 2, md: 3 }}
                    spacing="lg"
                >
                    {posts.map((post) => (
                        <motion.div key={post.id} variants={itemVariants}>
                            <Anchor
                                component={Link} 
                                href={`/blog/${post.slug}`}
                                underline="never"
                            >
                                <BlogSnippet post={post} />
                            </Anchor>
                        </motion.div>
                    ))}
                </SimpleGrid>
            </motion.div>
        </Container>
    );
} 