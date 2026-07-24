// Inference root-coverage audit for items 6 & 7.
// Usage (from repo root):  node handoff/tools/audit_infer.js
//
// For every INFER_POOL word, checks whether each of its root-bearing parts is
// actually taught by some gate (present in that gate's quizRoots), using the app's
// own data + normRoot/rootForms logic (sandbox-evaluated, no browser). Classifies:
//   A. TRULY UNTAUGHT  - concept taught by no gate in any form (the real bug class)
//   B. LATE            - taught, but only in a gate AFTER the word's req
//   C. FORM-ONLY       - concept taught in time, only the surface form differs (fine)
// GOAL for Phase B: get categories A and B to zero (add roots / bump req).
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const re = /<script(\b[^>]*)>([\s\S]*?)<\/script>/gi;
let m, blocks = [];
while ((m = re.exec(html)) !== null) { if (!/\bsrc\s*=/.test(m[1] || '')) blocks.push(m[2]); }
const dataBlock = blocks[2]; // inline #3 = data + engine (contains LEVELS, INFER_POOL)

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
const suffix = `\n;try{__out.LEVELS=LEVELS;__out.INFER=INFER_POOL;}catch(e){__out.err=e.message;}`;
try { vm.runInContext(dataBlock + suffix, sandbox, { filename: 'data-block' }); }
catch (e) { console.log('BLOCK RUN ERROR:', e.message); }
const O = sandbox.__out;
if (!O.LEVELS || !O.INFER) { console.log('extraction failed', O.err); process.exit(1); }
const { LEVELS, INFER } = O;

// exact copies of the app's helpers (index.html: normRoot / rootForms)
const normRoot = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
const rootForms = (r) => r.root.split(/[\/,]/).map(x => x.trim()).filter(Boolean);

const taught = new Set(), taughtOwner = {};
const STOP = new Set(['to','of','the','a','an','one','who','or','and','in','on','by','for','esp','via','from','with','as','it','that']);
const tokens = (g) => (g || '').toLowerCase().split(/[^a-z]+/).map(w => w.replace(/(ing|s|ed|e)$/, '')).filter(w => w.length >= 3 && !STOP.has(w));
const taughtConcept = new Set(), conceptOwner = {};
LEVELS.forEach((lv, gi) => (lv.quizRoots || []).forEach(r => {
  rootForms(r).map(normRoot).filter(f => f.length > 1).forEach(f => { taught.add(f); if (taughtOwner[f] === undefined) taughtOwner[f] = gi; });
  tokens(r.gloss).forEach(t => { taughtConcept.add(t); if (conceptOwner[t] === undefined) conceptOwner[t] = gi; });
}));
const isTaught = (pf) => {
  if (taught.has(pf)) return taughtOwner[pf];
  for (const f of taught) if ((f.length >= 3 && pf.startsWith(f)) || (pf.length >= 3 && f.startsWith(pf))) return taughtOwner[f];
  return -1;
};
const conceptOwnerOf = (gloss) => {
  let best = -1;
  tokens(gloss).forEach(t => {
    let o = taughtConcept.has(t) ? conceptOwner[t] : -1;
    if (o === -1) for (const ct of taughtConcept) if (t.length >= 4 && (ct.startsWith(t) || t.startsWith(ct))) { o = conceptOwner[ct]; break; }
    if (o !== -1 && (best === -1 || o < best)) best = o;
  });
  return best;
};
const AFFIX = new Set(['ist','er','or','y','ic','ical','al','ation','ition','tion','ion','ate','ity','ism','ous','ary','ory','ent','ant','ia','ish','ize','ise','ly','ness','ment','age','ure','ble','able','ible']);

const A = [], B = [], C = [];
INFER.forEach(w => {
  const un = [], la = [], fo = [];
  (w.parts || []).forEach(p => {
    const form = normRoot(p[0]), gloss = (p[1] || '').trim();
    if (form.length < 3 || AFFIX.has(form) || gloss === '') return;
    const fO = isTaught(form), cO = conceptOwnerOf(gloss);
    if (fO === -1 && cO === -1) { un.push(`${p[0]} (${gloss})`); return; }
    const owner = [fO, cO].filter(o => o !== -1).sort((a, b) => a - b)[0];
    if (owner > w.req) { la.push(`${p[0]} (${gloss}) taught@${owner}>req${w.req}`); return; }
    if (fO === -1) fo.push(`${p[0]} (${gloss}) concept@${cO}`);
  });
  if (un.length) A.push({ word: w.word, req: w.req, un });
  if (la.length) B.push({ word: w.word, req: w.req, la });
  if (fo.length && !un.length && !la.length) C.push({ word: w.word, req: w.req, fo });
});
console.log(`INFER words: ${INFER.length}; taught forms: ${taught.size}; concepts: ${taughtConcept.size}.`);
console.log(`\n=== A. TRULY UNTAUGHT (fix: add root to a gate <= req): ${A.length} ===`);
A.forEach(p => console.log(`  ${p.word} (req ${p.req}) - ${p.un.join('; ')}`));
console.log(`\n=== B. LATE (fix: bump req or move root earlier): ${B.length} ===`);
B.forEach(p => console.log(`  ${p.word} (req ${p.req}) - ${p.la.join('; ')}`));
console.log(`\n=== C. FORM-ONLY (concept taught in time; acceptable): ${C.length} ===`);
C.forEach(p => console.log(`  ${p.word} (req ${p.req}) - ${p.fo.join('; ')}`));
process.exit(A.length + B.length ? 1 : 0);
