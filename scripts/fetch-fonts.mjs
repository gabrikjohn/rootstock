import { mkdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const familyQuery = "family=Hanken+Grotesk:wght@400;500;600;700"
  + "&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500"
  + "&family=IBM+Plex+Mono:wght@400;500"
  + "&family=IM+Fell+English:ital@0;1"
  + "&family=IM+Fell+English+SC"
  + "&family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,500"
  + "&family=Spectral:ital,wght@0,400;0,500;0,600;1,400"
  + "&display=swap";
const cssUrl = `https://fonts.googleapis.com/css2?${familyQuery}`;
const root = resolve(new URL("../", import.meta.url).pathname);
const fontDirectory = resolve(root, "public", "fonts");
await mkdir(fontDirectory, { recursive: true });

const cssResponse = await fetch(cssUrl);
if (!cssResponse.ok) throw new Error(`Google Fonts CSS failed: ${cssResponse.status}`);
let css = await cssResponse.text();
const urls = [...new Set([...css.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((match) => match[1]))];

for (const url of urls) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font download failed: ${response.status} ${url}`);
  const filename = basename(new URL(url).pathname);
  await writeFile(resolve(fontDirectory, filename), Buffer.from(await response.arrayBuffer()));
  css = css.replaceAll(url, `../fonts/${filename}`);
}

await writeFile(resolve(root, "src", "styles", "fonts.css"), css);
console.log(`Self-hosted ${urls.length} font files.`);
