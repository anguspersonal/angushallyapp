// API Client Types

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

export class ApiError extends Error {
  public readonly name = 'ApiError';
  
  constructor(
    message: string,
    public readonly status: number,
    public readonly data: any = null
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ApiClientInterface {
  get: <T = any>(endpoint: string, options?: Omit<ApiClientOptions, 'method'>) => Promise<T>;
  post: <T = any>(endpoint: string, data?: any, options?: Omit<ApiClientOptions, 'method' | 'body'>) => Promise<T>;
  put: <T = any>(endpoint: string, data?: any, options?: Omit<ApiClientOptions, 'method' | 'body'>) => Promise<T>;
  delete: <T = any>(endpoint: string, options?: Omit<ApiClientOptions, 'method'>) => Promise<T>;
  isAuthenticated: () => Promise<boolean>;
  ApiError: typeof ApiError;
}

// Environment Configuration Types
export interface EnvironmentConfig {
  NODE_ENV: string;
  REACT_APP_API_BASE_URL?: string;
  REACT_APP_GOOGLE_CLIENT_ID?: string;
  REACT_APP_GOOGLE_MAPS_API_KEY?: string;
  REACT_APP_RECAPTCHA_SITE_KEY?: string;
  REACT_APP_BUILD_NUMBER?: string;
}

// API Endpoint Response Types
export interface AuthVerifyResponse {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

export interface ContactSubmissionResponse {
  message: string;
  inquiryId?: string;
}

// Habit Tracking Types
export interface HabitLogData {
  value: number;
  metric: string;
  extraData?: Record<string, any>;
}

export interface HabitLogResponse {
  message: string;
  logId: string;
  [key: string]: any;
}

export interface DrinkCatalogItem {
  id: number;
  name: string;
  default_volume_ml: number;
  default_abv: number;
  icon: string;
  drink_type: string;
  catalog_type: string;
  archived: boolean;
}

// Bookmark Types
export interface BookmarkData {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  source_type: string;
  image_url?: string;
  site_name?: string;
}

export interface BookmarkMetadata {
  autoTransfer?: boolean;
  source: string;
  totalBookmarks: number;
  transferStats?: {
    success: number;
    failed: number;
    total: number;
    enrichmentStats?: {
      enriched: number;
      failed: number;
      skipped: number;
    };
  };
}

export interface BookmarkResponse {
  bookmarks: BookmarkData[];
  _metadata?: BookmarkMetadata;
}

// Blog/Content Types
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  content_md?: string;
  author_id: string;
  author_name: string;
  cover_image?: string;
  alt_text?: string;
  attribution?: string;
  attribution_link?: string;
  tags?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}