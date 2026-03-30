#!/usr/bin/env node
/**
 * Patch Next.js for Node.js 25 compatibility.
 * 
 * On Node 25, Next.js config defaults don't merge properly — many config
 * properties remain undefined. This script patches the build files to
 * handle undefined values gracefully.
 */
const fs = require("fs");
const path = require("path");

const nextDir = path.dirname(require.resolve("next/package.json"));
const nextPkg = JSON.parse(fs.readFileSync(path.join(nextDir, "package.json"), "utf8"));
const major = parseInt(nextPkg.version.split(".")[0], 10);

function patchFile(relPath, replacements) {
  const filePath = path.join(nextDir, relPath);
  if (!fs.existsSync(filePath)) return false;
  let code = fs.readFileSync(filePath, "utf8");
  let changed = false;
  for (const [from, to] of replacements) {
    if (typeof from === "string") {
      if (code.includes(from)) { code = code.replace(from, to); changed = true; }
    } else if (from.test(code)) {
      code = code.replace(from, to); changed = true;
    }
  }
  if (changed) { fs.writeFileSync(filePath, code); console.log(`[patch-next] Patched: ${relPath}`); }
  return changed;
}

// 1. generateBuildId: config.generateBuildId is undefined on Node 25
patchFile("dist/build/generate-build-id.js", [
  ["let buildId = await generate();", 'let buildId = typeof generate === "function" ? await generate() : null;'],
]);

// 2. build/index.js: eslint and distDir config undefined
patchFile("dist/build/index.js", [
  ["Boolean(config.eslint.ignoreDuringBuilds)", "Boolean(config.eslint?.ignoreDuringBuilds ?? true)"],
  ['const distDir = _path.default.join(dir, config.distDir);', 'const distDir = _path.default.join(dir, config.distDir || ".next");'],
]);

// 3. load-jsconfig.js: tsconfigPath undefined
patchFile("dist/build/load-jsconfig.js", [
  ['const tsConfigPath = _path.default.join(dir, config.typescript.tsconfigPath);',
   'const tsConfigPath = _path.default.join(dir, config.typescript?.tsconfigPath || "tsconfig.json");'],
]);

// 4. type-check.js: config.typescript.tsconfigPath undefined causes "path" TypeError
patchFile("dist/build/type-check.js", [
  ["config.typescript.tsconfigPath, config.images.disableStaticImages",
   '(config.typescript?.tsconfigPath || "tsconfig.json"), config.images?.disableStaticImages'],
]);

// 5. SWC options: ensure dynamicIoEnabled is always boolean (undefined from Node 25 config merge bug)
patchFile("dist/build/swc/options.js", [
  ["dynamicIoEnabled: isDynamicIo,", "dynamicIoEnabled: !!isDynamicIo,"],
  ["dynamicIoEnabled: isDynamicIo\n", "dynamicIoEnabled: !!isDynamicIo\n"],
]);

// 6. export/index.js: publicRuntimeConfig undefined
patchFile("dist/export/index.js", [
  ["Object.keys(publicRuntimeConfig).length > 0", "Object.keys(publicRuntimeConfig || {}).length > 0"],
]);

if (major >= 16) {
  // Next 16: Turbopack distDirRoot must be absolute for Rust validation
  patchFile("dist/build/swc/index.js", [
    [
      "nextConfigSerializable.distDirRoot = normalizePathOnWindows(nextConfigSerializable.distDirRoot);",
      'nextConfigSerializable.distDirRoot = require("path").resolve(projectPath, normalizePathOnWindows(nextConfigSerializable.distDirRoot || ".next"));',
    ],
    [
      "nextConfigSerializable.distDir = normalizePathOnWindows(nextConfigSerializable.distDir);",
      'nextConfigSerializable.distDir = require("path").resolve(projectPath, normalizePathOnWindows(nextConfigSerializable.distDir || ".next"));',
    ],
  ]);
  patchFile("dist/esm/build/swc/index.js", [
    [
      "nextConfigSerializable.distDirRoot = normalizePathOnWindows(nextConfigSerializable.distDirRoot);",
      'nextConfigSerializable.distDirRoot = (await import("path")).resolve(projectPath, normalizePathOnWindows(nextConfigSerializable.distDirRoot || ".next"));',
    ],
    [
      "nextConfigSerializable.distDir = normalizePathOnWindows(nextConfigSerializable.distDir);",
      'nextConfigSerializable.distDir = (await import("path")).resolve(projectPath, normalizePathOnWindows(nextConfigSerializable.distDir || ".next"));',
    ],
  ]);
}

console.log("[patch-next] Done.");
