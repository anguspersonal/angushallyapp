export type ProjectStatus = 'in-progress' | 'done' | 'archived';

export interface ProjectItem {
  id: number;
  name: string;
  desc: string;
  route: string;
  tags: string[];
  created_at: string;
  status: ProjectStatus;
  gated?: boolean;
}

export const projectList: ProjectItem[] = [
  {
    id: 0,
    name: 'Data Value Game',
    desc: "Test your knowledge of data's worth across industries in this interactive game, based on Anmut Consulting research.",
    route: '/projects/data-value-game',
    tags: ['data', 'game', 'education'],
    created_at: '2024-10-01',
    status: 'done',
  },
  {
    id: 1,
    name: 'Eat Safe UK',
    desc: 'Check UK food hygiene ratings on an interactive map using official Food Standards Agency data. Archived: Google Maps API no longer active.',
    route: '/projects/eat-safe-uk',
    tags: ['food', 'map', 'data'],
    created_at: '2025-01-03',
    status: 'archived',
  },
  {
    id: 2,
    name: 'Blog',
    desc: 'Personal blog covering topics in strategy, software development, data, and continuous learning through projects.',
    route: '/blog',
    tags: ['writing', 'tech', 'learning'],
    created_at: '2025-01-01',
    status: 'in-progress',
  },
  {
    id: 3,
    name: 'Strava Activity Dashboard',
    desc: 'Visualizing personal Strava data using its API to track fitness activities and monitor progress over time.',
    route: '/projects/strava',
    tags: ['fitness', 'data', 'visualization'],
    created_at: '2025-02-09',
    status: 'done',
  },
  {
    id: 4,
    name: 'Habit Tracker App',
    desc: 'A simple application designed to help build positive routines and track daily habit streaks effectively.',
    route: '/projects/habit',
    tags: ['productivity', 'habit'],
    created_at: '2025-02-23',
    status: 'archived',
  },
  {
    id: 5,
    name: 'AI Text Analysis',
    desc: "Experimental project using OpenAI's GPT model to analyze text input and provide structured insights.",
    route: '/projects/ai/text-analysis',
    tags: ['ai', 'nlp', 'data'],
    created_at: '2025-05-19',
    status: 'done',
    gated: true,
  },
  {
    id: 6,
    name: 'Instapaper',
    desc: "Experimental project using OpenAI's GPT model to analyse inputs from Instapaper.",
    route: '/projects/ai/instapaper',
    tags: ['ai', 'nlp', 'data'],
    created_at: '2025-05-21',
    status: 'archived',
  },
  {
    id: 7,
    name: 'Bookmarks',
    desc: 'Import and manage your bookmarks from multiple sources including Raindrop.io with automatic syncing and tag organization.',
    route: '/projects/bookmarks',
    tags: ['bookmarks', 'productivity', 'api'],
    created_at: '2025-05-22',
    status: 'archived',
  },
  {
    id: 8,
    name: 'Timeline',
    desc: 'The full personal timeline. Life, career, and key moments, gathered in one place. Sign-in required.',
    route: '/projects/timeline',
    tags: ['personal', 'story'],
    created_at: '2026-04-19',
    status: 'in-progress',
    gated: true,
  },
];

export default projectList;
