#!/usr/bin/env node
/**
 * Patch Next.js 15.3.3 for Node.js 25 compatibility.
 * 
 * Problem: On Node 25, Next's config default-merging breaks — config properties
 * like `eslint`, `generateBuildId` remain undefined even though defaultConfig
 * defines them. This causes TypeError crashes during build.
 * 
 * Fix: Patch generate-build-id.js and build/index.js to handle undefined values
 * with optional chaining and null checks.
 * 
 * Remove once Next.js ships Node 25 support.
 */
const fs = require("fs");
const path = require("path");

const nextDir = path.dirname(require.resolve("next/package.json"));

function patch(relPath, replacements) {
  const filePath = path.join(nextDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-next] Missing: ${relPath}`);
    return false;
  }
  let code = fs.readFileSync(filePath, "utf8");
  let changed = false;
  for (const [from, to] of replacements) {
    if (code.includes(from)) {
      code = code.replace(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, code);
    console.log(`[patch-next] Patched: ${relPath}`);
  }
  return changed;
}

// 1. generate-build-id.js: handle undefined generate function
patch("dist/build/generate-build-id.js", [
  [
    "let buildId = await generate();",
    'let buildId = typeof generate === "function" ? await generate() : null;',
  ],
]);

// 2. build/index.js: multiple fixes for undefined config properties
patch("dist/build/index.js", [
  [
    "Boolean(config.eslint.ignoreDuringBuilds)",
    "Boolean(config.eslint?.ignoreDuringBuilds)",
  ],
  [
    "const distDir = _path.default.join(dir, config.distDir);",
    'const distDir = _path.default.join(dir, config.distDir || ".next");',
  ],
]);

// 3. load-jsconfig.js: handle missing typescript.tsconfigPath
patch("dist/build/load-jsconfig.js", [
  [
    "const tsConfigPath = _path.default.join(dir, config.typescript.tsconfigPath);",
    'const tsConfigPath = _path.default.join(dir, config.typescript?.tsconfigPath || "tsconfig.json");',
  ],
]);

console.log("[patch-next] Done.");
