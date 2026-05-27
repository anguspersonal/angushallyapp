#!/usr/bin/env node
/**
 * Computes Angus's commit footprint across all owned + org repos by cloning
 * each repo (bare, single-branch) and parsing `git log --shortstat`.
 *
 * Why local clones instead of GitHub's stats endpoint?
 *   - `/stats/contributors` is lazy: it returns 202 on the first hit and the
 *     cache is invalidated on every push to the default branch. For an active
 *     dev with daily commits, the cache is constantly stale and we end up
 *     polling for minutes per repo.
 *   - Local clones give us exact line counts, commit timestamps (for
 *     "peak hour" stats), and merge-vs-non-merge breakdowns. They also work
 *     uniformly for public + private repos because we inherit `gh` auth.
 *
 * Outputs:
 *   - docs/code-stats.json  — machine-readable snapshot for any UI/widget.
 *
 * Author identification:
 *   Angus uses several git identities. We match by email (any of):
 *     angus.hally@gmail.com, anguspersonal@*, angus.hally@heylina.ai
 *   and explicitly exclude any *[bot]* committer (Devin, GitHub Actions,
 *   Cursor Agent, etc.).
 *
 * Usage:
 *   node scripts/fetch-code-stats.mjs              # writes JSON
 *   node scripts/fetch-code-stats.mjs --print      # also prints summary
 *   node scripts/fetch-code-stats.mjs --reuse      # reuse cached clones
 *   node scripts/fetch-code-stats.mjs --only=angushallyapp
 *
 * Requires: `gh` CLI authenticated (`gh auth status`) + `git`.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const USER = 'anguspersonal';
const ORGS = ['asklina'];

const AUTHOR_EMAIL_PATTERNS = [
  /(^|[<\s])angus\.hally@gmail\.com/i,
  /(^|[<\s])angus\.hally@heylina\.ai/i,
  /(^|[<\s])anguspersonal(@|\+)/i,
  /\+anguspersonal@users\.noreply\.github\.com/i,
];

const EXCLUDE_EMAIL_PATTERNS = [
  /\[bot\]/i,
  /cursor\.com$/i,
  /github-actions/i,
  /devin-ai-integration/i,
  /noreply@anthropic\.com/i,
];

/**
 * Files that aren't really "code I wrote" — lock files, generated artefacts,
 * minified bundles, data dumps committed for offline use, vendored deps.
 *
 * We compute stats two ways: raw (everything) and filtered (excluding these).
 * The filtered number is the honest "lines of code" headline.
 */
const NOISE_FILE_PATTERNS = [
  // lock files
  /(^|\/)package-lock\.json$/i,
  /(^|\/)yarn\.lock$/i,
  /(^|\/)pnpm-lock\.yaml$/i,
  /(^|\/)bun\.lock(b)?$/i,
  /(^|\/)Gemfile\.lock$/i,
  /(^|\/)Cargo\.lock$/i,
  /(^|\/)poetry\.lock$/i,
  /(^|\/)composer\.lock$/i,
  /(^|\/)go\.sum$/i,
  // build outputs / vendored deps
  /(^|\/)node_modules\//i,
  /(^|\/)vendor\//i,
  /(^|\/)dist\//i,
  /(^|\/)build\//i,
  /(^|\/)\.next\//i,
  /(^|\/)out\//i,
  /(^|\/)coverage\//i,
  // minified / source maps
  /\.min\.(js|css|mjs)$/i,
  /\.map$/i,
  // data dumps / large assets we treat as data, not code
  /\.(csv|tsv|geojson|ndjson)$/i,
  // common dump locations
  /(^|\/)data\/dumps?\//i,
  /(^|\/)fixtures\//i,
];

/**
 * Per-file safety net: if a single file in a single commit shows more than
 * this many added lines, treat it as a data import / dump and exclude it
 * from the filtered total. Real refactors rarely add this many lines to
 * one file in one commit.
 */
