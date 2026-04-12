#!/usr/bin/env node

const killPort = require('kill-port');

const ports = process.argv.slice(2).length
  ? process.argv.slice(2).map((p) => parseInt(p, 10)).filter((n) => !Number.isNaN(n))
  : [5000, 3000];

(async () => {
  for (const p of ports) {
    try {
      await killPort(p);
      console.log(`🔪 Cleared port ${p}`);
    } catch {
      console.log(`✅ Port ${p} already free`);
    }
  }
})();
