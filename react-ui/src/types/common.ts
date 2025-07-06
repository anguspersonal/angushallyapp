/**
 * Common TypeScript interfaces and types for the React UI application
 * This file contains reusable type definitions used across components and services
 */

// =============================================================================
// CORE UTILITY TYPES
// =============================================================================

export interface ApiResponse<T = any> {
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
  [key: string]: any;
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
  [key: string]: any;
}

export interface BookmarkSourceMetadata {
  instagram_analysis?: InstagramAnalysis;
  metadata_enriched?: boolean;
  [key: string]: any;
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
  onEdit?: (bookmark: Bookmark) => void;
  onDelete?: (bookmark: Bookmark) => void;
  showActions?: boolean;
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

export interface HabitStats {
  period: 'day' | 'week' | 'month' | 'year';
  total_logs: number;
  average_per_day: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  comparison_previous_period?: number;
  [key: string]: any;
}

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
// GOOGLE MAPS / EAT-SAFE-UK TYPES
// =============================================================================

export interface GoogleMapsLocation {
  lat: number;
  lng: number;
}

export interface GoogleMapsPosition {
  lat: number;
  lng: number;
}

export interface GoogleMapsAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

export interface GooglePlace {
  id: string;
  name: string;
  formattedAddress: string;
  location: GoogleMapsLocation;
  position?: GoogleMapsPosition;
  addressComponents?: GoogleMapsAddressComponent[];
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  priceLevel?: number;
  businessStatus?: string;
  photos?: string[];
  website?: string;
  phoneNumber?: string;
  openingHours?: string[];
  reviews?: GooglePlaceReview[];
}

export interface GooglePlaceReview {
  author: string;
  rating: number;
  text: string;
  time: string;
  profilePhotoUrl?: string;
}

export interface HygieneScore {
  place_id: string;
  name: string;
  address: string;
  postcode: string;
  hygiene_rating?: number;
  inspection_date?: string;
  business_type?: string;
  local_authority?: string;
  scores?: {
    hygiene?: number;
    structural?: number;
    management?: number;
  };
}

export interface NearbySearchRequest {
  location: GoogleMapsLocation;
  radius?: number;
  type?: string;
  keyword?: string;
  minPriceLevel?: number;
  maxPriceLevel?: number;
  openNow?: boolean;
}

export interface NearbySearchResponse {
  results: GooglePlace[];
  status: string;
  nextPageToken?: string;
}

// =============================================================================
// DATA VALUE GAME TYPES
// =============================================================================

export interface Industry {
  id: string;
  name: string;
  dataValue: number;
  description?: string;
  category?: string;
  year?: number;
  source?: string;
  examples?: string[];
}

export interface CardState {
  industry: Industry;
  flipped: boolean;
  disabled: boolean;
  selected: boolean;
  revealed?: boolean;
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  score: number;
  lives: number;
  cards: CardState[];
  selectedCards: string[];
  gameStatus: 'playing' | 'paused' | 'finished' | 'game_over';
  difficulty: 'easy' | 'medium' | 'hard';
  timeRemaining?: number;
  streak?: number;
  bestScore?: number;
}

export interface GameRound {
  roundNumber: number;
  cards: CardState[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
  timeToAnswer?: number;
  pointsEarned?: number;
}

export interface GameSession {
  id: string;
  user_id?: string;
  game_state: GameState;
  rounds: GameRound[];
  final_score: number;
  completion_time: number;
  difficulty: string;
  created_at: string;
  completed_at?: string;
}

// =============================================================================
// STRAVA TYPES
// =============================================================================

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  max_speed: number;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map?: {
    summary_polyline: string;
  };
  start_latlng?: [number, number];
  end_latlng?: [number, number];
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city?: string;
  state?: string;
  country?: string;
  sex?: 'M' | 'F';
  premium?: boolean;
  created_at: string;
  updated_at: string;
}

export interface StravaStats {
  recent_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_run_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  recent_ride_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
  all_ride_totals: {
    count: number;
    distance: number;
    moving_time: number;
    elapsed_time: number;
    elevation_gain: number;
  };
}

// =============================================================================
// AI TYPES
// =============================================================================

export interface AIAnalysisRequest {
  text: string;
  analysis_type: 'sentiment' | 'summary' | 'keywords' | 'instagram' | 'instapaper';
  options?: {
    max_length?: number;
    include_metadata?: boolean;
    language?: string;
  };
}

export interface AIAnalysisResponse {
  analysis_type: string;
  results: {
    sentiment?: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
      confidence: number;
    };
    summary?: {
      text: string;
      key_points: string[];
      confidence: number;
    };
    keywords?: {
      keywords: string[];
      entities: Array<{
        text: string;
        label: string;
        confidence: number;
      }>;
    };
    instagram?: InstagramAnalysis;
    instapaper?: {
      cleaned_text: string;
      metadata: {
        title?: string;
        author?: string;
        publish_date?: string;
        reading_time?: number;
      };
    };
  };
  processing_time: number;
  model_version?: string;
}

export interface InstapaperArticle {
  id: string;
  title: string;
  description?: string;
  url: string;
  progress?: number;
  progress_timestamp?: string;
  time: string;
  starred?: boolean;
  type?: string;
  hash?: string;
}

// =============================================================================
// COLLABORATION TYPES
// =============================================================================

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  testimonial: string;
  rating?: number;
  date?: string;
  project?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  description: string;
  image?: string;
  client: string;
  industry: string;
  duration: string;
  technologies: string[];
  challenges: string[];
  solutions: string[];
  results: Array<{
    metric: string;
    value: string;
    improvement?: string;
  }>;
  testimonial?: Testimonial;
  url?: string;
  status: 'completed' | 'in_progress' | 'planned';
}

export interface CollaborationTrait {
  id: string;
  name: string;
  description: string;
  icon?: string;
  examples?: string[];
  strength_level: number; // 1-10 scale
}

export interface FounderJourneyMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'achievement' | 'learning' | 'pivot' | 'launch' | 'funding';
  metrics?: Array<{
    label: string;
    value: string;
  }>;
  image?: string;
  url?: string;
}

// =============================================================================
// THEME & UI TYPES
// =============================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface CustomTheme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// =============================================================================
// UTILITY TYPES
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
// CUSTOM HOOKS TYPES
// =============================================================================

export interface UseLabeledStateReturn<T> {
  value: T;
  setValue: (value: T) => void;
  label: string;
  reset: () => void;
  isDirty: boolean;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
}

export interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
  isLoading: boolean;
}

// =============================================================================
// EXPORT HELPER TYPES
// =============================================================================

export type ComponentProps<T extends React.ComponentType<any>> = 
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