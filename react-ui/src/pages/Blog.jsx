import React, { useState, useEffect } from 'react';
import '../index.css';

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
      <ul>
        {posts.map((post, index) => (
          <li key={index}>{post.title}</li> // Assuming posts have a title field
        ))}
      </ul>
    </div>
  );
}

export default Blog;