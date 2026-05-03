#!/usr/bin/env node
/**
 * Breakpoint linter (per ADR 0032 §4).
 *
 * Hard rule from ADR 0032: "No raw px breakpoints in CSS modules. Use
 * var(--bp-*) only." Since CSS custom properties cannot be used inside
 * @media queries, the practical enforcement is "use em units" — the
 * --bp-* tokens are em-based and serve as the canonical scale (xs 36em,
 * sm 48em, md 62em, lg 75em, xl 88em).
 *
 * This script greps every CSS file under src/ for @media rules containing
 * raw px values. Fails the build (exit 1) if any are found, with a list of
 * offenders.
 *
 * Allowed:
 *   @media (min-width: 48em)
 *   @media print
 *   @media (prefers-reduced-motion: reduce)
 *
 * Disallowed:
 *   @media (max-width: 768px)
 *   @media (min-width: 1200px)
 *
 * Usage:
 *   node scripts/check-breakpoints.mjs           # check, exit 1 on failure
 *   node scripts/check-breakpoints.mjs --quiet   # only output on failure
 *
 * Suggested CI wire-up: add `bun run check:breakpoints` to the build step.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const QUIET = process.argv.includes('--quiet');

// Match any @media rule (including @media screen and ...) that contains a
// raw px value. We scan line-by-line because CSS modules generally keep
// each @media on its own line.
const MEDIA_PX_RE = /@media\b[^{]*\b\d+\s*px\b/i;

/** Recursively find every .css file under a dir. */
async function findCss(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules / .next / build artifacts if any slipped under src/
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      out.push(...(await findCss(full)));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const files = await findCss(SRC);
  const offenders = [];

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (MEDIA_PX_RE.test(line)) {
        offenders.push({
          file: path.relative(ROOT, file),
          line: i + 1,
          text: line.trim(),
        });
      }
    });
  }

  if (offenders.length === 0) {
    if (!QUIET) {
      console.log(`✓ Checked ${files.length} CSS file(s) under src/. No raw px in @media queries.`);
    }
    process.exit(0);
  }

  console.error(`\n✗ Found ${offenders.length} @media rule(s) with raw px values:\n`);
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}`);
    console.error(`    ${o.text}`);
  }
  console.error(`\nADR 0032 §4: use em-based breakpoints (matching --bp-* tokens).`);
  console.error(`  --bp-xs: 36em  --bp-sm: 48em  --bp-md: 62em  --bp-lg: 75em  --bp-xl: 88em\n`);
  console.error(`Convert: 768px → 48em  |  1200px → 75em  |  576px → 36em  |  etc.\n`);
  process.exit(1);
}

main().catch((err) => {
  console.error('check-breakpoints failed:', err);
  process.exit(2);
});
