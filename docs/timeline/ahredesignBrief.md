# angushally.com — Redesign Brief

**For:** Claude Code
**From:** Angus Hally (worked through with Claude in chat)
**Date:** April 2026
**Status:** Ready to build. Content and structure are locked. Some personal timeline entries are stubs that Angus will fill in separately; do not block on these.

---

## 1. Context

angushally.com is Angus Hally's personal website. The site has been through an initial build and now needs a content + structure refresh alongside some design upgrades. The codebase is a React app (details to be confirmed on first run). Work should be done on a feature branch, not main.

### Who the site is for

The site serves multiple audiences simultaneously. Not one primary audience:

- **Curious investors** — want to know if Angus is credible, interesting, and engaged in HeyLina
- **Future collaborators, advisors, hires** — want to know what he's building and whether it's worth their time
- **Potential employees at HeyLina** — want to feel inspired by what's being built
- **Blog readers** — a public thinking space, but primarily a record Angus is leaving for his future children
- **Opportunistic service enquiries** — friends and network who might need web dev, consulting, or maths tutoring help; captured via hidden landing pages, not a storefront

The solution to "all audiences at once" is: **lead with identity, let visitors self-select into what they care about**. The homepage establishes who Angus is and what he's building. Other pages serve specific audiences.

### What the site should NOT be

- Not a CV. Not a freelance storefront. Not a HeyLina landing page (that's heylina.ai's job).
- Not chest-beating. Not falsely modest. Not over-polished.

### Tonal brief

Based on a "three words" exercise, the tone should feel: **conscientious, driven, joyful**. These words are not on the site; they shape every line of copy and every design choice.

Avoid: generic founder-speak, over-formality, anything that feels like marketing.

---

## 2. North star

This is the spine of the site. Everything should be testable against it.

> A person honestly documenting their one shot at life. What they're building, what they've learned, and how they think. Hope others will find it useful now, or at least, something for my kids to look back on in future.

This literal text lives on the About page (see below). It does not go on the homepage (too heavy for a landing page).

---

## 3. Site structure

### Top navigation

`Home · Projects · Blog · About · Contact`

### Footer sitemap (new)

The footer should become a proper sitemap with sections:

**Main**
Home · About · Projects · Blog · Contact

**Work with me**
Consulting · Web Development · Maths Tutoring

**Connect**
LinkedIn · GitHub · Instagram (keep current icons)

© 2026 Angus Hally

### Hidden landing pages

Not in top nav. Reachable via footer and direct URL. These are "capture pages" for when opportunities arise, not a discovery surface.

- `/work-with-me` — index page listing the three services
- `/work-with-me/consulting` — landing page for consulting enquiries
- `/work-with-me/webdev` — landing page for web dev enquiries
- `/work-with-me/maths` — landing page for maths tutoring enquiries

Copy for these pages is not yet written. Build the routes and empty page shells; Angus will provide copy later.

### Auth-gated content

Most of the site is public. Certain pages and projects require sign-in. The auth pattern should be consistent and reused.

**Currently gated:**
- AI Text Analysis project
- (others exist — confirm current list in code)

**Newly gated:**
- `/projects/timeline` — the full personal timeline (see Section 6)

**Never gated:**
- Home, Projects list, Blog list, About, Contact, all blog posts, all service landing pages

---

## 4. Homepage

### Hero (locked in)

```
Angus Hally
Building HeyLina, emotionally intelligent AI.
```

- "Angus Hally" is the large display type (name as hero).
- The subline sits immediately below, smaller weight.
- No em dashes anywhere on the site. (User preference.)

### Below the hero

Suggested structure (subject to iteration):

1. **Career timeline** — the condensed professional version (see Section 5). Scroll-linked parallax (see Section 8).
2. **Latest work** — 2–3 curated "Done" projects. Do NOT feature archived/deprecated projects here. If there aren't enough "Done" projects to fill this, feature 2 rather than pad with archived ones.
3. **Let's connect** — existing CTA section with the "Get in Touch" button. Keep.

Remove from homepage:

- The "Growth comes from pushing past discomfort" quote that's currently on the dev branch. The philosophy content moves to the About page.

---

## 5. About page

### Structure

