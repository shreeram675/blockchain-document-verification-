const fs = require("fs");
const path = require("path");

const from = path.join(__dirname, "..", "public", "_redirects");
const toDir = path.join(__dirname, "..", "dist");
const to = path.join(toDir, "_redirects");

if (!fs.existsSync(from)) {
  console.log(`[postbuild] Skipping: missing ${from}`);
  process.exit(0);
}

fs.mkdirSync(toDir, { recursive: true });
fs.copyFileSync(from, to);
console.log(`[postbuild] Copied ${from} -> ${to}`);

