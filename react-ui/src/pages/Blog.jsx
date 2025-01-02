import React, { useState, useEffect } from 'react';
import '../index.css';
import BlogSnippet from '../components/BlogSnippet';

function Blog(props) {
  const [message, setMessage] = useState(props.message);
  const [isFetching, setIsFetching] = useState(props.isFetching);
  const [posts, setPosts] = useState([]);

  console.log('Blog.js: message:', message);

  useEffect(() => {
    fetch('/api/db/posts')
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className='Page'>
      <h1>Blog</h1>
      <div class="grid-container">
        {posts.map((post, index) => (
          <BlogSnippet key={index} post={post}/>
        ))}
      
      </div>
    </div>
  );
}

export default Blog;