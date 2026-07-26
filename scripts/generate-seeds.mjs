import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import * as esbuild from "esbuild";

const root = resolve(new URL("../", import.meta.url).pathname);
const result = await esbuild.build({
  stdin: {
    contents: `
      import { LEVELS, DRILL_POOL, INFER_POOL } from "./src/content/index.ts";
      import { ROOT_PRONUNCIATION_SEEDS } from "./src/content/root-pronunciation-seeds.ts";
      export { LEVELS, DRILL_POOL, INFER_POOL, ROOT_PRONUNCIATION_SEEDS };
    `,
    resolveDir: root,
    sourcefile: "seed-content.ts",
    loader: "ts"
  },
  bundle: true,
  platform: "node",
  format: "esm",
  write: false
});

const encoded = Buffer.from(result.outputFiles[0].contents).toString("base64");
const content = await import(`data:text/javascript;base64,${encoded}`);
const words = [
  ...content.LEVELS.flatMap((gate) => gate.words.map((word) => word.word)),
  ...content.INFER_POOL.map((word) => word.word),
  ...content.DRILL_POOL.map((word) => word.word)
];
const uniqueWords = [...new Set(words.map((word) => word.toLowerCase()))].sort();

const uniqueRoots = content.ROOT_PRONUNCIATION_SEEDS;

const outputs = new Map([
  ["words.json", `${JSON.stringify(uniqueWords, null, 2)}\n`],
  ["roots.json", `${JSON.stringify(uniqueRoots, null, 2)}\n`]
]);

if (process.argv.includes("--check")) {
  for (const [filename, expected] of outputs) {
    const actual = await readFile(resolve(root, filename), "utf8");
    if (actual !== expected) {
      throw new Error(`${filename} is stale; run npm run generate:seeds`);
    }
  }
  console.log(`Verified ${uniqueWords.length} word seeds and ${uniqueRoots.length} root seeds.`);
} else {
  for (const [filename, value] of outputs) {
    await writeFile(resolve(root, filename), value);
  }
  console.log(`Generated ${uniqueWords.length} word seeds and ${uniqueRoots.length} root seeds.`);
}
