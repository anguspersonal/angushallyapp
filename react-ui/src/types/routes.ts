// Route and Page Types

import { ReactNode } from 'react';
import { BlogPost, BookmarkData } from './api';

// Define User interface locally to avoid circular dependency
interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  token: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

// Route Configuration
export interface RouteConfig {
  path: string;
  element: ReactNode;
  protected?: boolean;
  exact?: boolean;
  children?: RouteConfig[];
}

// Page Component Props
export interface HomePageProps {
  user?: User | null;
}

export interface AboutPageProps {
  user?: User | null;
}

export interface ContactPageProps {
  user?: User | null;
}

export interface LoginPageProps {
  redirectTo?: string;
}

export interface ProjectsPageProps {
  user?: User | null;
}

// Blog Page Props
export interface BlogPageProps {
  user?: User | null;
}

export interface BlogPostPageProps {
  slug: string;
  user?: User | null;
}

export interface BlogPostProps {
  post: BlogPost;
  user?: User | null;
}

// Project-specific Page Props
export interface EatSafeUKPageProps {
  user?: User | null;
}

export interface DataValueGamePageProps {
  user?: User | null;
}

export interface StravaPageProps {
  user?: User | null;
}

export interface HabitPageProps {
  user?: User | null;
}

export interface AIProjectsPageProps {
  user?: User | null;
}

export interface TextAnalysisAIPageProps {
  user?: User | null;
}

export interface InstapaperPageProps {
  user?: User | null;
}

export interface BookmarksPageProps {
  user?: User | null;
}

export interface RaindropsPageProps {
  user?: User | null;
}

export interface ShareHandlerPageProps {
  user?: User | null;
}

export interface SoftwareCVPageProps {
  user?: User | null;
}

export interface CollabPageProps {
  user?: User | null;
}

// Route Parameters
export interface RouteParams {
  slug?: string;
  id?: string;
  habitType?: string;
  projectId?: string;
}

// Navigation Types
export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

export interface PageMeta {
  title: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

// Project Route Types
export interface ProjectRoute {
  id: string;
  title: string;
  description: string;
  path: string;
  icon?: ReactNode;
  image?: string;
  tags?: string[];
  featured?: boolean;
  status?: 'active' | 'beta' | 'coming-soon' | 'archived';
  external?: boolean;
  protected?: boolean;
}

// URL Sharing Types (for Share Handler)
export interface ShareData {
  url?: string;
  title?: string;
  text?: string;
}

export interface ShareHandlerState {
  shareData: ShareData | null;
  processing: boolean;
  success: boolean;
  error: string | null;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'date' | 'title' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResults<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facets?: Record<string, { value: string; count: number }[]>;
}

// Error Page Types
export interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
  statusCode?: number;
  message?: string;
}

// Location and Navigation State
export interface LocationState {
  from?: string;
  message?: string;
  data?: any;
}