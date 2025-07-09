import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { theme } from './theme';
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/blog/BlogPost';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Collab from './pages/Collab';
import { AuthProvider } from './contexts/AuthContext';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider theme={theme}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/collab" element={<Collab />} />
        </Routes>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App; 