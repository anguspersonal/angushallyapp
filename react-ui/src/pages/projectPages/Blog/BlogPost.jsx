import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // ✅ Enables better Markdown parsing
import { fetchBlogPost } from "../../projectPages/Blog/fetchBlogData";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
        <h1>{post.title}</h1>
        <div className="markdown-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown> {/* ✅ Markdown Rendering */}
        </div>
        <p><strong>Published:</strong> {new Date(post.created_at).toLocaleDateString()}</p>
        <Link to="/blog" className="back-button">← Back to Blog</Link>
      </div>
      <Footer />
    </div>
  );
}

export default BlogPost;
