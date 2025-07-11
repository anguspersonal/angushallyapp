'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Image, Text, Box, Anchor, Container, Title, Loader, Center } from '@mantine/core';
import { fetchBlogPost } from '../../../utils/fetchBlogData';
import type { BlogPostFull } from '@/types/blog';
import '../blog.css';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPost({ params }: BlogPostPageProps) {
  // Unwrap params using React.use for Next.js 15+
  const { slug } = React.use(params);
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!slug) {
        setLoading(false);
        return;
      }
      const postData = await fetchBlogPost(slug);
      setPost(postData);
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <Container py="xl">
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container py="xl">
        <Center>
          <Text size="lg" opacity={0.7}>Post not found.</Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container py="xl">
      <Title order={1} mb="xl">{post.title}</Title>
      
      {post.cover_image && (
        <Box mb="xl">
          <Image
            src={post.cover_image}
            alt={post.alt_text || `Cover image for ${post.title}`}
            fit="cover"
            style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
          />
          {post.attribution && (
            <Text size="sm" opacity={0.7} ta="right" mt="xs">
              {post.attribution_link ? (
                <Anchor href={post.attribution_link} target="_blank" rel="noopener noreferrer" opacity={0.7}>
                  {post.attribution}
                </Anchor>
              ) : (
                post.attribution
              )}
            </Text>
          )}
        </Box>
      )}
      
      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
      </div>
      
      <Box mt="xl">
        <Text size="sm" opacity={0.7}>
          <strong>Published:</strong> {new Date(post.created_at).toLocaleDateString()}
        </Text>
      </Box>
      
      <Box mt="md">
        <Anchor component={Link} href="/blog">
          ← Back to Blog
        </Anchor>
      </Box>
    </Container>
  );
} 