1. **Intro paragraph** — who Angus is in prose (below)
2. **Professional timeline** — condensed, public version (below)
3. **Philosophy / north star block** — the spine quote (see Section 2)
4. **Link to full timeline** — "If you want the fuller story, the full timeline lives [here](/projects/timeline) (sign-in required)."

### Intro paragraph

```
I'm a startup operator and amateur developer with a passion for the intersection
of business strategy, software, and data.

Currently, I'm COO of HeyLina, where we're building emotionally intelligent AI.
It's the most exciting thing I've ever worked on.

Before that, I was a Data Strategy Manager at Anmut, working on data valuation
and data maturity tools like Grace.

I started my career at Accenture, cutting my teeth as an analyst on digital
transformation projects across the Royal Navy, Police, and Courts and Tribunals
Judiciary (CTJ). Later, I moved into Accenture's strategy division, working on
pricing, GDPR, and data-driven insights in large telecom and insurance
companies.

Before all that, I was a mathematics teacher through the TeachFirst programme.
To this day, the hardest thing I've done.

This website is my sandbox, a space to explore personal software projects and
challenge myself to put what I learn and my thoughts out into the world.
Honestly, I find that terrifying. But growth comes from pushing past discomfort,
and I believe the best way to develop is to create, share, and learn from others.

If you have any thoughts, feedback, or just want to chat, feel free to reach out
via the Contact Me page.

Thanks for stopping by. I appreciate it.
```

### Professional timeline (About page)

Condensed career arc. Public. No personal content.

| Year | Role | Organisation | Description |
|------|------|--------------|-------------|
| 2015 | Mathematics Teacher | TeachFirst / Burnt Mill Academy | Teaching in London schools through TeachFirst. |
| 2017 | Analyst then Strategist | Accenture | Digital transformation across the Royal Navy, Police, and Courts. Then pricing strategy and GDPR in telecom and insurance. |
| 2020 | COO | Teamvine (Future Factory Ltd) | Oversaw product, customer services, sales, marketing, compliance, governance, content, ops, IP. Led agile dev teams. Shipped 4 digital products in 6 months. Secured £100k UKRI grant. |
| 2022 | Data Strategy Manager | Anmut | Data valuation and data maturity. Helping organisations understand what their data is actually worth. |
| 2025 | COO | HeyLina | Building emotionally intelligent AI. The most exciting thing I've ever worked on. |

### Philosophy block (About page)

Large, editorial-style quote treatment:

```
A person honestly documenting their one shot at life. What they're building,
what they've learned, and how they think. Hope others will find it useful now,
or at least, something for my kids to look back on in future.
```

---

## 6. Full timeline (gated project)

### Route

`/projects/timeline` — gated behind sign-in. Listed on the projects page as a "Done" or "In progress" project (suggest: In progress, since Angus will keep adding to it).

### Intent

This is the honest, personal version of the timeline. Not a CV. Not optimised for any audience except Angus himself (and, eventually, his future children). Should feel like an intimate document.

### Design

- Vertical timeline with a central line
- Milestones as cards down alternating sides, or consistently down one side
- Scroll-linked parallax (see Section 8)
- Each entry: date, title, short description
- Colour-coded loosely by life domain (career / education / relationships / key moments)

### Content — current entries

This is what has been captured so far in chat. Entries marked `[STUB]` are ones Angus wants to expand separately; use the placeholder text for now.

