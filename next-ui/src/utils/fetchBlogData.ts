interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  created_at: string;
}

interface BlogListResponse {
  data: BlogPost[];
}

export async function fetchBlogList(): Promise<BlogPost[]> {
  try {
    const response = await fetch('/api/content/posts');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: BlogListResponse = await response.json();
    return result.data; // Return just the posts array from the response
  } catch (error) {
    console.error('Error fetching blog list:', error);
    return []; // Return empty array on error
  }
}

export const fetchBlogPost = async (identifier: string): Promise<BlogPost | null> => {
  try {
    const response = await fetch(`/api/content/posts/${identifier}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Post not found or failed to fetch");
    }
    const data: BlogPost = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
};

export const fetchLatestBlog = async (): Promise<BlogPost | null> => {
  try {
    const response = await fetch("/api/content/posts?limit=1&sort_by=created_at&order=desc");
    
    if (!response.ok) throw new Error("Failed to fetch latest blog post");

    const result: BlogListResponse = await response.json();
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
    const response = await fetch(`/api/content/authors/${authorIdUuid}`);
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