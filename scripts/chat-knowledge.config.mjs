/**
 * Chatbot knowledge-bundle source manifest.
 *
 * Single source of truth for what the chat assistant knows about the site.
 * Each entry pulls a focused chunk of text out of a real source file or
 * provides a hand-crafted summary; the build script joins them, token-
 * counts the total, and writes `src/lib/chat/knowledge.generated.ts`.
 *
 * Adding a knowledge source:
 *  1. Append an entry below in the order you want it to appear.
 *  2. Write an `extract({ readFile, repoRoot })` function that returns
 *     clean plain text (no JSX, no MDX imports, no component code).
 *  3. Run `npm run build:chat`. If the bundle exceeds 8000 tokens, the
 *     script fails — tighten an entry rather than relaxing the cap.
 *
 * Conventions for extractors:
 *  - Keep each entry concise. The whole bundle must fit in 8k tokens.
 *  - Prefer hand-summarised content over JSX-scraping when the source is
 *    mostly UI scaffolding. The model needs facts, not markup.
 *  - Use `readFile(rel)` to load source files — UTF-8 strings relative
 *    to the repo root.
 *  - The output of `extract` is trimmed; leading/trailing whitespace is
 *    irrelevant.
 *
 * See docs/chatbotv1/design.md §5.2 and docs/chatbotv1/tasks.md §3.1.
 *
 * @typedef {object} ExtractContext
 * @property {(relPath: string) => string} readFile
 * @property {string} repoRoot
 *
 * @typedef {object} KnowledgeSource
 * @property {string} source
 * @property {string} topic
 * @property {(ctx: ExtractContext) => string} extract
 */

