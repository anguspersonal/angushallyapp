/**
 * Common TypeScript interfaces and types for the Next.js application
 * This file contains reusable type definitions used across components and services
 */

import type { HabitStats as HabitStatsContract } from '@shared/services/habit/contracts';

// =============================================================================
// CORE UTILITY TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BaseEntity {
  id: string | number;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// BOOKMARK TYPES
// =============================================================================

export type BookmarkSourceType = 'raindrop' | 'manual' | 'instapaper' | 'readwise';

export interface BookmarkMetadata {
  readingTime?: number;
  wordCount?: number;
  author?: string;
  publishedDate?: string;
  [key: string]: unknown;
}

export interface InstagramAnalysis {
  likes?: number;
  comments?: number;
  engagement_rate?: number;
  hashtags?: string[];
  mentions?: string[];
  media_type?: 'Post' | 'Reel' | 'IGTV';
  caption?: string;
  location?: string;
  [key: string]: unknown;
}

export interface BookmarkSourceMetadata {
  instagram_analysis?: InstagramAnalysis;
  metadata_enriched?: boolean;
  [key: string]: unknown;
}

export interface Bookmark extends BaseEntity {
  title: string;
  description?: string;
  url: string;
  image_url?: string;
  favicon_url?: string;
  site_name?: string;
  tags?: string[];
  source_type: BookmarkSourceType;
  source_metadata?: BookmarkSourceMetadata;
  metadata?: BookmarkMetadata;
  intelligence_level?: number;
  folder_id?: string;
  is_favorite?: boolean;
  reading_progress?: number;
  enriched?: boolean;
}

export interface BookmarkCardProps {
  bookmark: Bookmark;
  onInstagramAnalysisClick?: (bookmark: Bookmark) => void;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  bookmark_count?: number;
  parent_id?: string;
  created_at: string;
}

// =============================================================================
// BOOKMARK API RESPONSE TYPES
// =============================================================================

export interface BookmarkTransferStats {
  success: number;
  enrichmentStats: {
    enriched: number;
  };
}

export interface BookmarkApiMetadata {
  autoTransfer?: boolean;
  transferStats?: BookmarkTransferStats;
}

export interface BookmarkApiResponse {
  bookmarks: Bookmark[];
  _metadata?: BookmarkApiMetadata;
}

export interface InstagramAnalysisHistoryItem {
  instagram_url: string;
  analysis_result: string;
  metadata: string;
}

export interface InstagramAnalysisHistoryResponse {
  success: boolean;
  data: {
    history: InstagramAnalysisHistoryItem[];
  };
}

// =============================================================================
// INSTAGRAM INTELLIGENCE TYPES
// =============================================================================

export interface InstagramBookmark extends Bookmark {
  has_instagram_analysis?: boolean;
}

export interface InstagramAnalysisData {
  analysis: {
    rawResponse: string;
    [key: string]: unknown;
  };
  metadata: {
    url: string;
    mediaType?: string;
    timestamp?: string;
    engagement?: {
      likes?: number;
      comments?: number;
      views?: number;
      shares?: number;
    };
    author?: {
      username?: string;
      followers?: number;
      verified?: boolean;
    };
    hashtags?: string[];
    mentions?: string[];
    [key: string]: unknown;
  };
}

export interface BookmarkData {
  id: string;
  title: string;
  url: string;
  description?: string | undefined;
  [key: string]: unknown;
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface FormError {
  field: string;
  message: string;
  code?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ComponentProps<T extends React.ComponentType<unknown>> = 
  T extends React.ComponentType<infer P> ? P : never;

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {}; 

// =============================================================================
// HABIT TRACKER TYPES
// =============================================================================

export type HabitType = 'alcohol' | 'exercise' | 'sleep' | 'water' | 'meditation' | 'reading' | 'custom';

export interface HabitLogBase extends BaseEntity {
  habit_type: HabitType;
  user_id?: string;
  notes?: string;
  mood?: number; // 1-10 scale
  weather?: string;
  location?: string;
}

export interface AlcoholHabitLog extends HabitLogBase {
  habit_type: 'alcohol';
  drink_name: string;
  drink_type: string;
  units: number;
  abv?: number;
  volume_ml?: number;
  cost?: number;
  venue?: string;
  social_context?: string;
}

export interface ExerciseHabitLog extends HabitLogBase {
  habit_type: 'exercise';
  exercise_type: string;
  duration_minutes: number;
  intensity?: number; // 1-10 scale
  calories_burned?: number;
  distance?: number;
  repetitions?: number;
  weight?: number;
}

export interface SleepHabitLog extends HabitLogBase {
  habit_type: 'sleep';
  bedtime: string;
  wake_time: string;
  duration_hours: number;
  quality?: number; // 1-10 scale
  sleep_efficiency?: number;
  wake_up_count?: number;
}

export type HabitLog = AlcoholHabitLog | ExerciseHabitLog | SleepHabitLog;

export interface DrinkCatalogItem {
  id: string;
  name: string;
  type: string;
  abv: number;
  typical_volume_ml: number;
  units_per_serving: number;
  category: string;
  brand?: string;
  description?: string;
  icon?: string;
  drink_type?: string;
  archived?: boolean;
  catalog_type?: string;
}

export type HabitStats = HabitStatsContract;

export interface HabitAggregateData {
  habit_type: HabitType;
  stats: HabitStats;
  recent_logs: HabitLog[];
  goals?: {
    target_value: number;
    current_value: number;
    unit: string;
    achieved: boolean;
  };
}

// =============================================================================
// STRAVA TYPES
// =============================================================================

export interface StravaActivity {
  id: number;
  name: string;
  sport_type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  start_date: string;
  start_date_local: string;
  activity_date?: string;
  source_specific_id?: string;
  user_id?: string;
}

export interface StravaPR {
  name: string;
  distanceVal: number;
  maxSpeed: number | null;
}

export interface WeeklyRunData {
  preciseDate: string;
  displayDate: string;
  totalDistance: number;
  maxDistance: number;
  totalElevation: number;
  totalMovingTime: number;
  speedSum: number;
  maxSpeed: number;
  runCount: number;
  avgDistance: number;
  avgSpeed: number;
  avgPace: number;
}

export interface StravaDashboardData {
  activities: StravaActivity[];
  prs: StravaPR[];
  weeklyRuns: WeeklyRunData[];
  recentRuns: StravaActivity[];
}