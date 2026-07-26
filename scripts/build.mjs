import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { cp, mkdir, readdir, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import process from "node:process";
import * as esbuild from "esbuild";

const projectRoot = resolve(new URL("../", import.meta.url).pathname);
const dist = join(projectRoot, "dist");
const serving = process.argv.includes("--serve");

async function listFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute, base));
    else files.push(absolute.slice(base.length + 1).replaceAll("\\", "/"));
  }
  return files;
}

async function build() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, "assets"), { recursive: true });

  await Promise.all([
    cp(join(projectRoot, "public"), dist, { recursive: true }),
    cp(join(projectRoot, "legal"), join(dist, "legal"), { recursive: true }),
    cp(join(projectRoot, "src", "index.html"), join(dist, "index.html"))
  ]);

  await esbuild.build({
    entryPoints: [join(projectRoot, "src", "app.ts")],
    outfile: join(dist, "assets", "app.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["safari16"],
    minify: true,
    legalComments: "none"
  });

  await esbuild.build({
    entryPoints: [join(projectRoot, "src", "styles", "app.css")],
    outfile: join(dist, "assets", "app.css"),
    bundle: true,
    minify: true,
    external: ["../fonts/*", "../assets/*"]
  });

  const filesBeforeWorker = await listFiles(dist);
  const hash = createHash("sha256");
  for (const file of filesBeforeWorker.sort()) {
    hash.update(file);
    hash.update(await readFile(join(dist, file)));
  }
  const version = hash.digest("hex").slice(0, 12);
  // Cache the directory URL itself as well as index.html. Chromium treats an
  // offline top-level navigation differently from an in-page fetch fallback;
  // a direct "/" cache hit keeps Pages and installed-file startup equivalent.
  const precache = ["./", ...filesBeforeWorker.map((file) => `./${file}`)];

  await esbuild.build({
    entryPoints: [join(projectRoot, "src", "service-worker.ts")],
    outfile: join(dist, "service-worker.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["safari16"],
    minify: true,
    legalComments: "none",
    define: {
      __CACHE_VERSION__: JSON.stringify(version),
      __PRECACHE_MANIFEST__: JSON.stringify(precache)
    }
  });

  console.log(`Built Rootstock ${version}: ${filesBeforeWorker.length + 1} files`);
}

await build();

if (serving) {
  const servedFiles = new Map(
    (await listFiles(dist)).map((file) => [`/${file}`, join(dist, file)])
  );
  servedFiles.set("/", join(dist, "index.html"));
  const mime = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".mp3": "audio/mpeg",
    ".png": "image/png",
    ".ttf": "font/ttf",
    ".webp": "image/webp",
    ".woff2": "font/woff2"
  };
  const server = createServer((request, response) => {
    let path;
    try {
      path = decodeURIComponent((request.url ?? "/").split("?")[0] ?? "/");
    } catch {
      response.writeHead(400).end("Bad request");
      return;
    }
    const absolute = servedFiles.get(path);
    if (!absolute) {
      response.writeHead(404).end("Not found");
      return;
    }
    const stream = createReadStream(absolute);
    stream.on("error", () => response.writeHead(404).end("Not found"));
    response.setHeader("Content-Type", mime[extname(absolute)] ?? "application/octet-stream");
    stream.pipe(response);
  });
  server.listen(4173, "127.0.0.1", () => {
    console.log("Local URL: http://127.0.0.1:4173");
  });
}
