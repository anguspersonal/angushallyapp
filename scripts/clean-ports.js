#!/usr/bin/env node
import { execSync } from "node:child_process";
const ports = process.argv.slice(2).length ? process.argv.slice(2) : ["5000", "3000"];
for (const p of ports) {
  try {
    const pid = execSync(`lsof -ti tcp:${p}`).toString().trim();
    if (pid) {
      execSync(`kill -9 ${pid}`);
      console.log(`🔪 Killed ${pid} on port ${p}`);
    } else {
      console.log(`✅ Port ${p} free`);
    }
  } catch {
    console.log(`✅ Port ${p} free`);
  }
} 