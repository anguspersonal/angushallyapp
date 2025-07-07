/**
 * Blog-related TypeScript interfaces and types
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content_md?: string;
  excerpt?: string;
  cover_image?: string;
  alt_text?: string;
  attribution?: string;
  attribution_link?: string;
  created_at?: string;
}

export interface BlogPostSummary extends Omit<BlogPost, 'content_md'> {
  excerpt: string;
}

export interface BlogPostFull extends BlogPost {
  content_md: string;
  created_at: string;
} 