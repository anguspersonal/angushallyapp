#!/usr/bin/env node
/**
 * Source-image optimizer (per ADR 0033).
 *
 * Resizes any JPG/PNG in public/ exceeding MAX_LONG_EDGE down to that limit
 * and re-encodes at a sane quality. In-place, idempotent: re-running on
 * already-optimized files is a no-op (size check skips them).
 *
 * Source images live in public/ committed to the repo — git is the backup,
 * so we do not keep .original.* duplicates on disk.
 *
 * Usage:
 *   node scripts/optimize-images.mjs              # optimize public/
 *   node scripts/optimize-images.mjs --dry-run    # report what would change
 *   node scripts/optimize-images.mjs path/to/dir  # optimize a specific dir
 */

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_LONG_EDGE = 2400;
const JPEG_QUALITY = 82;
const PNG_COMPRESSION = 9;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const targetDir = args.find((a) => !a.startsWith('--')) ?? 'public';

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return [full];
    }),
  );
  return files.flat();
}

function isImage(p) {
  return /\.(jpe?g|png)$/i.test(p);
}

async function optimize(file) {
  // Read into a buffer first; sharp's native path-based open can fail
  // on Windows when other processes (Defender, indexer, dev server) have
  // the file open with deny-share flags.
  const inputBuf = await fs.readFile(file);
  const before = inputBuf.length;
  const meta = await sharp(inputBuf).metadata();
  const long = Math.max(meta.width ?? 0, meta.height ?? 0);
  const isJpeg = /\.(jpe?g)$/i.test(file);
  const isPng = /\.png$/i.test(file);

  const needsResize = long > MAX_LONG_EDGE;
  const needsRecompress = (isJpeg && before > 250 * 1024) || (isPng && before > 400 * 1024);

  if (!needsResize && !needsRecompress) {
    return { file, before, after: before, skipped: true };
  }

  let pipeline = sharp(inputBuf, { failOn: 'none' });
  if (needsResize) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? MAX_LONG_EDGE : null,
      height: meta.height > meta.width ? MAX_LONG_EDGE : null,
      withoutEnlargement: true,
    });
  }
  if (isJpeg) {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true });
  } else if (isPng) {
    pipeline = pipeline.png({ compressionLevel: PNG_COMPRESSION, palette: true });
  }

  const buf = await pipeline.toBuffer();

  if (buf.length >= before) {
    return { file, before, after: before, skipped: true, reason: 'no gain' };
  }

  if (!dryRun) {
    await fs.writeFile(file, buf);
  }
  return { file, before, after: buf.length, skipped: false };
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

async function main() {
  const root = path.resolve(process.cwd(), targetDir);
  const stat = await fs.stat(root).catch(() => null);
  if (!stat?.isDirectory()) {
    console.error(`Not a directory: ${root}`);
    process.exit(1);
  }

  const all = await walk(root);
  const images = all.filter(isImage);
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Scanning ${images.length} image(s) in ${path.relative(process.cwd(), root) || '.'}...\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let changed = 0;
  let skipped = 0;
  const errors = [];

  for (const file of images) {
    const rel = path.relative(process.cwd(), file);
    try {
      const r = await optimize(file);
      totalBefore += r.before;
      totalAfter += r.after;
      if (r.skipped) {
        skipped++;
      } else {
        changed++;
        const saved = r.before - r.after;
        const pct = ((saved / r.before) * 100).toFixed(0);
        console.log(`  ${rel}  ${fmt(r.before)} -> ${fmt(r.after)}  (-${pct}%)`);
      }
    } catch (e) {
      errors.push({ file: rel, message: e.message });
      console.error(`  ${rel}  ERROR: ${e.message}`);
    }
  }

  const saved = totalBefore - totalAfter;
  const pct = totalBefore > 0 ? ((saved / totalBefore) * 100).toFixed(1) : '0';
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done. Changed: ${changed}, skipped: ${skipped}, errors: ${errors.length}.`);
  console.log(`Total: ${fmt(totalBefore)} -> ${fmt(totalAfter)}  (saved ${fmt(saved)}, ${pct}%)`);

  if (errors.length) process.exit(1);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
