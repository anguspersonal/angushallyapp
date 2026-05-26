# code-stats

Vanity metrics for the landing page. Computed from `git log` across every repo Angus owns on GitHub (`anguspersonal`) plus every repo in the `asklina` org. Refreshed by `scripts/fetch-code-stats.mjs`.

> **Last generated:** 2026-05-26 from 62 repos (44 with at least one commit by Angus).
> Raw data lives in [`code-stats.json`](./code-stats.json); a slim, web-friendly copy is published to `public/data/code-stats.json` so any site widget can hot-load it.

---

## The headline numbers

| Metric | Value |
|---|---|
| **Lines of code written** | **1,118,666** |
| Commits authored | 2,391 |
| Repos contributed to | 44 (of 62 owned/org) |
| Public repos | 27 |
| Private repos | 35 |
| Days active on GitHub | 259 |
| Days since first commit | 1,080 (~3.0 years) |
| Active rate | 24% of days |
| Longest commit streak | 16 days |
| Most commits in one day | 96 (2026-03-30) |
| Pull requests opened | 94 |
| Code reviews | 24 |
| Issues opened | 20 |
| Stars received | 6 |

These are filtered numbers — see [Methodology](#methodology) for what counts as "code."

---

## How I code (when I look at the data)

| | |
|---|---|
| **Peak hour** | 17:00 UTC (≈ 5–6pm UK) |
| **Peak weekday** | Monday — closely followed by Sunday and Friday |
| **Busiest month** | January 2026 — 712 commits |
| **Avg lines per active day** | 4,319 |
| **Avg commits per active day** | 9.2 |
| **Avg lines per commit** | 468 |

Hour-by-hour profile (UTC), Angus commits only:

```
00 ██ 18         12 █████████████ 126
01 █ 6           13 ████████████ 117
02 ██ 22         14 ██████████████ 139
03  2            15 ████████████████████ 200
04 █ 8           16 ███████████████████████ 234
05 ██ 22         17 █████████████████████████ 249  ← peak
06 ████ 40       18 ███████████ 109
07 ████████ 84   19 █████████ 91
08 █████████████ 134  20 ███████████ 112
09 ███████████ 112    21 ██████████ 99
10 ████████████ 122   22 ████████████ 120
11 ██████████████ 143  23 ████████ 82
```

Weekday profile:

```
Sun █████████████████████████  381
Mon ██████████████████████████████  456  ← peak
Tue ████████████████████  298
Wed ████████████████████  301
Thu ██████████████████  267
Fri ███████████████████████  351
Sat ██████████████████████  337
```

Reading those: heaviest hours are late afternoon, but the tail to midnight is long. Weekends are nearly as busy as weekdays — there is no "work week" pattern, just a "code most days" pattern.

---

## Codebase by language

By bytes of source (GitHub Linguist-classified), summed across all repos:

| Language | Bytes | % |
|---|---:|---:|
| TypeScript | 21.2 MB | 74.8% |
| JavaScript | 1.8 MB | 6.4% |
| Python | 1.8 MB | 6.2% |
| Go | 1.4 MB | 4.8% |
| HTML | 1.1 MB | 3.9% |
| CSS | 486 KB | 1.7% |
| MDX, Shell, PowerShell, others | <1.5% | <1.5% |

Three-quarters TypeScript is no surprise — Next.js, React Native, and Supabase Edge Functions are the bread and butter. Go is from the `github-mcp-server` fork; Python is the Lina Lab evaluation harness.

---

## Top repos by lines I've written

| Repo | Lines added | Commits | What it is |
|---|---:|---:|---|
| `anguspersonal/knowledgeMgmtSystemOct2025` | 254,476 | 281 | Personal KMS — Supabase + PDF processing |
| `asklina/HeyLinaWebApp_v2.0` | 143,754 | 285 | HeyLina production web app |
| `anguspersonal/angushallyapp` | 122,145 | 454 | This website |
| `asklina/investor-room` | 88,682 | 350 | HeyLina investor portal |
| `asklina/lina-lab` | 81,564 | 162 | Eval harness for Lina's emotional-intelligence model (Python) |
| `anguspersonal/akilii-archive` | 75,016 | 1 | Archive snapshot — single commit, kept for completeness |
| `anguspersonal/HeyLinaAlt--deprecated` | 41,071 | 15 | Early React Native HeyLina prototype |
| `anguspersonal/HeyLinaAltV2` | 39,807 | 22 | Second React Native HeyLina prototype |
| `asklina/hl-landing-page` | 35,862 | 142 | HeyLina marketing site |
| `anguspersonal/signal-board` | 29,477 | 98 | Side project |

---

## Trivia

- **First commit ever:** 11 June 2023 — `Initial commit` on `first-website`. The whole git history starts there.
- **Most recent commit:** 26 May 2026 — a 68-commit `dev → main` release on `asklina/HeyLinaWebApp_v2.0`. Today.
- **Biggest single non-archive commit:** 51,325 lines, _"Reorganised repo"_ on `knowledgeMgmtSystemOct2025` (a folder restructure).
- **Largest repo on disk:** `angushallyapp` at 267 MB.
- **Most-starred repo:** tied at 1 — `angushallyapp`, `knowledgeMgmtSystemOct2025`, `co-watch-quest`, `signal-board`, `workflows`, `kms`.
- **Net lines (added − deleted):** +770,962. The codebase grows.

---

## Methodology

The headline "lines of code" number filters out anything that isn't really code I wrote:

- **Lock files** — `package-lock.json`, `yarn.lock`, `bun.lock`, `pnpm-lock.yaml`, `Gemfile.lock`, `Cargo.lock`, `poetry.lock`, `composer.lock`, `go.sum`
- **Build outputs** — `dist/`, `build/`, `.next/`, `out/`, `coverage/`
- **Vendored deps** — `node_modules/`, `vendor/`
- **Minified bundles & sourcemaps** — `*.min.js`, `*.min.css`, `*.map`
- **Data dumps** — `*.csv`, `*.tsv`, `*.geojson`, `*.ndjson`, anything in `data/dumps/` or `fixtures/`
- **Per-file safety cap** — any file with more than 5,000 added _or_ deleted lines in a single commit is treated as a data import and excluded.

The "raw" total (everything, including a one-off 16M-line FSA data sync) is 18.2M added / 16.9M deleted — kept in `code-stats.json` under `headline.totalLinesAddedRaw` for transparency.

Author identification matches Angus across his git identities:

- `angus.hally@gmail.com`
- `angus.hally@heylina.ai`
- `anguspersonal@...` (incl. the GitHub noreply form)

And explicitly excludes bot committers (Devin, GitHub Actions, Cursor Agent, Claude/Anthropic noreply).

GraphQL contributions data (commits, PRs, issues, streaks) under-counts by ~55% compared to local `git log`, because GitHub only credits contributions on default branches of certain repos. Where the two diverge, the local number is used.

---

## Auto-update

There are three sensible ways to keep these numbers fresh. Pick one — they're not mutually exclusive but stacking them is overkill.

### Option 1: Manual (cheapest, most controlled)

```bash
node scripts/fetch-code-stats.mjs --reuse --print
```

- `--reuse` skips re-cloning repos we've already cached in `$TMPDIR/angushally-code-stats/`
- `--print` echoes a summary to stdout
- Then `git commit docs/code-stats.json public/data/code-stats.json`

Run it whenever the numbers feel stale. Takes 2–5 minutes against ~60 repos depending on whether the cache is warm.

### Option 2: GitHub Actions (recommended, set-and-forget)

Add `.github/workflows/refresh-code-stats.yml`:

```yaml
name: Refresh code stats
on:
  schedule:
    - cron: '0 6 * * 1'   # every Monday 06:00 UTC
  workflow_dispatch:       # also runnable on demand from the Actions tab

jobs:
  refresh:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      # gh CLI is preinstalled on ubuntu-latest. Auth it with a token that
      # can read the private repos we want to count.
      - name: Auth gh
        env:
          GH_TOKEN: ${{ secrets.CODE_STATS_TOKEN }}
        run: echo "$GH_TOKEN" | gh auth login --with-token
      - name: Generate stats
        run: node scripts/fetch-code-stats.mjs --print
      - name: Commit if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add docs/code-stats.json public/data/code-stats.json
          git diff --cached --quiet || git commit -m "chore(stats): refresh code-stats"
          git push
```

**Token setup:** the default `GITHUB_TOKEN` only sees this repo. To count private repos in `anguspersonal/*` and `asklina/*`, create a fine-grained PAT with `Contents: read` on those org+user repos and add it as a repo secret named `CODE_STATS_TOKEN`. Weekly cadence is plenty — the numbers don't move that fast week-to-week.

### Option 3: Pre-build hook (always fresh on deploy)

Wire the script into the existing `prebuild` chain in [`package.json`](../package.json):

```json
"prebuild": "node scripts/build-chat-knowledge.mjs && node scripts/build-chat-routes.mjs && node scripts/build-resume.mjs && node scripts/fetch-code-stats.mjs"
```

Same `CODE_STATS_TOKEN` requirement in the Vercel build env. **Downside:** adds 2–5 minutes to every production build, and a transient GitHub API hiccup would fail the deploy. Only worth it if you want the numbers to update on every push without a separate workflow run.

---

## Future ideas

Things this dataset enables but aren't built yet:

- **`/about` widget** — animated counter on "lines of code written" + a sparkline of monthly commits. Read from `/data/code-stats.json`.
- **Heatmap** — render the 24×7 hour-of-week histogram as a GitHub-style heatmap so the "evening coder" pattern is visible at a glance.
- **Per-language breakdown** — small pie or bar next to the languages table, rendered from `languagesRanked`.
- **"Streak" badge** — current active streak (computed from `dailyCommits`), updated nightly. Could become a Shields.io badge endpoint.
- **Repo timeline** — when each repo was first touched, against the commit volume of each — gives a sense of how the project portfolio has grown.

If you build any of these, point them at `public/data/code-stats.json` so the auto-update flow propagates automatically.
