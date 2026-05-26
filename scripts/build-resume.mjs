#!/usr/bin/env node
/**
 * Resume PDF builder.
 *
 * Renders public/resume.html via headless Chromium and writes the result to
 * public/resume.pdf. The HTML's own @page / @media print rules drive page
 * geometry (A4, 18mm margins) — Puppeteer just triggers the print pipeline.
 *
 * The Download button on the /projects desktop serves /resume.pdf directly,
 * so re-running this is how you ship a new CV.
 *
 * Usage:
 *   bun run build:resume
 *   node scripts/build-resume.mjs
 */

import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const sourceHtml = path.join(repoRoot, 'public', 'resume.html');
const outputPdf = path.join(repoRoot, 'public', 'resume.pdf');

async function main() {
  await fs.access(sourceHtml).catch(() => {
    throw new Error(`Source HTML not found: ${sourceHtml}`);
  });

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.emulateMediaType('print');
    await page.goto(pathToFileURL(sourceHtml).href, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPdf,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }

  const { size } = await fs.stat(outputPdf);
  console.log(`Wrote ${path.relative(repoRoot, outputPdf)} (${(size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
