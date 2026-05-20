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

  /**
   * Phase 0 enrichments for the macOS desktop redesign of /projects.
   * See docs/projects-mac-desktop-plan.md.
   */

  /** One-line explanation shown in archived project windows. Required for archived. */
  archivedReason?: string;

  /** Long-form write-up shown in any project window (rich, write-up-only, or archived). ~80-200 words. */
  writeUp?: string;

  /** Tech stack chips shown in the rich window sidebar. Draft values, refine before launch. */
  builtWith?: string[];

  /** Path under /public for the hero screenshot rendered in the rich window. */
  screenshot?: string;
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
    builtWith: ['React', 'TypeScript', 'Mantine', 'Framer Motion'],
    writeUp: `We know data is valuable. But how valuable — in pounds and pence?

Getting that answer right matters. Organisations spend vast sums collecting, maintaining, and acting on data they've never priced. Researchers at Anmut Strategy — a UK consultancy specialising in data valuation — produced a sector-by-sector report on the value of data held across the [FTSE-100](https://www.londonstockexchange.com/indices/ftse-100/constituents/table). The numbers are striking, and counter-intuitive enough that most people guess wrong.

To bring the research to life, a colleague suggested we wrap it in the format of [*Play Your Cards Right*](https://en.wikipedia.org/wiki/Play_Your_Cards_Right) — the old British game show where you bet whether the next card is higher or lower. This game is the result. You're shown two FTSE sectors and asked which holds the more valuable data. Right answer, your stake compounds. Wrong answer, you start over.

The takeaway: data value rarely lives where you'd expect.`,
    screenshot: '/data_value_game_screenshot.png',
  },
  {
    id: 1,
    name: 'Eat Safe UK',
    desc: 'Check UK food hygiene ratings on an interactive map using official Food Standards Agency data. Archived: Google Maps API no longer active.',
    route: '/projects/eat-safe-uk',
    tags: ['food', 'map', 'data'],
    created_at: '2025-01-03',
    status: 'archived',
    archivedReason:
      'Google Maps API access ended; this map view depended on it. The FSA data layer still works but without the map it lost its job.',
    writeUp: `Someone close to me has to be careful about where they eat — they routinely check restaurants against Food Standards Agency hygiene ratings before deciding. The FSA data is excellent and free. The experience of using it isn't: you spot a restaurant on Maps, switch tabs, type the name into the FSA site, scan the result, then switch back. Multiply that by five candidate places, on a phone, while a group is hungry, and the whole thing falls apart.

Eat Safe UK pulled the FSA's hygiene data straight onto the map, so the rating sat next to each restaurant like another review. One screen, one tap.

Switched off when Google Maps API pricing made the personal use-case uneconomical to keep running. The data layer still works; the map view is what disappeared.`,
  },
  {
    id: 2,
    name: 'Blog',
    desc: 'Personal blog covering topics in strategy, software development, data, and continuous learning through projects.',
    route: '/blog',
    tags: ['writing', 'tech', 'learning'],
    created_at: '2025-01-01',
    status: 'in-progress',
    // Note: cut from the macOS desktop dock per design plan — Blog is a site-nav
    // destination, not a project. Lives in the OS menu bar instead.
  },
  {
    id: 3,
    name: 'Strava Activity Dashboard',
    desc: 'Visualizing personal Strava data using its API to track fitness activities and monitor progress over time.',
    route: '/projects/strava',
    tags: ['fitness', 'data', 'visualization'],
    created_at: '2025-02-09',
    status: 'done',
    builtWith: ['Next.js', 'Strava API', 'TypeScript', 'Mantine', 'Recharts'],
    writeUp: `Small one. I wanted to see my Strava progress *my* way — not as their feed of activities, but as a single dashboard of how the numbers move over time.

It pulls my activity data through the Strava API and charts the key metrics I actually care about. Built to scratch my own itch, and to learn the OAuth dance along the way.

"Done" here means it does its job. If I get curious about a new metric, I'll add it. Otherwise it keeps quietly running in the background — which, honestly, is the point.`,
    // No screenshot — gated/dashboard, presented as write-up-only window.
  },
  {
    id: 4,
    name: 'Habit Tracker App',
    desc: 'A daily habit tracker. Exactly what it sounds like.',
    route: '/projects/habit',
    tags: ['productivity', 'habit'],
    created_at: '2025-02-23',
    status: 'archived',
    archivedReason:
      'Built to learn the habit-loop pattern. Replaced by paper systems I now run outside an app.',
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
    builtWith: ['Next.js', 'OpenAI API', 'TypeScript', 'Supabase auth'],
    writeUp: `This one's a time capsule.

I built it just after finishing my web development course, when ChatGPT had only just landed and "calling an LLM from your own app" still felt like the future. The whole project was a single question: could I wire up an API call, structure the prompt, and get something useful back? Turns out yes — but at the time, "yes" felt like a milestone.

It's gated to keep my OpenAI bill bounded — otherwise random visitors would burn through credits in an afternoon.

The takeaway, mostly for me: the bar for "what's hard in software" moves fast.`,
    // No screenshot — gated experiment, presented as write-up-only window.
  },
  {
    id: 6,
    name: 'Instapaper',
    desc: 'Ingests saved articles from the Instapaper API and analyses them with GPT.',
    route: '/projects/ai/instapaper',
    tags: ['ai', 'nlp', 'data'],
    created_at: '2025-05-21',
    status: 'archived',
    archivedReason:
      'OpenAI cost-per-call made the personal use-case uneconomical. Useful as a research spike.',
  },
  {
    id: 7,
    name: 'Bookmarks',
    desc: 'AI auto-tagging for bookmarks, synced from Raindrop.io.',
    route: '/projects/bookmarks',
    tags: ['bookmarks', 'productivity', 'api'],
    created_at: '2025-05-22',
    status: 'archived',
    archivedReason:
      "Raindrop's own search and tagging caught up with what this added; it stopped earning its keep.",
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
    builtWith: ['Next.js', 'Supabase', 'TypeScript', 'Framer Motion'],
    writeUp: `Life is short. I want to capture my one shot at it.

I'm not big on social media — it tends to beautify life rather than tell it. This timeline is the opposite: the moments, decisions, and turning points that actually shaped the path I'm on, gathered in one place. Less a portfolio, more an exercise in gratitude.

It's gated because some of what's here is personal — friends, family, the quiet things that don't belong on a public feed.

If you'd like one for yourself — or for someone you love — get in touch.`,
    screenshot: '/timeline_screenshot.png',
  },
];

export default projectList;
