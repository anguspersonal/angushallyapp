import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchBlogList } from "./projectPages/Blog/fetchBlogData";
import "../index.css";
import BlogSnippet from "./projectPages/Blog/BlogSnippet";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const blogs = await fetchBlogList();
      setPosts(blogs);
    }
    fetchData();
  }, []);

  return (
    <div className="Page">
      <Header />
      <h1>Blog</h1>
      <div className="grid-container">
        {posts.map((post) => (
          <Link key={post.id} to={`/blog/${post.slug}`} className="blog-link">
            <BlogSnippet post={post} />
          </Link>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default Blog;
