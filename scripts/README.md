# Scripts

| Area | Files | npm |
|------|--------|-----|
| Next troubleshooting | `fix-nextjs-build-errors.js` | `fix-nextjs`, `fix-nextjs:clean` |
| Image optimization | `optimize-images.mjs` | `optimize-images` |
| Clean install / build / ports | `clean-node.sh`, `clean-next.sh`, `clean-ports.js` | `clean:node`, `clean:next`, `clean:ports` |

Dev servers use plain `next dev` / `next dev --turbopack`. If port 3000 is busy, Next prints a clear error; run `npm run clean:ports` (or `npx kill-port 3000`) to free it.

Bash scripts need Git Bash or WSL on Windows. `optimize-images` resizes any image with a long edge over 2400px down to 2400px and re-encodes JPEG/PNG (sharp-based, idempotent, in-place — git is the backup). See ADR 0033 for the standard.
