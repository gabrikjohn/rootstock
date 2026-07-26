import { access, readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";

const root = resolve(new URL("../", import.meta.url).pathname);
const forbiddenPaths = [
  "START HERE.html",
  "depth.js",
  "drill.js",
  "generate_pronunciations.py",
  "handoff",
  "index.html",
  "ipa.js",
  "pronunciations.js",
  "rootdeep.js",
  "roots_pronunciations.json",
  "service-worker.js",
  "store/App Store Listing.html",
  "store/Developer Handoff.html",
  "store/Launch To-Do.html",
  "src/styles/legacy-base.css"
];
const scanRoots = [
  ".github",
  "ios",
  "legal",
  "scripts",
  "src",
  "tests",
  "ARCHITECTURE.md",
  "NATIVE.md",
  "README.md",
  "RELEASE.md",
  "package.json"
];
const textExtensions = new Set([
  ".css", ".html", ".js", ".json", ".md", ".mjs", ".pbxproj", ".swift", ".ts", ".tsx", ".xml", ".yml", ".yaml"
]);
const failures = [];

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function collect(path) {
  const absolute = join(root, path);
  const entries = await readdir(absolute, { withFileTypes: true }).catch(() => null);
  if (!entries) return [path];
  const files = [];
  for (const entry of entries) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await collect(child));
    else files.push(child);
  }
  return files;
}

for (const path of forbiddenPaths) {
  if (await exists(join(root, path))) failures.push(`obsolete path still exists: ${path}`);
}

for (const scanRoot of scanRoots) {
  for (const path of await collect(scanRoot)) {
    if (!textExtensions.has(extname(path)) && !["package.json"].includes(path)) continue;
    const text = await readFile(join(root, path), "utf8");
    if (/@ts-(?:nocheck|ignore|expect-error)/.test(text)) {
      failures.push(`TypeScript suppression remains in ${path}`);
    }
    if (/\[(?:PLACEHOLDER|CONTACT_EMAIL|DEVELOPER \/ COMPANY LEGAL NAME|EFFECTIVE DATE|DATE\]|GOVERNING LAW|YEAR\])/.test(text)) {
      failures.push(`release placeholder remains in ${path}`);
    }
  }
}

if (failures.length) {
  throw new Error(`Repository policy failed:\n- ${failures.join("\n- ")}`);
}

console.log("Repository has one supported source/build path and no release placeholders.");
