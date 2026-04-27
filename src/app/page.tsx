import HomePageClient from './HomePageClient';
import { fetchOpenGraph, type OpenGraphData } from '@/lib/og-fetch';

const HEYLINA_OG_URL = 'https://heylina.ai';

export default async function Home() {
  let og: OpenGraphData | null = null;
  try {
    og = await fetchOpenGraph(HEYLINA_OG_URL);
  } catch {
    og = null;
  }

  return <HomePageClient og={og} />;
}
