// Syntax-check every inline (non-src) <script> block in index.html without a browser.
// Usage (from repo root):  node handoff/tools/check_syntax.js
// Exits non-zero if any inline script fails to parse. Run after every edit to index.html.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const re = /<script(\b[^>]*)>([\s\S]*?)<\/script>/gi;
let m, i = 0, failures = 0;
while ((m = re.exec(html)) !== null) {
  const attrs = m[1] || '';
  if (/\bsrc\s*=/.test(attrs)) continue; // external file, skip
  i++;
  const code = m[2];
  const startLine = html.slice(0, m.index).split('\n').length;
  try {
    new vm.Script(code, { filename: `inline-script-${i}@line${startLine}` });
    console.log(`OK   inline #${i} (starts ~line ${startLine}, ${code.length} chars)`);
  } catch (e) {
    failures++;
    console.log(`FAIL inline #${i} (starts ~line ${startLine}): ${e.message}`);
  }
}
console.log(`\n${i} inline scripts checked, ${failures} failed.`);
process.exit(failures ? 1 : 0);
