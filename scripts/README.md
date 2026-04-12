# Scripts

| Area | Files | npm |
|------|--------|-----|
| Next troubleshooting | `fix-nextjs-build-errors.js` | `fix-nextjs`, `fix-nextjs:clean` |
| Image compression | `compress-images.mjs` | `compress-images` |
| Clean install / build / ports | `clean-node.sh`, `clean-next.sh`, `clean-ports.js` | `clean:node`, `clean:next`, `clean:ports` |

Dev servers use plain `next dev` / `next dev --turbopack`. If port 3000 is busy, Next prints a clear error; run `npm run clean:ports` (or `npx kill-port 3000`) to free it.

Bash scripts need Git Bash or WSL on Windows. `compress-images` needs optional `imagemin` deps to install.
