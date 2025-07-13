import type { BlogPostSummary, BlogPostFull } from '@/types/blog';

// Detect server-side environment and set appropriate API base URL
const isServer = typeof window === 'undefined';
const API_BASE_URL = isServer 
  ? (process.env.API_BASE_URL || 'http://localhost:3001/api')
  : '/api';

export async function fetchBlogList(): Promise<BlogPostSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/content/posts`, {
      credentials: 'include', // Include cookies if needed
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.data; // Return just the posts array from the response
  } catch (error) {
    console.error('Error fetching blog list:', error);
    return []; // Return empty array on error
  }
}

export const fetchBlogPost = async (identifier: string): Promise<BlogPostFull | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/posts/${identifier}`, {
      credentials: 'include', // Include cookies if needed
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Post not found or failed to fetch");
    }
    const data: BlogPostFull = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
};

export const fetchLatestBlog = async (): Promise<BlogPostSummary | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/content/posts?limit=1&sort_by=created_at&order=desc`, {
      credentials: 'include', // Include cookies if needed
    });
    
    if (!response.ok) throw new Error("Failed to fetch latest blog post");

    const result = await response.json();
    const latestBlog = result.data && result.data.length > 0 ? result.data[0] : null;
    
    return latestBlog;
  } catch (error) {
    console.error("Error fetching latest blog post:", error);
    return null;
  }
};

interface Author {
  id: string;
  name: string;
  email: string;
}

export const fetchAuthorDetails = async (authorIdUuid: string): Promise<Author | null> => {
  if (!authorIdUuid) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/content/authors/${authorIdUuid}`, {
      credentials: 'include', // Include cookies if needed
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Author not found or failed to fetch");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching author details:", error);
    return null;
  }
};