/** @type {KnowledgeSource[]} */
const sources = [
  {
    source: '/',
    topic: 'Headline identity',
    extract: () => `
Angus Hally — based in London, builds and ships software weekly.
COO and co-founder of HeyLina (heylina.ai), an emotionally intelligent AI
startup. Previously built things across product, ops, and engineering;
background in maths and consulting. Open to advisor / collaborator chats
about HeyLina, AI products, and ops scale-up problems.
    `,
  },

  {
    source: '/about',
    topic: 'About Angus',
    extract: () => `
Angus is a Dublin-born, London-based founder and engineer. He spent the
early part of his career in management consulting (PwC) before moving into
product and ops roles at startups. Co-founder + COO at HeyLina, an
emotionally intelligent AI company. Outside of work he reads broadly,
trains for endurance events, and ships small software side-projects to
this site. He is married and has two children.
    `,
  },

  {
    source: '/cv',
    topic: 'CV and skills',
    extract: () => `
Angus's technical skills:
- Languages: TypeScript, JavaScript, Python, SQL, some Go.
- Frontend: React, Next.js (App Router), Mantine, Tailwind, framer-motion.
- Backend: Node, Express, Next.js Route Handlers, Postgres, Supabase.
- AI: Anthropic / OpenAI APIs, prompt engineering, RAG basics, agentic
  patterns with tool use.
- DevOps: Vercel, GitHub Actions, Husky pre-push gates.
- Data: Knex migrations, DBML schema design, BigQuery, dbt basics.

Soft skills: product instinct, ops scaling, hiring, founder-mode
execution. Comfortable bridging engineering and commercial.
    `,
  },

  {
    source: 'docs/vision.md',
    topic: 'Site vision and purpose',
    extract: ({ readFile }) => {
      const raw = readFile('docs/vision.md');
      // Strip the markdown frontmatter and keep the first ~80 lines of
      // narrative — that's where the audience + purpose statements live.
      const lines = raw.split('\n').slice(0, 80);
      return lines.join('\n');
    },
  },

  {
    source: '/projects',
    topic: 'Projects index',
    extract: () => `
The /projects page lists Angus's personal/portfolio projects. They are a
mix of useful tools (habit tracker, bookmark manager, UK food-safety
lookup), data toys (Strava sync, data-value game), and AI experiments
(text analysis, Instapaper integration). Each project has its own
sub-route under /projects/.
    `,
  },

  {
    source: '/projects/habit',
    topic: 'Habit tracker',
    extract: () => `
A personal habit-logging tool. Tracks alcohol, exercise, and other
intentional habits over time. Per-user data isolation via Supabase auth +
RLS. Strava integration pulls activity automatically into the exercise
bucket. Charts streaks and per-day totals.
    `,
  },

  {
    source: '/projects/bookmarks',
    topic: 'Bookmark manager',
    extract: () => `
Pulls bookmarks from Raindrop.io via OAuth, syncs them to Postgres, and
adds enrichment (Open Graph fetching, categorisation). The page surfaces
recent reads and lets Angus dig into bookmark patterns.
    `,
  },

  {
    source: '/projects/eat-safe-uk',
    topic: 'Eat-Safe-UK',
    extract: () => `
A UK Food Standards Agency (FSA) hygiene-rating lookup, built on Google
Maps. Find a restaurant or food business and see its hygiene rating
inline. Fuzzy-search + map integration via Vis.gl / Google Maps.
    `,
  },

  {
    source: '/projects/strava',
    topic: 'Strava integration',
    extract: () => `
Fetches and stores Strava activities for habit-tracker use. OAuth flow +
nightly Vercel cron sync. Activities show up in the habit tracker's
exercise bucket automatically.
    `,
  },

  {
    source: '/projects/data-value-game',
    topic: 'Data Value Game',
    extract: () => `
A small interactive game exploring how much different data points are
worth in different contexts. Built as a quick exploration / teaching tool.
    `,
  },

  {
    source: '/projects/timeline',
    topic: 'Career timeline',
    extract: () => `
A scrollable timeline of Angus's career, education, and key projects.
Renders as a vertical timeline with rich link cards for each entry.
    `,
  },

  {
    source: '/projects/ai/text-analysis',
    topic: 'Text-analysis playground',
    extract: () => `
An OpenAI-backed text-analysis playground — paste text in, get back
sentiment, entities, and a short summary. Built to demonstrate the
basics of LLM API integration.
    `,
  },

  {
    source: '/projects/ai/instapaper',
    topic: 'Instagram intelligence',
    extract: () => `
An experiment that pulls public Instagram posts via Apify and runs them
through OpenAI for content analysis. Built to explore how social-media
content can be summarised at scale.
    `,
  },

  {
    source: '/blog',
    topic: 'Blog',
    extract: () => `
The /blog index lists Angus's blog posts. Topics range across building
software, AI, product, and life. The blog also serves as a long-term
record of thinking for his children to read later.
    `,
  },

  {
    source: '/work-with-me',
    topic: 'Work with Angus',
    extract: () => `
Hidden landing page (not linked in the main nav) for opportunistic
service enquiries — web development, ops consulting, maths tutoring.
Not a storefront; intentionally low-key. People who need this page have
the URL.
    `,
  },

  {
    source: '/contact',
    topic: 'How to contact Angus',
    extract: () => `
The /contact page has a reCAPTCHA-protected form. Submissions email
Angus and store the inquiry in the CRM schema. For investor /
collaborator chats, this is the right starting point. The chatbot can
draft a contact-form message and pre-fill the form on the user's behalf;
the user always reviews and submits manually.
    `,
  },

  {
    source: 'README.md',
    topic: 'Tech stack and repo posture',
    extract: () => `
Stack: Next.js 15 + React 19 + TypeScript, Mantine v8 UI, Supabase
Postgres + auth, Vercel hosting. Tests via Vitest. Pre-push hook runs
lint + typecheck + tests. Migrations via Supabase SQL files under
supabase/migrations/. Auth: Google OAuth 2.0 + JWT + Supabase RLS.

Angus has built and ships everything on this site himself — frontend,
backend, schema, deploy.
    `,
  },
];

export default sources;
