// Definition / multiple-choice answer-length analyzer for item 10.
// Usage (from repo root):  node handoff/tools/corpus_length.js
//
// Reports, per word pool, how often the correct definition is the longest/tied option
// (chance ~= 25% for a 4-option set), average lengths, the worst "correct stands out"
// offenders, and the shortest definitions. Also dumps the full root corpus for review.
// ACCEPTANCE for Phase B item 10: no pool shows "correct longest" above ~30-35%.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = __dirname;

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const re = /<script(\b[^>]*)>([\s\S]*?)<\/script>/gi;
let m, blocks = [];
while ((m = re.exec(html)) !== null) { if (!/\bsrc\s*=/.test(m[1] || '')) blocks.push(m[2]); }
const dataBlock = blocks[2];

const noop = () => {};
const elStub = new Proxy({}, { get: () => noop });
const sandbox = {
  console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Set, Map,
  isNaN, parseInt, parseFloat, Intl, Symbol, Promise, encodeURIComponent, decodeURIComponent,
  setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0,
  localStorage: { getItem: () => null, setItem: noop, removeItem: noop },
  location: { search: '', href: '', hash: '' }, navigator: { language: 'en', userAgent: '' },
  history: { replaceState: noop, pushState: noop },
  matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop }),
  requestAnimationFrame: () => 0, __out: {},
};
sandbox.document = {
  querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
  addEventListener: noop, createElement: () => elStub, body: elStub, head: elStub,
  documentElement: { classList: { toggle: noop, add: noop, remove: noop, contains: () => false }, setAttribute: noop, style: {} },
};
sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.self = sandbox;
vm.createContext(sandbox);
for (const f of ['drill.js', 'depth.js', 'rootdeep.js']) {
  try { vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f }); }
  catch (e) { console.log('load err', f, e.message); }
}
const suffix = `\n;try{__out.LEVELS=LEVELS;__out.INFER=INFER_POOL;__out.ETYM=ETYM;}catch(e){__out.err=e.message;}`;
try { vm.runInContext(dataBlock + suffix, sandbox, { filename: 'data-block' }); }
catch (e) { console.log('BLOCK ERR:', e.message); }
const O = sandbox.__out;
const { LEVELS, INFER, ETYM } = O;
const DRILL = sandbox.DRILL_POOL || [];
const ROOT_DEEP = sandbox.ROOT_DEEP || {};
if (!LEVELS || !INFER) { console.log('extract failed', O.err); process.exit(1); }

function analyze(name, words) {
  let n = 0, correctLongest = 0, sumDef = 0, sumDis = 0, disN = 0;
  const offenders = [], shortDefs = [];
  words.forEach(w => {
    if (!w.def || !Array.isArray(w.distractors) || !w.distractors.length) return;
    n++;
    const dl = w.def.length, dis = w.distractors.map(d => d.length), maxDis = Math.max(...dis);
    sumDef += dl; sumDis += dis.reduce((a, b) => a + b, 0); disN += dis.length;
    if (dl >= maxDis) correctLongest++;
    offenders.push({ word: w.word, dl, maxDis, margin: dl - maxDis, def: w.def });
    if (dl <= 34) shortDefs.push({ word: w.word, dl, def: w.def });
  });
  offenders.sort((a, b) => b.margin - a.margin);
  shortDefs.sort((a, b) => a.dl - b.dl);
  return { name, n, correctLongest, pct: Math.round(100 * correctLongest / n), avgDef: Math.round(sumDef / n), avgDis: Math.round(sumDis / disN), offenders, shortDefs };
}

const gateWords = [];
LEVELS.forEach(l => l.words.forEach(w => gateWords.push(w)));
const groups = [analyze('GATES (REC)', gateWords), analyze('INFER_POOL', INFER), analyze('DRILL_POOL', DRILL)];

let rep = '# item 10 - definition & answer-length analysis\n\n';
groups.forEach(g => {
  rep += `## ${g.name}  (n=${g.n})\n- correct longest/tied: ${g.correctLongest}/${g.n} = ${g.pct}%\n- avg def ${g.avgDef} vs avg distractor ${g.avgDis}\n- top offenders (margin = def - longest distractor):\n`;
  g.offenders.slice(0, 15).forEach(o => rep += `    +${o.margin}  ${o.word}  (def ${o.dl} vs max-dis ${o.maxDis}) - "${o.def}"\n`);
  rep += `- shortest definitions (lengthen candidates):\n`;
  g.shortDefs.slice(0, 15).forEach(o => rep += `    ${o.dl}  ${o.word} - "${o.def}"\n`);
  rep += '\n';
});
fs.writeFileSync(path.join(OUT, 'length_report.md'), rep);

const seen = new Set();
let roots = '# Root corpus (gloss | ETYM | ROOT_DEEP?)\n\n';
LEVELS.forEach((l, gi) => l.roots.forEach(r => {
  if (seen.has(r.root)) return; seen.add(r.root);
  roots += `[G${gi} ${r.lang}] ${r.root}  ::  ${r.gloss}\n`;
  if (ETYM[r.root]) roots += `    ETYM: ${ETYM[r.root]}\n`;
  if (ROOT_DEEP[r.root]) roots += `    DEEP: yes\n`;
}));
roots += `\nTotal distinct gate roots: ${seen.size}\n`;
fs.writeFileSync(path.join(OUT, 'root_corpus.txt'), roots);

console.log('Wrote length_report.md and root_corpus.txt to', OUT);
groups.forEach(g => console.log(`  ${g.name}: correct-longest ${g.pct}%  (avg def ${g.avgDef} vs dis ${g.avgDis})`));