```yaml
- date: 1994
  title: Born, Edinburgh
  body: >
    Mum Anne, dad Paul, older brother Andrew. The A-team and Paul.
  category: foundational

- date: ~1997
  title: First memory
  body: >
    Nursery drop-off. Crying at the handoff with mum, then finding a toy
    cash register and being instantly drawn to it.
  category: personal

- date: ~2004
  title: Shoe polishing, age 10
  body: >
    Door to door, 50p a shoe, for charity. Got laughed at. Kept doing it.
  category: enterprise

- date: ~2005
  title: Lemonade stand
  body: >
    Grandma's recipe, refilled water bottles, terrible health and safety.
  category: enterprise

- date: 2009 to 2013
  title: The Yard
  body: >
    Volunteer with children with special needs. Developed games for them.
  category: community

- date: ~2010
  title: Babysitting and tutoring, age 16
  body: >
    First aid course, started babysitting. Discovered I loved teaching the
    kids what I was learning. Drawing two lines of a triangle and telling
    them the third side. Blew their minds. Taught Pythagoras from first
    principles. Got popular enough to try franchising it. Printed business
    cards. Boys at school found the cards. "Pedo Hally" for a year after.
  category: enterprise

- date: 1999 to 2013
  title: Stewart's Melville College, Edinburgh
  body: >
    5 Scottish Highers at A. 3 Advanced Highers at A (Maths, Russian
    History, Philosophy).
  category: education

- date: June 2012
  title: Duke of Edinburgh Gold
  body: >
    Led a group on a 5-day expedition in the Scottish Highlands.
  category: milestone

- date: September 2013
  title: Moved to London
  body: >
    Left Edinburgh for LSE. Haven't left since.
  category: foundational

- date: 2013 to 2016
  title: LSE, BSc Economics and Philosophy
  body: >
    First Class Honours. Dissertation on the business ethics of 'economic
    profits'. Met Megha, first serious relationship.
  category: education

- date: Summer 2015
  title: JP Morgan, summer intern (Equities)
  body: >
    Managed receivable research payments. Wrote a Standard Operating
    Procedure.
  category: career

- date: 2016 to 2017
  title: PGCE, UCL
  body: >
    Awarded Outstanding, qualified teacher status.
  category: education

- date: September 2016 to July 2018
  title: Maths teacher, Burnt Mill Academy, Harlow
  body: >
    The hardest thing I've done. TeachFirst route, so holidays went straight
    into PGCE study. Pay was awful.

    Standing in front of 32 students with a wide mix of abilities, even with
    setting. Kids with diagnosed and undiagnosed ADHD whose parents refused
    specialist care. They needed support every 15 minutes. The behaviour
    system asked you to track first and second warnings across 32 students
    while delivering an engaging lesson. For me that was impossible.

    The school culture encouraged yelling. When I got stressed, I'd fall
    back on yelling. It was moderately effective until it wasn't, like water
    off a duck's back. And I didn't like who I became.

    In the second term of my first year I broke down. Saw a doctor who
    signed me off work and prescribed antidepressants. I've been on and off
    them since.
  category: rupture

- date: March 2018
  title: Megha and I broke up
  body: >
    Long distance didn't hold. She was returning to India. I'd just started
    at Accenture. Our lives were pulling in different directions and we'd
    grown apart.
  category: relationships

- date: January 2019 to September 2020
  title: Accenture Strategy & Consulting
  body: >
    Royal Navy HR service design, UK Police onboarding during COVID (scaled
    from 3 to 30 users/day, onboarded 450+ legal professionals), growth and
    pricing for a UK telecom (£4m value), data privacy and GDPR strategy
    (£1.1–3.5m uplift), go-to-market for a digital startup.
  category: career

- date: November 2020 to November 2022
  title: COO, Teamvine (Future Factory Ltd)
  body: >
    Oversaw product, customer services, sales, marketing, compliance,
    governance, content, ops, IP. Led agile dev teams. Shipped 4 digital
    products in 6 months. Secured £100k UKRI grant.
  category: career

- date: November 2022 to October 2025
  title: Data Consultant then Manager, Anmut
  body: >
    Data valuation and data maturity. Worked on Grace. Led high-profile
    data management projects for large organisations.
  category: career

- date: 2 May 2023
  title: Met Laura Sharp
  body: "[STUB] To be expanded."
  category: relationships

- date: April 2025
  title: Started part-time at HeyLina
  body: "[STUB] To be expanded. How HeyLina started, how Angus got involved."
  category: career

- date: 10 October 2025
  title: Left Anmut, full-time COO at HeyLina
  body: >
    Started a 6-month sabbatical from Anmut, already working part-time with
    HeyLina. Formally left at the end of the sabbatical, went full-time on
    HeyLina. Building emotionally intelligent AI. The most exciting thing
    I've ever worked on.
  category: career

- date: 2 November 2025
  title: Engaged to Laura
  body: "[STUB] To be expanded."
  category: relationships

- date: 16 November 2026
  title: Wedding
  body: "Upcoming."
  category: milestone
```

Note: the gap between 2018 and 2023 (the "single period") is real and is worth eventually filling with non-relationship content. For now, the career entries cover the period.

### Known gaps

