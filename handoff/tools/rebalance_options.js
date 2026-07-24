#!/usr/bin/env node
// Content-first, guarded answer rebalance for HANDOFF item 10.
// Replaces each thin foil with a complete definition of a competing word from the
// same teaching group. This preserves real near-misses without artificial padding.
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const blocks = [...html.matchAll(/<script(\b[^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m => !/\bsrc\s*=/.test(m[1] || '')).map(m => m[2]);
const noop = () => {};
const el = new Proxy({}, { get: () => noop });
const sandbox = { console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Set, Map,
  localStorage:{getItem:()=>null,setItem:noop}, location:{search:''}, navigator:{language:'en'},
  document:{querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener:noop,createElement:()=>el,body:el,head:el,documentElement:{classList:{toggle:noop,add:noop,remove:noop},style:{}}},
  setTimeout:()=>0,clearTimeout:noop,setInterval:()=>0,matchMedia:()=>({matches:false}),requestAnimationFrame:()=>0,__out:{} };
sandbox.window=sandbox; sandbox.globalThis=sandbox; sandbox.self=sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'drill.js'), 'utf8'), sandbox, {filename:'drill.js'});
vm.runInContext(blocks[2]+';__out={LEVELS,INFER_POOL};', sandbox, {filename:'index-data'});
const { LEVELS, INFER_POOL } = sandbox.__out;
const DRILL_POOL = sandbox.DRILL_POOL;
const EXPLICIT = {
  'index.html': {
    optician:["One who measures vision and writes prescriptions.","An eye physician licensed to perform surgery.","A specialist who tests hearing and balance."],
    congenital:["Acquired later through illness, injury, or exposure.","Passed down genetically from a parent before birth.","Developing gradually over many years of life."],
    biopsy:["Examination of tissue taken after death.","A written account of a person's life.","The laboratory study of living tissue."]
  },
  'drill.js': {
    nonpareil:["A close and worthy second.","A promising but unproven talent.","A jack of all trades, master of none."]
  }
};

const tokens = s => new Set((s || '').toLowerCase().split(/[^a-z]+/).filter(x => x.length > 2));
const overlap = (a, b) => { const A=tokens(a), B=tokens(b); let n=0; A.forEach(t=>{if(B.has(t)) n++;}); return n; };
const choose = (word, candidates) => {
  const target=[word.def.length+2, word.def.length-1, word.def.length-4];
  const source=(word.distractors||[]).join(' ');
  const chosen=[];
  for(let slot=0;slot<3;slot++){
    let choices=candidates.filter(c=>c.word!==word.word&&!chosen.includes(c.word)&&c.def);
    if(slot===0){ const longer=choices.filter(c=>c.def.length>word.def.length); if(longer.length) choices=longer; }
    choices.sort((a,b)=>{
      const sa=Math.abs(a.def.length-target[slot])*10-overlap(source,a.def)*3;
      const sb=Math.abs(b.def.length-target[slot])*10-overlap(source,b.def)*3;
      return sa-sb || a.word.localeCompare(b.word);
    });
    if(!choices.length) throw new Error(`No foil candidates for ${word.word}`);
    chosen.push(choices[0].word);
  }
  return chosen.map(name=>candidates.find(c=>c.word===name).def);
};

const plans=[];
const replacementFor = (file, word, candidates) => (EXPLICIT[file] && EXPLICIT[file][word.word]) || choose(word,candidates);
LEVELS.forEach(level=>level.words.forEach(word=>plans.push({file:'index.html',word,replacements:replacementFor('index.html',word,level.words)})));
const inferAll=INFER_POOL;
INFER_POOL.forEach(word=>{
  const local=inferAll.filter(x=>x.req===word.req);
  plans.push({file:'index.html',word,replacements:replacementFor('index.html',word,local.length>=4?local:inferAll)});
});
DRILL_POOL.forEach(word=>{
  const local=DRILL_POOL.filter(x=>x.req===word.req);
  plans.push({file:'drill.js',word,replacements:replacementFor('drill.js',word,local.length>=4?local:DRILL_POOL)});
});

function arrayEnd(source, open){
  if(source[open]!=='[') throw new Error(`Expected array at offset ${open}`);
  let depth=0, quoted=false, escaped=false;
  for(let i=open;i<source.length;i++){
    const ch=source[i];
    if(quoted){
      if(escaped){ escaped=false; continue; }
      if(ch==='\\'){ escaped=true; continue; }
      if(ch==='"') quoted=false;
      continue;
    }
    if(ch==='"'){ quoted=true; continue; }
    if(ch==='['){ depth++; continue; }
    if(ch===']' && --depth===0) return i+1;
  }
  throw new Error(`Unclosed array at offset ${open}`);
}

const files=new Map([['index.html', html], ['drill.js', fs.readFileSync(path.join(ROOT,'drill.js'),'utf8')]]);
for(const plan of plans){
  let out=files.get(plan.file);
  const marker=`{word:${JSON.stringify(plan.word.word)}`;
  const objectStart=out.indexOf(marker);
  if(objectStart<0 || out.indexOf(marker,objectStart+marker.length)>=0) throw new Error(`Guard failed for ${plan.file}:${plan.word.word}`);
  const objectEnd=out.indexOf('\n',objectStart);
  const fieldStart=out.indexOf('distractors:[',objectStart);
  if(fieldStart<0 || (objectEnd>=0 && fieldStart>objectEnd)) throw new Error(`Missing distractors for ${plan.file}:${plan.word.word}`);
  const open=fieldStart+'distractors:'.length;
  const fieldEnd=arrayEnd(out,open);
  const replacement=`distractors:[${plan.replacements.map(JSON.stringify).join(',')}]`;
  files.set(plan.file,out.slice(0,fieldStart)+replacement+out.slice(fieldEnd));
}
for(const [file, out] of files) fs.writeFileSync(path.join(ROOT,file),out);
console.log(`Rebalanced ${plans.length} items with full competing definitions.`);
