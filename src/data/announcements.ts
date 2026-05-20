/**
 * Announcements — static placeholder data for the /announcements stub.
 *
 * See issue #63 (https://github.com/anguspersonal/angushallyapp/issues/63).
 * These entries are obvious placeholders to give the surface shape while
 * the visual design is iterated on. They will be replaced with real
 * announcements in a follow-up PR. Do NOT plumb this into the blog
 * pipeline — announcements are a deliberately separate surface.
 */

export type Announcement = {
  /** Stable slug. Currently unused (no detail page yet) but reserved. */
  slug: string;
  /** Headline shown in the list. */
  title: string;
  /** Short body — 1–3 sentences for the stub. */
  body: string;
  /** ISO date (YYYY-MM-DD). Used for the dateline; ordered desc on render. */
  date: string;
  /** Optional short label shown above the title (e.g. "Site", "Project"). */
  category?: string;
};

export const announcements: Announcement[] = [
  {
    slug: 'placeholder-launch-notes',
    title: 'Placeholder: launch notes for the announcements surface',
    body:
      'This is a placeholder announcement. The /announcements page is a stub being iterated on — copy, layout, and content shape are all subject to change.',
    date: '2026-05-14',
    category: 'Site',
  },
  {
    slug: 'placeholder-blog-redesign',
    title: 'Placeholder: editorial blog redesign now live',
    body:
      'This is a placeholder announcement. Real content will land in a later PR; for now this entry exists so the list page has something to render.',
    date: '2026-05-02',
    category: 'Project',
  },
  {
    slug: 'placeholder-image-pipeline',
    title: 'Placeholder: image pipeline performance work',
    body:
      'This is a placeholder announcement. The text here is filler and is not describing anything actually shipped under this slug.',
    date: '2026-04-22',
    category: 'Engineering',
  },
  {
    slug: 'placeholder-branching-policy',
    title: 'Placeholder: branching policy and CI gate',
    body:
      'This is a placeholder announcement. Final wording will replace this when the surface has had a visual pass.',
    date: '2026-04-10',
    category: 'Process',
  },
  {
    slug: 'placeholder-misc-housekeeping',
    title: 'Placeholder: housekeeping and dependency hygiene',
    body:
      'This is a placeholder announcement. Treat all five entries as filler — the design intent is to have a small handful of dated items visible.',
    date: '2026-04-03',
    category: 'Site',
  },
];