Angus will expand these separately:
- Meeting Laura (2 May 2023)
- The proposal (2 Nov 2025)
- How HeyLina started, why he left Anmut
- Non-relationship personal content from 2018–2023

Build the timeline to accept new entries easily (ideally data-driven from a YAML or JSON file).

---

## 7. Projects page changes

### Status flags

Replace the current `Deprecated` label with `Archived`. Introduce three statuses:

- **In progress** — actively being worked on
- **Done** — shipped, stable, no active work but the story is complete
- **Archived** — no longer active, kept for history

Current status mapping (confirm in code):

- Data Value Game — **Done**
- Eat Safe UK — **Archived**
- Blog — **In progress** (the blog is a project in its own right; the card should describe the blog platform as something Angus built, not duplicate a link to blog posts)
- Strava Activity Dashboard — **Done**
- Habit Tracker App — **Archived**
- AI Text Analysis — **Done** (but gated)
- Instapaper — **Archived**
- Bookmarks — **Archived**
- Timeline — **In progress** (new, gated — see Section 6)

The professional case studies currently in the Blog (DVSA, Customer Journey Uplift, £7.2M marketing consent, Pandemic Rollout, Future Factory pivot, £4M revenue uplift) stay in the blog. They serve dual duty as public thinking and credibility content; no migration needed.

---

## 8. Design intent: parallax scrolling

Inspiration: [portavia.framer.website](https://portavia.framer.website) — scroll-linked 3D card flips, sticky images that tilt as you scroll, bold display typography with photos breaking through it.

### Where to apply parallax

- **Homepage timeline** — condensed professional version. Scroll-linked fade/translate as each milestone enters view. The central line "draws" itself. Optionally, a subtle 3D rotation as you scroll through.
- **Full timeline page (`/projects/timeline`)** — same treatment, more generously spaced.

### Where NOT to apply parallax

- Projects grid, Blog grid, About intro paragraph, Contact form. Keep these static and fast.

### How to implement

Since this is already a React app, install and use `framer-motion` (open-source, by the Framer team). Do not migrate the site to Framer's SaaS product — we're keeping the self-hosted React build.

Key patterns:
- `useScroll` + `useTransform` for scroll-linked animation
- `whileInView` + `viewport={{ once: true }}` for on-enter reveals
- `<motion.div>` with 3D transforms for the card flip effect
- Respect `prefers-reduced-motion`: animations should degrade gracefully to simple fades

### Typography

Consider a heavier display face for the hero name "Angus Hally" and the timeline year headings. The current type looks clean but small for a site that wants to feel confident. Look at the scale in the Portavia reference (name at ~160px+).

---

## 9. Hard constraints

- **Never use em dashes** in copy anywhere on the site. Use commas, colons, or full stops instead. (User preference, applies site-wide.)
- Status label language: "Archived" not "Deprecated".
- Services pages (`/work-with-me/*`) are never in the top nav.

---

## 10. Suggested build order

1. **Homepage hero update** — replace current welcome with new hero. Low risk, high visible impact.
2. **Projects page cleanup** — rename Deprecated → Archived, remove Blog-as-project, add status flags consistently.
3. **Footer sitemap** — build out the new three-column footer with Main, Work with me, Connect sections.
4. **Work-with-me page shells** — create `/work-with-me`, `/work-with-me/consulting`, `/work-with-me/webdev`, `/work-with-me/maths` with placeholder content. Route them, don't link them in top nav.
5. **About page rebuild** — new intro paragraph, condensed professional timeline, philosophy quote, link to full timeline.
6. **Full timeline page** — new gated project at `/projects/timeline`, data-driven from YAML/JSON, with parallax scroll effects.
7. **Homepage timeline section** — condensed version of the professional timeline on the homepage, with parallax.
8. **Iteration** — review with Angus, polish.

Do steps 1–4 first; they unblock the structural changes without depending on the timeline content. Steps 5–7 are the big content lifts and can happen in parallel with Angus filling in the stubs.

---

## 11. Open questions for Angus

- Confirm the current auth implementation and whether `/projects/timeline` can reuse the same gate as AI Text Analysis.
- Confirm status of each existing project (In progress / Done / Archived) — the mapping in Section 7 is best-guess.
- Decide: hero typography treatment. Massive display face like Portavia, or keep it more restrained?

Do not block on these. Flag them and ask in the Claude Code session when you hit them.