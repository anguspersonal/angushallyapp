import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // ✅ Enables better Markdown parsing
import { fetchBlogPost } from "./fetchBlogData";
import Header from "../../components/Header";
import { Image, Text, Box, Anchor } from '@mantine/core';
import { BlogPostFull } from "../../types/blog";
import "./blog.css";

/**
 * BlogPost Component
 * 
 * Renders the full content of a single blog post based on the URL slug.
 * This component acts as a "Page Component" directly mapped to the '/blog/:slug' route in App.js.
 * Therefore, it resides directly within the 'pages/blog/' directory.
 * 
 * Child components specific to the blog feature (e.g., BlogSnippet) are placed
 * in the 'pages/blog/components/' subfolder for better organization.
 */
function BlogPost() {
  const { slug } = useParams();
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

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="Page">
      <Header />
      <div className="blog-post">
        <h1>{post!.title}</h1>
        {post!.cover_image && (
          <Box mb="xl">
            <Image
              src={post!.cover_image}
              alt={post!.alt_text || `Cover image for ${post!.title}`}
              fit="cover"
              style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
            />
            {post!.attribution && (
              <Text size="sm" c="dimmed" ta="right" mt="xs">
                {post!.attribution_link ? (
                  <Anchor href={post!.attribution_link} target="_blank" rel="noopener noreferrer" c="dimmed">
                    {post!.attribution}
                  </Anchor>
                ) : (
                  post!.attribution
                )}
              </Text>
            )}
          </Box>
        )}
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post!.content_md}</ReactMarkdown>
        </div>
        <p><strong>Published:</strong> {new Date(post!.created_at).toLocaleDateString()}</p>
        <Link to="/blog" className="back-button">← Back to Blog</Link>
      </div>
    </div>
  );
}

export default BlogPost;
