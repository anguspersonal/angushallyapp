/**
 * Content/blog domain types for Route Handlers, repositories, and client hooks.
 */

import type { PaginationMeta } from '../contracts/pagination';

export interface ContentListParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'id';
  order?: 'asc' | 'desc';
}

export interface ContentPostSummary {
  id: string | number;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  altText?: string | null;
  attribution?: string | null;
  attributionLink?: string | null;
  authorName?: string | null;
  authorId?: string | number | null;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export interface ContentPostDetail extends ContentPostSummary {
  contentMarkdown: string;
}

export interface ContentListResult {
  items: ContentPostSummary[];
  pagination: PaginationMeta;
}
