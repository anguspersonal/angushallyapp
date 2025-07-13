import { execSync } from "node:child_process";
import fs from "fs";
import path from "path";

const PUBLIC = "next-ui/public";
const ARCHIVE = "assets/archive";

fs.mkdirSync(ARCHIVE, { recursive: true });

// move *.original.* backups
for (const f of fs.readdirSync(PUBLIC)) {
  if (/\.original\./.test(f)) {
    fs.renameSync(path.join(PUBLIC, f), path.join(ARCHIVE, f));
    console.log(`📦 moved ${f}`);
  }
}

// delete Zone.Identifier files
execSync(`find ${PUBLIC} -name '*:Zone.Identifier' -delete`);
console.log("🗑️  deleted Windows ADS markers"); 