import type { SetAllCookies } from '@supabase/ssr';

/** Batch argument for Supabase SSR `cookies.setAll`. */
export type SupabaseCookiesToSet = Parameters<SetAllCookies>[0];