const FILE_ADD_CAP = 5000;

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const OUT_PATH = resolve(REPO_ROOT, 'docs', 'code-stats.json');
const PUBLIC_PATH = resolve(REPO_ROOT, 'public', 'data', 'code-stats.json');
// Bundled copy so the /cv page can `import` it (App Router can't bundle from public/).
const SRC_DATA_PATH = resolve(REPO_ROOT, 'src', 'data', 'code-stats.json');
const CACHE_DIR = join(tmpdir(), 'angushally-code-stats');

const args = process.argv.slice(2);
const PRINT = args.includes('--print');
const REUSE = args.includes('--reuse');
const ONLY = args.find((a) => a.startsWith('--only='))?.slice('--only='.length);

function gh(ghArgs) {
  return execFileSync('gh', ghArgs, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function listRepos(owner) {
  const out = gh([
    'repo', 'list', owner,
    '--limit', '200',
    '--json',
    'name,nameWithOwner,owner,isPrivate,isFork,isArchived,createdAt,pushedAt,primaryLanguage,stargazerCount,forkCount,diskUsage,description,defaultBranchRef',
  ]);
  return JSON.parse(out);
}

function getAuthToken() {
  return gh(['auth', 'token']).trim();
}

function cloneBare(slug, token) {
  const cloneDir = join(CACHE_DIR, slug.replace('/', '__') + '.git');
  if (REUSE && existsSync(cloneDir)) {
    return cloneDir;
  }
  if (existsSync(cloneDir)) rmSync(cloneDir, { recursive: true, force: true });
  mkdirSync(dirname(cloneDir), { recursive: true });
  const url = `https://x-access-token:${token}@github.com/${slug}.git`;
  const res = spawnSync('git', [
    'clone', '--bare', '--single-branch', '--quiet', url, cloneDir,
  ], { encoding: 'utf8' });
  if (res.status !== 0) {
    return { _error: (res.stderr || '').slice(0, 200) };
  }
  return cloneDir;
}

function isAngus(email, name) {
  const s = `${name || ''} <${email || ''}>`;
  if (EXCLUDE_EMAIL_PATTERNS.some((p) => p.test(s))) return false;
  return AUTHOR_EMAIL_PATTERNS.some((p) => p.test(s));
}

function isNoiseFile(path) {
  return NOISE_FILE_PATTERNS.some((p) => p.test(path));
}

function parseLog(repoDir) {
  // Format each commit as "C|<hash>|<email>|<name>|<iso-date>|<subject>"
  // then numstat lines: "<adds>\t<dels>\t<file>"
  // Numstat avoids merge dupes (skipped by default) and is per-file precise.
  const res = spawnSync('git', [
    `--git-dir=${repoDir}`,
    'log', '--all', '--no-merges',
    '--pretty=format:C|%H|%ae|%an|%aI|%s',
    '--numstat',
  ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (res.status !== 0) return { _error: (res.stderr || '').slice(0, 200) };
  const lines = res.stdout.split('\n');

  const commits = [];
  let current = null;
  for (const line of lines) {
    if (line.startsWith('C|')) {
      if (current) commits.push(current);
      const [, hash, email, name, date, ...subjectParts] = line.split('|');
      const subject = subjectParts.join('|');
      current = {
        hash, email, name, date, subject,
        isAngus: isAngus(email, name),
        adds: 0, dels: 0, files: 0,
        addsFiltered: 0, delsFiltered: 0, filesFiltered: 0,
      };
    } else if (line.trim() === '') {
      // blank line between commits — ignore
    } else if (current) {
      // numstat line: "<adds>\t<dels>\t<file>"
      const parts = line.split('\t');
      if (parts.length >= 3) {
        const a = parts[0] === '-' ? 0 : parseInt(parts[0], 10) || 0;
        const d = parts[1] === '-' ? 0 : parseInt(parts[1], 10) || 0;
        // Renames look like "old => new" or "path/{old => new}/rest"
        // — for filtering we use the raw token.
        const path = parts.slice(2).join('\t');
        current.adds += a;
        current.dels += d;
        current.files += 1;
        // Symmetric cap — a single file with massive adds OR dels is almost
        // always a data dump or generated artefact. If either side exceeds
        // the cap, drop the file from filtered totals entirely.
        if (!isNoiseFile(path) && a < FILE_ADD_CAP && d < FILE_ADD_CAP) {
          current.addsFiltered += a;
          current.delsFiltered += d;
          current.filesFiltered += 1;
        }
      }
    }
  }
  if (current) commits.push(current);
  return { commits };
}

async function getLanguages(slug) {
  try { return JSON.parse(gh(['api', `repos/${slug}/languages`])); }
  catch { return {}; }
}

async function getYearlyContribs(years) {
  const out = {};
  for (const y of years) {
    const q = `query {
      user(login: "${USER}") {
        contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          totalRepositoryContributions
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount weekday } }
          }
        }
      }
    }`;
    const raw = gh(['api', 'graphql', '-f', `query=${q}`]);
    out[y] = JSON.parse(raw).data.user.contributionsCollection;
  }
  return out;
}

async function getProfile() {
  const q = `query {
    user(login: "${USER}") {
      createdAt
      followers { totalCount }
      following { totalCount }
    }
  }`;
  const raw = gh(['api', 'graphql', '-f', `query=${q}`]);
  return JSON.parse(raw).data.user;
}

function activityFromLocalCommits(dailyCommits) {
  const dates = Object.keys(dailyCommits).sort();
  if (!dates.length) return { totalActiveDays: 0, longestStreakDays: 0, bestDay: null };
  let longest = 1;
  let current = 1;
  let prev = new Date(dates[0]);
  for (let i = 1; i < dates.length; i++) {
    const cur = new Date(dates[i]);
    const diffDays = Math.round((cur - prev) / (24 * 3600 * 1000));
    if (diffDays === 1) current++;
    else current = 1;
    if (current > longest) longest = current;
    prev = cur;
  }
  const bestEntry = Object.entries(dailyCommits).sort((a, b) => b[1] - a[1])[0];
  return {
    totalActiveDays: dates.length,
    longestStreakDays: longest,
    bestDay: { date: bestEntry[0], commits: bestEntry[1] },
    firstDay: dates[0],
    lastDay: dates[dates.length - 1],
  };
}

function aggregateActivity(yearly) {
  let totalActiveDays = 0;
  let longestStreak = 0;
  let currentStreak = 0;
  let bestDay = { date: null, count: 0 };
  const allDays = [];
  for (const y of Object.keys(yearly)) {
    const cal = yearly[y].contributionCalendar;
    if (!cal) continue;
    for (const w of cal.weeks) {
      for (const d of w.contributionDays) allDays.push(d);
    }
  }
  allDays.sort((a, b) => (a.date < b.date ? -1 : 1));
  for (const d of allDays) {
    if (d.contributionCount > 0) {
      totalActiveDays++;
      currentStreak++;
      if (currentStreak > longestStreak) longestStreak = currentStreak;
      if (d.contributionCount > bestDay.count) {
        bestDay = { date: d.date, count: d.contributionCount };
      }
    } else {
      currentStreak = 0;
    }
  }
  return { totalActiveDays, longestStreakDays: longestStreak, bestDay };
}

async function main() {
  console.error('[1/5] gh auth + profile…');
  const token = getAuthToken();
  const profile = await getProfile();
  const createdYear = new Date(profile.createdAt).getUTCFullYear();
  const thisYear = new Date().getUTCFullYear();
  const years = [];
  for (let y = createdYear; y <= thisYear; y++) years.push(y);
  const yearly = await getYearlyContribs(years);

  console.error('[2/5] listing repos…');
  let repos = [];
  repos.push(...listRepos(USER));
  for (const org of ORGS) {
    try { repos.push(...listRepos(org)); }
    catch (err) { console.error(`[warn] could not list ${org}: ${err.message}`); }
  }
  if (ONLY) repos = repos.filter((r) => r.name === ONLY || r.nameWithOwner === ONLY);
  console.error(`[2/5] found ${repos.length} repos${ONLY ? ` (filtered to ${ONLY})` : ''}`);

  console.error(`[3/5] cloning + parsing logs (cache: ${CACHE_DIR})…`);
  mkdirSync(CACHE_DIR, { recursive: true });

  const perRepo = [];
  const languages = {};
  const hourHistogram = new Array(24).fill(0); // by Angus commits (UTC hour)
  const weekdayHistogram = new Array(7).fill(0);
  const monthHistogram = {}; // YYYY-MM → commits
  const dailyCommits = {}; // YYYY-MM-DD → commits (across all repos, for streaks)
  let firstCommit = null;
  let lastCommit = null;
  let largestCommit = { hash: null, adds: 0, repo: null, subject: null };
  let totalCoAuthored = 0;
  const subjectLengths = [];
  const longestSubject = { length: 0, subject: '', repo: '', hash: '' };

  for (const r of repos) {
    const slug = r.nameWithOwner;
    process.stderr.write(`  • ${slug} … `);
    const cloneRes = cloneBare(slug, token);
    if (cloneRes?._error) { process.stderr.write(`clone failed: ${cloneRes._error.slice(0, 60)}\n`); continue; }

    const cloneDir = cloneRes;
    const parsed = parseLog(cloneDir);
    if (parsed?._error) { process.stderr.write(`log failed\n`); continue; }

    const angusCommits = parsed.commits.filter((c) => c.isAngus);
    const allCommits = parsed.commits;
    const myAdds = angusCommits.reduce((s, c) => s + c.adds, 0);
    const myDels = angusCommits.reduce((s, c) => s + c.dels, 0);
    const myAddsFiltered = angusCommits.reduce((s, c) => s + c.addsFiltered, 0);
    const myDelsFiltered = angusCommits.reduce((s, c) => s + c.delsFiltered, 0);

    // populate fun histograms from Angus commits only
    for (const c of angusCommits) {
      const d = new Date(c.date);
      if (!Number.isNaN(d.getTime())) {
        hourHistogram[d.getUTCHours()]++;
        weekdayHistogram[d.getUTCDay()]++;
        const ym = d.toISOString().slice(0, 7);
        monthHistogram[ym] = (monthHistogram[ym] || 0) + 1;
        const ymd = d.toISOString().slice(0, 10);
        dailyCommits[ymd] = (dailyCommits[ymd] || 0) + 1;
        if (!firstCommit || c.date < firstCommit.date) {
          firstCommit = { date: c.date, repo: slug, subject: c.subject, hash: c.hash };
        }
        if (!lastCommit || c.date > lastCommit.date) {
          lastCommit = { date: c.date, repo: slug, subject: c.subject, hash: c.hash };
        }
      }
      // "largest commit" uses filtered adds so we don't celebrate data dumps.
      // We also skip subjects that look like bulk imports / archives /
      // initial commits — these inflate the stat but aren't representative
      // of "the biggest thing I wrote."
      const ARCHIVE_RE = /^(initial commit|archive[:\s]|import[:\s]|migrate[:\s]|migrating|vendor[:\s]|bulk[:\s])/i;
      if (c.addsFiltered > largestCommit.adds && !ARCHIVE_RE.test(c.subject)) {
        largestCommit = { hash: c.hash, adds: c.addsFiltered, dels: c.delsFiltered, repo: slug, subject: c.subject, date: c.date };
      }
      if (/co-authored-by:/i.test(c.subject)) totalCoAuthored++;
      subjectLengths.push(c.subject.length);
      if (c.subject.length > longestSubject.length) {
        longestSubject.length = c.subject.length;
        longestSubject.subject = c.subject;
        longestSubject.repo = slug;
        longestSubject.hash = c.hash;
      }
    }

    const langs = await getLanguages(slug);
    for (const [lang, bytes] of Object.entries(langs)) {
      languages[lang] = (languages[lang] || 0) + bytes;
    }

    perRepo.push({
      repo: slug,
      isPrivate: r.isPrivate,
      isFork: r.isFork,
      isArchived: r.isArchived,
      stars: r.stargazerCount || 0,
      primaryLanguage: r.primaryLanguage?.name || null,
      commits: angusCommits.length,
      additions: myAdds,
      deletions: myDels,
      net: myAdds - myDels,
      additionsFiltered: myAddsFiltered,
      deletionsFiltered: myDelsFiltered,
      netFiltered: myAddsFiltered - myDelsFiltered,
      totalRepoCommits: allCommits.length,
      myShareOfCommits: allCommits.length > 0 ? angusCommits.length / allCommits.length : 1,
    });
    process.stderr.write(`+${myAddsFiltered} -${myDelsFiltered} (${angusCommits.length}/${allCommits.length} commits)\n`);
  }

  perRepo.sort((a, b) => b.additionsFiltered - a.additionsFiltered);

  const headline = {
    // Filtered = excludes lock files, build outputs, data dumps. This is the
    // "lines of code I actually wrote" number we put on the landing page.
    totalLinesAdded: perRepo.reduce((s, r) => s + r.additionsFiltered, 0),
    totalLinesDeleted: perRepo.reduce((s, r) => s + r.deletionsFiltered, 0),
    netLines: perRepo.reduce((s, r) => s + r.netFiltered, 0),
    // Raw = everything, kept for transparency / curiosity.
    totalLinesAddedRaw: perRepo.reduce((s, r) => s + r.additions, 0),
    totalLinesDeletedRaw: perRepo.reduce((s, r) => s + r.deletions, 0),
    totalCommits: perRepo.reduce((s, r) => s + r.commits, 0),
    reposContributedTo: perRepo.filter((r) => r.commits > 0).length,
  };

  const totalLangBytes = Object.values(languages).reduce((s, n) => s + n, 0);
  const languagesRanked = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({ name, bytes, pct: totalLangBytes > 0 ? bytes / totalLangBytes : 0 }));

  const sortedMonths = Object.entries(monthHistogram).sort((a, b) => (a[0] < b[0] ? -1 : 1));

  console.error('[4/5] aggregating…');
  const result = {
    generatedAt: new Date().toISOString(),
    user: USER,
    orgs: ORGS,
    profile: {
      createdAt: profile.createdAt,
      ageYears: +((Date.now() - new Date(profile.createdAt)) / (365.25 * 24 * 3600 * 1000)).toFixed(2),
      followers: profile.followers.totalCount,
      following: profile.following.totalCount,
    },
    headline,
    repoMeta: {
      total: repos.length,
      public: repos.filter((r) => !r.isPrivate).length,
      private: repos.filter((r) => r.isPrivate).length,
      forks: repos.filter((r) => r.isFork).length,
      archived: repos.filter((r) => r.isArchived).length,
      starsReceived: repos.reduce((s, r) => s + (r.stargazerCount || 0), 0),
      largest: repos.reduce(
        (a, b) => ((b.diskUsage || 0) > (a.diskUsage || 0) ? b : a),
        { diskUsage: 0 },
      ),
    },
    languagesRanked,
    yearly,
    yearlyTotals: Object.values(yearly).reduce((acc, y) => {
      acc.commits += y.totalCommitContributions || 0;
      acc.issues += y.totalIssueContributions || 0;
      acc.prs += y.totalPullRequestContributions || 0;
      acc.reviews += y.totalPullRequestReviewContributions || 0;
      acc.reposCreated += y.totalRepositoryContributions || 0;
      acc.calendarTotal += y.contributionCalendar?.totalContributions || 0;
      return acc;
    }, { commits: 0, issues: 0, prs: 0, reviews: 0, reposCreated: 0, calendarTotal: 0 }),
    // GraphQL-based activity (only counts contributions GitHub credits to
    // your profile — misses commits to org repos, non-default branches, etc.)
    activityFromGitHub: aggregateActivity(yearly),
    // Local-commit-based activity is more accurate because we walked every
    // commit in every clone and matched by author email.
    activity: activityFromLocalCommits(dailyCommits),
    fun: {
      firstCommit,
      lastCommit,
      largestCommit,
      longestCommitSubject: longestSubject,
      avgCommitSubjectLength: subjectLengths.length
        ? Math.round(subjectLengths.reduce((s, n) => s + n, 0) / subjectLengths.length)
        : 0,
      coAuthoredCommits: totalCoAuthored,
      avgLinesPerCommit: headline.totalCommits > 0
        ? Math.round(headline.totalLinesAdded / headline.totalCommits)
        : 0,
      avgFilesPerCommit: 0, // filled below
      peakHourUTC: hourHistogram.indexOf(Math.max(...hourHistogram)),
      hourHistogramUTC: hourHistogram,
      peakWeekday: weekdayHistogram.indexOf(Math.max(...weekdayHistogram)),
      weekdayHistogram, // 0 = Sunday
      busiestMonth: sortedMonths.length
        ? sortedMonths.sort((a, b) => b[1] - a[1])[0]
        : null,
      monthlyCommits: Object.fromEntries(sortedMonths),
    },
    perRepo,
  };

  console.error('[5/5] writing…');
  // Write a slim public copy (no per-commit subjects, no histograms by-repo)
  // so the site can hot-load it without shipping internal-looking JSON.
  const publicSlim = {
    generatedAt: result.generatedAt,
    headline: result.headline,
    activity: result.activity,
    repoMeta: { total: result.repoMeta.total, public: result.repoMeta.public, private: result.repoMeta.private },
    languagesRanked: result.languagesRanked.slice(0, 10),
    fun: {
      firstCommit: result.fun.firstCommit,
      lastCommit: result.fun.lastCommit,
      peakHourUTC: result.fun.peakHourUTC,
      peakWeekday: result.fun.peakWeekday,
      avgLinesPerCommit: result.fun.avgLinesPerCommit,
      busiestMonth: result.fun.busiestMonth,
    },
    topRepos: result.perRepo.slice(0, 10).map((r) => ({
      repo: r.repo,
      additions: r.additionsFiltered,
      commits: r.commits,
      primaryLanguage: r.primaryLanguage,
      isPrivate: r.isPrivate,
    })),
  };
  const slimJson = JSON.stringify(publicSlim, null, 2);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));
  mkdirSync(dirname(PUBLIC_PATH), { recursive: true });
  writeFileSync(PUBLIC_PATH, slimJson);
  mkdirSync(dirname(SRC_DATA_PATH), { recursive: true });
  writeFileSync(SRC_DATA_PATH, slimJson);
  console.error(`wrote ${OUT_PATH}`);
  console.error(`wrote ${PUBLIC_PATH}`);
  console.error(`wrote ${SRC_DATA_PATH}`);

  if (PRINT) {
    console.log(JSON.stringify({
      headline,
      activity: result.activity,
      fun: {
        firstCommit: result.fun.firstCommit,
        lastCommit: result.fun.lastCommit,
        peakHourUTC: result.fun.peakHourUTC,
        peakWeekday: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][result.fun.peakWeekday],
        largestCommit: result.fun.largestCommit,
        coAuthoredCommits: result.fun.coAuthoredCommits,
        avgLinesPerCommit: result.fun.avgLinesPerCommit,
      },
      topLanguages: result.languagesRanked.slice(0, 5),
      topRepos: result.perRepo.slice(0, 5).map((r) => ({ repo: r.repo, additions: r.additionsFiltered, commits: r.commits })),
    }, null, 2));
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
