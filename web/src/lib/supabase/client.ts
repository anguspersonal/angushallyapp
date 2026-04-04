import { createBrowserClient } from '@supabase/ssr';

let cached: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Browser-side Supabase client (singleton).
 * Uses the public publishable/anon key — RLS policies govern access.
 */
export function getSupabaseBrowserClient() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  cached = createBrowserClient(url, key);
  return cached;
}
