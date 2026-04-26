import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from 'next/navigation';
import { Image, Text, Box, Anchor, Container, Title } from '@mantine/core';
import { getBlogPostDetail } from '@/lib/content/blogRepository';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import '../blog.css';
import { GlassContent } from '@/components/design/Glass';

interface PageProps {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const admin = getSupabaseAdmin();
  if (!admin) {
    notFound();
  }

  const post = await getBlogPostDetail(admin, slug);

  if (!post) {
    notFound();
  }

  return (
    <Container py="xl" className="blog-post">
      <GlassContent p="lg" mb="xl">
        <Title order={1} mb="md" c="var(--site-ink)" style={{ fontWeight: 600 }}>
          {post.title}
        </Title>

        {post.coverImage && (
          <Box mb="md">
            <Image
              src={post.coverImage}
              alt={post.altText || `Cover image for ${post.title}`}
              fit="cover"
              style={{ maxHeight: '400px', width: '100%', objectFit: 'cover', borderRadius: 12 }}
            />
            {post.attribution && (
              <Text size="sm" opacity={0.7} ta="right" mt="xs">
                {post.attributionLink ? (
                  <Anchor href={post.attributionLink} target="_blank" rel="noopener noreferrer" opacity={0.7}>
                    {post.attribution}
                  </Anchor>
                ) : (
                  post.attribution
                )}
              </Text>
            )}
          </Box>
        )}
      </GlassContent>

      <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.contentMarkdown}</ReactMarkdown>
      </div>
      
      <Box mt="xl">
        <Text size="sm" opacity={0.7}>
          <strong>Published:</strong>{' '}
          {post.publishedAt || post.createdAt
            ? new Date(post.publishedAt || post.createdAt || '').toLocaleDateString()
            : 'Unknown'}
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