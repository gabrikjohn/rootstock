import { AFFIX_DEEP, COGNATES, CONFUSABLES, DEPTH, DRILL_POOL, ETYM, INFER_POOL, LEVELS, ROOT_DEEP, SHIFT_KINDS, SHIFT_LABELS, SIMILARS, SIMILAR_GLOSSES } from "../content";
import { avoidRepeat as avoidRepeatItems, requeueMiss as requeueMissItems, roman, shuffle as shuffleValues } from "../domain/collections";
import { deserializeQuizItem, serializeQuizItem } from "../domain/bookmarks";
import { ContentCatalog } from "../domain/catalog";
import { pickConfusables } from "../domain/confusables";
import {
  pickForgeModes,
  reangleForgeItem,
  trialReworkModes,
  weakWords as selectWeakWords
} from "../domain/forge";
import {
  caliber as calculateCaliber,
  chooseDrillMode,
  drillFoils as selectDrillFoils,
  literalReading,
  maskEtymology,
  MODE_SHIFT,
  pickKin,
  sharedPrefixLength,
  sigmoid,
  updateAbility
} from "../domain/drill";
import { scoreDistractors } from "../domain/distractors";
import { selectLexiconEntries } from "../domain/lexicon";
import { deserializeProgress, serializeProgress } from "../domain/persistence";
import { canAccessGate, temperUnlock as calculateTemperUnlock } from "../domain/progression";
import { normalizeRoot, rootForms as getRootForms, rootMatches } from "../domain/roots";
import type { DocketSummary } from "../domain/scheduling";
import { DOCKET_RELEASE_HOUR, DOCKET_ROOT_TIERS, DOCKET_WORD_TIERS, docketBlocks, docketCleared, docketRelease, docketSittingSize, docketSummary, initialReview, retiresFromDocket, scheduleReview, selectDocketSitting, tierOf } from "../domain/scheduling";
import { BAR_FORMS, barComposition, buildBarItems, buildTrialOneItems, selectInference } from "../domain/sessions";
import type { AppDependencies } from "../platform/contracts";
import { ProgressStore } from "../platform/progress-store";
import { renderOnboarding, renderPaywall } from "./features/access-screens";
import {
  AppearanceController,
  currentAppearance,
  normalizeAppearance,
  previewFlag
} from "./features/appearance-controller";
import { renderRootAudio, renderWordAudio } from "./features/audio-controls";
import { renderDrillIntro, renderDrillMenu, updateDrillMeta } from "./features/drill-screens";
import { EntitlementController } from "./features/entitlement-controller";
import {
  renderRootDrillScreen,
  renderRootsScreen,
  renderSealScreen,
  renderSealedGateScreen,
  renderStudyReviewScreen,
  renderStudyScreen,
  renderTemperScreen
} from "./features/gate-screens";
import { renderHome } from "./features/home-screen";
import type { HomeCardStatus, HomeDrillStat, HomeGateCard, HomeSession } from "./features/home-screen";
import {
  renderLexiconDetailScreen,
  renderRootDetailScreen,
  renderRootLexiconScreen,
  renderWordLexiconScreen
} from "./features/lexicon-screens";
import {
  applyPredictionVeil,
  applyRootLearningPrompt,
  wireChoices as wirePromptChoices
} from "./features/prompt-interactions";
import { buildPromptView } from "./features/prompt-view";
import { installDeepDisclosure, installGhostDefinitions, posTag, renderStudyCard } from "./features/study-card";
import type { StudyCardWord } from "./features/study-card";
import { renderTrialScreen, wireComposeInteraction, wireTypedInteraction } from "./features/trial-screen";
import { showBackupModal, showRestoreModal } from "./features/progress-modals";
import { appearanceName, renderSettings } from "./features/settings-screen";
import type {
  ConfusablePair,
  DrillWord,
  InferenceWord,
  Root,
  Word,
  WordPart
} from "../types/content";
import type {
  DrillHistory,
  FocusDefinition,
  FocusDrillSessionState,
  FocusEntry,
  FocusId,
  GateProgress,
  ProgressMark,
  ProgressV2,
  QuizItem,
  QuizMode,
  SerializedQuizItem,
  SessionState
} from "../types/state";
import type { SealScreenOptions } from "./features/gate-screens";

export function startAppRuntime(deps: AppDependencies): void {

const mount = document.getElementById('app');
  if(!mount) throw new Error('Rootstock app mount was not found');
  const app: HTMLElement = mount;
  deps.audio.install();
  installGhostDefinitions();
  installDeepDisclosure();
// Tempering unlocks after a night's sleep: first 4 AM local strictly after (t1 + 8h floor).
const TEMPER_MIN_MS = 8 * 60 * 60 * 1000, TEMPER_WAKE_HR = 4;
function temperUnlock(t1:number):number{
  return calculateTemperUnlock(t1, TEMPER_MIN_MS, TEMPER_WAKE_HR);
}
// 30% of the Bar is now never-taught material, up from 20%, so the pass mark comes down:
// 45/50 was calibrated against an exam that was four-fifths recall.
const BAR_SIZE = 50, BAR_PASS = 40;
const DAY = 24*60*60*1000;

const appearanceController = new AppearanceController(deps.random, deps.storage);
const progressStore = new ProgressStore(deps.storage);
const catalog = new ContentCatalog(LEVELS,DRILL_POOL,DEPTH,ROOT_DEEP,ETYM,COGNATES);
const validAppearance = normalizeAppearance;
function load():ProgressV2{ const p=progressStore.load(); p.appearance=validAppearance(p.appearance); return p; }
function stageBar(frac:number):string{ const pct=Math.round(Math.min(1,Math.max(0,frac))*100); return `<div class="sbar"><div class="sfill" style="width:${pct}%"></div></div>`; }
// gated inference sampling: eligible only once the roots are ESTABLISHED, fresh-first.
// f.req is the index of the gate that teaches the enabling root(s); we require that
// gate to be SEALED, not merely reached. The old test (f.req<=idx) admitted words
// whose req equalled the current gate — roots first met minutes earlier in this very
// sitting, not yet drilled — so inference became a guessing game instead of deduction
// from blocks already learned. Requiring the gate sealed keeps every inference word
// buildable from roots the learner has actually locked in.
function inferPick(idx:number,n:number):InferenceWord[]{
  return selectInference(INFER_POOL, LEVELS, P.gates, P.seenInfer, idx, n, deps.random);
}
// normalized root-token set per gate (cached) — for affinity-scored review
const _grk:Record<number,Set<string>>={};
function gateRootKeys(gi:number):Set<string>{
  if(!_grk[gi]){ const s=new Set<string>();
    LEVELS[gi]!.roots.forEach(r=>r.root.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .split(/[^a-z]+/).forEach(t=>{ if(t.length>2) s.add(t); }));
    _grk[gi]=s; }
  return _grk[gi];
}
// sitting-scoped fill: cleared items over (cleared + remaining this sitting)
function sitBar(){ if(!S||S.sit===undefined) return stageBar(0);
  const remaining = S.queue.length + S.sit.ahead;   // ahead = fixed size of stages not yet entered
  return stageBar(S.sit.cleared/(S.sit.cleared+remaining || 1)); }

function save():void{ progressStore.save(P); }
let P:ProgressV2 = load();
function G(id:number):GateProgress{ if(!P.gates[id]) P.gates[id]={t1:0,sealed:false}; return P.gates[id]!; }
function rom(n:number):string{ return String(roman(n)); }
function shuffle<T>(a:readonly T[]):T[]{ return shuffleValues(a,deps.random); }
// A stable identity for a quiz item, so the same word/root is never served twice
// in a row (even from a different angle or as a penalty rep).
function itemKey(it:QuizItem|null|undefined):string{
  if(!it) return '';
  if(it.m==='PAIR') return 'p:'+(it.pair&&it.pair.ans);
  if(it.m==='INFER') return 'i:'+(it.inf&&it.inf.word);
  if(it.root) return 'r:'+(it.root.key||it.root.root||it.root);
  if(it.gi!=null&&it.wi!=null) return 'w:'+it.gi+':'+it.wi;
  return String(it.m||'');
}
// If the queue head repeats the just-served key, pull the first differing item
// forward. No-op when nothing else is left (unavoidable at the very end).
function avoidRepeat<T>(q:T[],lastKey:string|null|undefined,keyOf:(item:T)=>string):void{
  avoidRepeatItems(q,lastKey,keyOf);
}
// Re-insert a missed item plus one penalty rep, spaced apart so neither is served
// back-to-back with the other (avoidRepeat handles any residual adjacency).
function requeueMiss<T>(q:T[],item:T,penalty:T):void{
  requeueMissItems(q,item,penalty);
}
// A root's origin note for reveals: the deep-study line, falling back to the terse etym.
function rootEtymNote(r:Root):string{ return catalog.rootEtymology(r); }
function similarRootNote(r:Root):string{
  const similars=SIMILARS as Readonly<Record<string,readonly string[]>>;
  const glosses=SIMILAR_GLOSSES as Readonly<Record<string,string>>;
  const named=similars[r.root]||rootForms(r).flatMap(f=>similars[f]||[]);
  if(!named.length) return '';
  const roots=LEVELS.flatMap(l=>l.quizRoots||[]);
  const items=[...new Set(named)].map(name=>{
    const other=roots.find(x=>x.root===name||rootForms(x).some(f=>normRoot(f)===normRoot(name)));
    const gloss=other?other.gloss:(glosses[name]||'');
    return `${esc(name)}${gloss?` (${esc(gloss)})`:''}`;
  });
  return items.length?`<span class="fb-line fb-ety">Don't confuse with — ${items.join(' · ')}</span>`:'';
}
// The teaching block for an inference word, shown on both correct and wrong answers:
// how its pieces compose (English glosses) and the classical roots behind them, so
// the feedback explains the inference instead of merely restating the definition.
function inferDeep(inf:InferenceWord|null|undefined):string{
  if(!inf) return '';
  const morph = inf.parts.map(p=>p[1]?`${p[0]} (${p[1]})`:p[0]).join(' + ');
  let d=`<span class="fb-line fb-parts">${esc(morph)}</span>`;
  if(inf.roots) d+=`<span class="fb-line fb-ety">${esc(inf.roots)}</span>`;
  return d;
}
function esc(s:string):string{ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
function rootHint(w:Word|DrillWord):string{ return w.parts.filter(p=>p[1]).map(p=>p[0]+'='+p[1]).join('  ·  '); }
// Wrong headwords for a word-choice prompt. The old rule took three at random from the
// target's own gate, so ten words made a small, quickly-memorised pool and elimination beat
// meaning. Now the whole taught corpus competes and the nearest are chosen: same root
// family first, then shared morphemes and authored near-twins, with same part of speech
// required throughout.
function wordFoils(w:Word|DrillWord,gi:number|undefined,count:number):string[]{
  const pool:(Word|DrillWord)[]=[];
  LEVELS.forEach((l,i)=>{ if(G(l.id).sealed||i===gi) pool.push(...l.words); });
  pool.push(...drillWords());
  const family=new Set(catalog.rootFamily({root:w.parts.map(p=>p[0]).join(' / '),lang:'',gloss:''},12).map(x=>x.word));
  return scoreDistractors({
    target:w,candidates:pool,count,random:deps.random,family,
    similars:SIMILARS,...(gi===undefined?{}:{gate:gi}),gateOf:x=>gateIdxOfWord(x.word)
  }).map(x=>x.word);
}
// Option text → part of speech, keyed by both headword and definition so the same lookup
// serves word-choice and meaning-choice prompts. Built once; the corpus is immutable.
let _posIndex:Map<string,string>|null=null;
function posOf(text:string):string|null{
  if(!_posIndex){
    _posIndex=new Map();
    const add=(w:{word:string;def:string;pos?:string})=>{ if(!w.pos) return;
      _posIndex!.set(w.word,w.pos); _posIndex!.set(w.def,w.pos); };
    LEVELS.forEach(l=>l.words.forEach(add)); INFER_POOL.forEach(add); DRILL_POOL.forEach(add);
  }
  return _posIndex.get(text)??_posIndex.get(text.replace(/^[“"]|[”"]$/g,''))??null;
}
function vigOf(w:Word|DrillWord):string{ return catalog.vignette(w); }
function etyOf(w:Word|DrillWord):string{ return catalog.wordEtymology(w); }
// The sense-shift pair. Gate words file both in DEPTH, so every consumer goes through the
// catalog rather than reading the word — the same arrangement the vignette already uses.
function wasOf(w:Word|DrillWord):string{ return catalog.wordFormerSense(w); }
function shiftLabelOf(w:Word|DrillWord):string{
  const kind=catalog.wordShiftKind(w);
  return kind?SHIFT_LABELS[kind]:'';
}
function defOfWord(name:string):string{ return catalog.definition(name); }
// Words already learned that are built from a given root. Authored cognates win;
// otherwise use the conservative shared-form match, never a gloss coincidence.
function rootFamily(r:Root,lim?:number){
  return catalog.rootFamily(r,lim||4);
}
// Locate a headword within the gates by name → {gi,wi}, or null if it lives
// only in the drill pool (or nowhere).
function wordLoc(name:string){
  return catalog.locateWord(name);
}
// The deeper-study panel for a root: a richer origin note (ROOT_DEEP, falling back
// to the terse ETYM line) plus the words it grows into. Shown when "Learn more" is on.
function rootDeepHtml(r:Root):string{
  let out='';
  const note=rootEtymNote(r);
  if(note) out+=`<span class="fb-line fb-ety">${note}</span>`;
  const fam=rootFamily(r);
  if(fam.length){
    const list=fam.map(k=> k.def?`<b>${k.word}</b> — ${esc(k.def).toLowerCase().replace(/\.$/,'')}`:`<b>${k.word}</b>`).join('  ·  ');
    out+=`<span class="fb-line fb-grow">Grows into — ${list}</span>`;
  }
  return out;
}
function letterCue(word:string):string{ return (word[0]??'') + word.slice(1).replace(/[^ ]/g,'·'); }
function allSealed():boolean{ return LEVELS.every(l=>G(l.id).sealed); }
function fmtDur(ms:number):string{ const h=Math.floor(ms/3600000),m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000); return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); }
function fmtDays(ms:number):string{ const d=ms/DAY; return d>=1 ? Math.round(d)+'d' : fmtDur(ms); }
function gateAt(index:number){ const gate=LEVELS[index]; if(!gate) throw new Error(`Missing gate ${index}`); return gate; }
function wordAt(gi:number,wi:number):Word{ const word=LEVELS[gi]?.words[wi]; if(!word) throw new Error(`Missing word ${gi}-${wi}`); return word; }
function requiredButton(id:string):HTMLButtonElement{
  const button=document.getElementById(id);
  if(!(button instanceof HTMLButtonElement)) throw new Error(`Missing button #${id}`);
  return button;
}
function tallyKey(k:string,ok:boolean):void{ const t=P.ledger[k]||(P.ledger[k]={r:0,w:0}); ok?t.r++:t.w++; save(); }
function tally(gi:number,wi:number,ok:boolean):void{ tallyKey(gi+'-'+wi,ok); }
function gateIdxOfWord(name:string):number{ for(let gi=0;gi<LEVELS.length;gi++){ const wi=LEVELS[gi]!.words.findIndex(w=>w.word.toLowerCase()===name.toLowerCase()); if(wi>=0) return gi; } return -1; }
// Intelligent near-twin sampling. Mirrors inferPick's fresh-first logic so the
// same twins don't recur every sitting: unseen-this-cycle pairs come first, and
// within that set the ones the learner has gotten wrong are weighted up. When the
// eligible pool has all been seen, the cycle resets and repeats resume — varied,
// not fixed. seenPair is stamped as each pair is served (see renderTrialPrompt).
function pairPick(maxGi:number, n:number):ConfusablePair[]{
  return pickConfusables({
    pairs:CONFUSABLES,gates:LEVELS,ledger:P.ledger,seen:P.seenPair,
    maxGateIndex:maxGi,count:n,random:deps.random,onCycleReset:save
  });
}

/* ---- Review Docket (Leitner) ---- */
// The retrieval banks live in src/domain/scheduling.ts, where a test can hold them to the
// rule that neither the Docket nor a gate trial asks what a word used to mean.

function enqueueGateReview(gi:number):void{
  const now=deps.clock.now();
  LEVELS[gi]!.words.forEach((_,wi)=>{ const k=gi+'-'+wi;
    if(!P.review[k]) P.review[k]=initialReview(now,deps.random); });
  // The roots the gate taught enter the Docket too. The words are built from them, and
  // nothing outside the Drill Hall was scheduling roots for spaced recall at all.
  LEVELS[gi]!.quizRoots.forEach(r=>{ const k=rootReviewKey(r);
    if(!P.review[k]) P.review[k]=initialReview(now,deps.random); });
  save();
}
function rootReviewKey(r:Root):string{ return 'r:'+(r.key||r.root); }
// A docket key is "gi-wi" for a gate word or "r:<rootKey>" for a root. Returns null when
// the key no longer resolves — a stale entry is dropped rather than crashing the sitting.
function docketEntry(key:string):FocusEntry|null{
  if(key.startsWith('r:')){
    const rk=key.slice(2);
    const found=sealedRoots().find(x=>(x.root.key||x.root.root)===rk);
    return found?{key,kind:'root',root:found.root,gate:found.gate}:null;
  }
  const [gi,wi]=key.split('-').map(Number);
  if(gi===undefined||wi===undefined) return null;
  const word=LEVELS[gi]?.words[wi];
  return word?{key,kind:'word',d:word,gi,wi}:null;
}
function docketMode(e:FocusEntry,tier:number):QuizMode{
  const banks = e.kind==='root'?DOCKET_ROOT_TIERS:DOCKET_WORD_TIERS;
  const start=Math.min(Math.max(tier,0),banks.length-1);
  // Drop a tier at a time until the item can actually support something in the bank.
  for(let t=start;t>=0;t--){
    const bank=(banks[t]||[]).filter(m=>feasible(e,m));
    if(bank.length) return bank[Math.floor(deps.random.next()*bank.length)]!;
  }
  return e.kind==='root'?'ROOTS':'REC';
}
function docketItem(e:FocusEntry,mode:QuizMode):QuizItem{
  const neighbours = e.kind==='word'&&e.gi!=null ? gateAt(e.gi).words : [];
  const {it}=mkItem(e,mode,neighbours);
  // The Docket is not the Drill Hall: no letter cue on typed production, and COMPOSE
  // draws its decoy morphemes from the gate rather than the advanced stock.
  delete it.drill;
  return it;
}
// Due count and longest-waiting due date in one pass. home() re-renders every second
// while a gate tempers, so the docket is counted once per render, not twice.
function docket():DocketSummary{ return docketSummary(P.review, deps.clock.now()); }
// One sitting per release. Once the day's docket has been worked through it stays shut
// until the next release, however many words the calendar sends in the meantime.
function docketOpen():boolean{ return !docketCleared(P.docketDay, deps.clock.now()); }
// Stamp the day as worked. Called when a sitting empties, never on abandoning one —
// leaving mid-sitting must leave the docket open to come back to.
function closeDocketDay():void{ P.docketDay = docketRelease(deps.clock.now()); save(); }
// The hour the Docket opens, written the way a sentence would say it.
function releaseLabel():string{ return (DOCKET_RELEASE_HOUR%12||12)+(DOCKET_RELEASE_HOUR<12?' am':' pm'); }
// Does the docket bar progression? The home card nudges once a day, but the gates,
// the Bar, and the Drill Hall only lock once the backlog outgrows a single sitting or
// a word has sat unanswered for a week — and never once the day's sitting is done,
// which is what keeps a backlog from locking the app for the rest of the day.
function docketDebt(d:DocketSummary):boolean{
  return docketOpen() && docketBlocks(d.due, d.oldestDue, deps.clock.now());
}

// The controller owns a single mutable session at a time. Each session constructor
// below writes its own shape; feature renderers and domain helpers remain fully typed.
// Keeping this boundary explicit avoids leaking mutable orchestration state into them.
let S: SessionState | null = null;
function requireSession<K extends SessionState["kind"]>(
  kind: K
): Extract<SessionState, { kind: K }> {
  if (!S || S.kind !== kind) throw new Error(`Expected ${kind} session`);
  return S as Extract<SessionState, { kind: K }>;
}
function requireFocusSession(): FocusDrillSessionState {
  const session = requireSession("DRILL");
  if (!("fdef" in session)) {
    throw new Error("Expected a focused drill session");
  }
  return session;
}
let clockTimer: ReturnType<typeof setInterval> | null = null;
function stopClock():void{ if(clockTimer){clearInterval(clockTimer);clockTimer=null;} }

/* ---- Finger on the page: same-sitting bookmark ----
   Leaving for the home page mid-gate keeps your place. The mark lives for
   MARK_TTL (one "sitting"); return later than that and the stage restarts
   from its own beginning — never further back. Docket, Bar, and Forge are
   deliberately unmarked: the Docket persists per answer, the Bar is one
   attempt, the Forge rebuilds itself from the tallies. */
const MARK_TTL = 3*60*60*1000;   // 3h resume window — tune here
function markFresh(mk:ProgressMark|null|undefined):boolean{ return !!mk && (deps.clock.now()-mk.t) <= MARK_TTL; }
function itemOut(it:QuizItem):SerializedQuizItem{ return serializeQuizItem(it,CONFUSABLES); }
function itemIn(o:SerializedQuizItem, idx:number):QuizItem|null{
  return deserializeQuizItem({
    value:o,gateIndex:idx,gates:LEVELS,confusables:CONFUSABLES,
    inference:INFER_POOL,rootOptions:rootOpts
  });
}
function setMark(mk:Omit<ProgressMark,"t"> & {t?:number}):void{ mk.t=deps.clock.now(); P.mark=mk as ProgressMark; save(); }
function clearMark(idx?:number):void{ if(P.mark && (idx===undefined || P.mark.idx===idx)){ P.mark=null; save(); } }
function markSit(stage:ProgressMark["stage"]):void{
  if(!S || !("idx" in S)) return;
  const session=S;
  const q = stage==='roots'
    ? session.queue.filter((item):item is number=>typeof item==="number")
    : session.queue.filter((item):item is QuizItem=>typeof item==="object").map(itemOut);
  const sit = session.sit
    ? {
        cleared:session.sit.cleared,
        ahead:session.sit.ahead,
        ...(session.sit.studyEntered===undefined?{}:{studyEntered:session.sit.studyEntered})
      }
    : undefined;
  setMark({stage, idx:session.idx, kind:session.kind==='T2'?'T2':'T1',
    q, debt:session.debt, done:"done" in session?session.done:0, sit,
    missed: "missed" in session ? session.missed.slice() : undefined});
}
function markUsable(mk:ProgressMark,g:GateProgress):boolean{ return mk.kind==='T2' ? (!!g.t1 && temperUnlock(g.t1)-deps.clock.now()<=0) : !g.t1; }
function resumeMark(mk:ProgressMark,idx:number):void{
  if(mk.stage==='study'){
    S={kind:"STUDY",idx, queue:[], debt:0, done:0, sit: mk.sit||{cleared:0,ahead:0,studyEntered:true}, studyLeft: mk.studyLeft||0};
    return studyScreen(idx, Math.min(mk.w||0, gateAt(idx).words.length-1)); }
  if(mk.stage==='roots'){
    S={kind:"ROOTS",idx, queue:(mk.q||[]).filter((item):item is number=>typeof item==="number"), debt:mk.debt||0, done:mk.done||0, sit: mk.sit||{cleared:0,ahead:0}};
    return rootDrillItem(); }
  const queue=(mk.q||[]).filter((item):item is SerializedQuizItem=>typeof item==="object").map(o=>itemIn(o,idx)).filter((item):item is QuizItem=>item!==null);
  if(!queue.length){ clearMark(idx); return enterGate(idx); }
  S={idx, kind:mk.kind, queue, debt:mk.debt||0, done:mk.done||0,
     sit: mk.sit||{cleared:0,ahead:0}, studyLeft:0, missed: mk.missed||[]};
  return trialItem(); }

/* ---- daily streak (device-local) ---- */
function touchStreak(){
  const today=new Date(); today.setHours(0,0,0,0); const t0=today.getTime();
  if(P.lastActive===undefined||P.lastActive===null){ P.streak=1; P.lastActive=t0; save(); return; }
  if(P.lastActive===t0) return;
  const diff=Math.round((t0-P.lastActive)/DAY);
  if(diff===1) P.streak=(P.streak||0)+1;
  else if(diff>1) P.streak=1;
  P.lastActive=t0; save();
}

/* ---- the one next thing: drives the home session card ---- */
// The tile must promise only what the tap delivers. enterGate() sends any gate
// the subscription doesn't cover to the paywall, so a tile reading "Next Gate \u00b7
// Gate XI" on a locked gate is a lie the gate cards don't tell \u2014 they show
// "Members \u2726". Mirror that here rather than advertising a gate and opening a
// price list.
interface PrimaryAction {
  kicker:string;
  label:string;
  sub:string;
  fn:(()=>void)|null;
}
function gateLocked(idx:number):boolean{ return !canAccessGate(idx,FREE_GATES,RS.active(),!!G(gateAt(idx).id).sealed); }
function membersAction(idx:number):PrimaryAction{
  const gate=gateAt(idx);
  return {kicker:'Members \u2726', label:'Gate '+rom(gate.id)+' \u00b7 '+gate.title,
          sub:'Open every gate to continue', fn:()=>enterGate(idx)};
}
function primaryAction(sitting:number, debtBlocks:boolean):PrimaryAction{
  const mk=P.mark;
  if(mk && markFresh(mk) && LEVELS[mk.idx]){ const gate=gateAt(mk.idx); const g=G(gate.id);
    if(!g.sealed && markUsable(mk,g))
      return gateLocked(mk.idx) ? membersAction(mk.idx)
        : {kicker:'Resume', label:'Gate '+rom(gate.id)+' \u00b7 '+gate.title, sub:'Pick up where you left off', fn:()=>enterGate(mk.idx)};
  }
  // The tile promises the sitting, not the backlog behind it: what the tap delivers is
  // the same count every day.
  if(sitting>0) return {kicker:'Review', label:'The Review Docket',
    sub: sitting+' word'+(sitting>1?'s':'')+" · today's sitting",
    fn:startReview};
  for(let idx=0; idx<LEVELS.length; idx++){
    const gate=gateAt(idx);
    const g=G(gate.id); if(g.sealed) continue;
    const prevSealed = idx===0 || G(gateAt(idx-1).id).sealed;
    if(!prevSealed) break;
    if(gateLocked(idx)) return membersAction(idx);
    if(g.t1){ const left=temperUnlock(g.t1)-deps.clock.now();
      if(left>0) return {kicker:'Tempering', label:'Gate '+rom(gate.id)+' is setting', sub:'Trial II opens in '+fmtDur(left), fn:null};
      return {kicker:'Trial II', label:'Gate '+rom(gate.id)+' \u00b7 '+gate.title, sub:'Typed production \u2014 seal the gate', fn:()=>enterGate(idx)};
    }
    if(debtBlocks) return {kicker:'Review', label:'Clear the Docket first', sub:"Today's sitting gates the next opening", fn:startReview};
    return {kicker: idx===0?'Begin':'Next Gate', label:'Gate '+rom(gate.id)+' \u00b7 '+gate.title, sub:gate.theme, fn:()=>enterGate(idx)};
  }
  if(P.bar.passed) return {kicker:'Admitted \u2726', label:'The Drill Hall stands open', sub:'Adaptive drilling on the advanced stock \u2014 for as long as you like', fn:startDrill};
  if(debtBlocks) return {kicker:'Review', label:'The Review Docket', sub:"Work today's sitting, then the Bar sits open", fn:startReview};
  if(P.bar.lockedUntil>deps.clock.now()) return {kicker:'The Bar', label:'Doors locked', sub:'Reopens in '+fmtDur(P.bar.lockedUntil-deps.clock.now()), fn:null};
  return {kicker:'The Bar', label:'The Bar sits open', sub:BAR_SIZE+' items \u00b7 '+BAR_PASS+' to pass \u00b7 form '+rom((P.bar.form??0)+1), fn:startBar};
}

/* ================= HOME ================= */
let _sealedOpen=false;
function home():void{
  stopClock(); S=null; P=load();
  const sealedCt = LEVELS.filter(l=>G(l.id).sealed).length;
  const summary = docket();
  const open = docketOpen();
  // The day's sitting is a fixed count, and it is zero once the day has been worked
  // through — the backlog behind it never reopens the docket before the next release.
  const sitting = open ? docketSittingSize(summary) : 0;
  const debtBlocks = docketDebt(summary);

  const currentIdx = previewFlag("burnt") ? LEVELS.findIndex((l,i)=> !G(l.id).sealed && (i===0 || G(gateAt(i-1).id).sealed)) : -1;
  const gateCards:HomeGateCard[] = LEVELS.map((lv,idx)=>{
    const g=G(lv.id);
    const prevSealed = idx===0 || G(gateAt(idx-1).id).sealed;
    const fresh = !g.t1 && !g.sealed;
    const subLock = idx>=FREE_GATES && !RS.active() && !g.sealed;
    const unlocked = prevSealed && !(fresh && debtBlocks);
    let status:HomeCardStatus;
    if(g.sealed) status={kind:'stamp'};
    else if(!prevSealed) status={kind:'label',text:'Locked',className:'locked'};
    else if(subLock) status={kind:'label',text:'Members \u2726',className:'members'};
    else if(fresh && debtBlocks) status={kind:'label',text:'Docket first',className:'locked'};
    else if(g.t1){ const left=temperUnlock(g.t1)-deps.clock.now();
      const resum = P.mark && P.mark.idx===idx && markFresh(P.mark) && P.mark.kind==='T2';
      status = left>0?{kind:'label',text:'Tempering',detail:fmtDur(left)}
           : resum?{kind:'label',text:'In progress'}:{kind:'label',text:'Trial II',detail:'ready'}; }
    else status = (P.mark && P.mark.idx===idx && markFresh(P.mark) && P.mark.kind!=='T2')
           ? {kind:'label',text:'In progress'} : {kind:'label',text:'Open'};
    return {
      index:idx,roman:rom(lv.id),title:lv.title,theme:lv.theme,sealed:!!g.sealed,
      current:idx===currentIdx,enabled:!!unlocked,status
    };
  });

  const barReady = allSealed() && !debtBlocks;
  const barLocked = P.bar.lockedUntil > deps.clock.now();
  const barStatus:HomeCardStatus = P.bar.passed ? {kind:'label',text:'Passed ✦',detail:P.bar.passedAt?new Date(P.bar.passedAt).toLocaleDateString():undefined,className:'done'}
    : !allSealed() ? {kind:'label',text:`Seal all ${LEVELS.length} gates`,className:'locked'}
    : debtBlocks ? {kind:'label',text:'Docket first',className:'locked'}
    : barLocked ? {kind:'label',text:'Locked',detail:fmtDur(P.bar.lockedUntil-deps.clock.now()),className:'locked'}
    : {kind:'label',text:'Sitting open'};

  touchStreak();
  const lexCount = lexEntries().length;
  const pa = primaryAction(sitting, debtBlocks);
  const hr = new Date().getHours();
  const greeting = hr<5?'Burning the midnight oil':hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  const sealPct = Math.round(sealedCt/LEVELS.length*100);
  const session:HomeSession = {
    kicker:pa.kicker,
    title:pa.label,
    meta:pa.sub,
    progressPercent:sealPct
  };
  if(pa.fn) session.onOpen=pa.fn;
  renderHome({
    app,
    greeting,
    summary:sealedCt?sealedCt+' of '+LEVELS.length+' gates sealed':'Twenty-four gates await their first root.',
    streak:P.streak||0,
    lexiconCount:lexCount,
    drill:drillStat(debtBlocks),
    session,
    sealedCount:sealedCt,
    gateCount:LEVELS.length,
    docket:{
      count:sitting,
      // Say so plainly when the sitting is behind us, rather than silently dropping the
      // card and leaving the day looking like it never had a docket at all.
      cleared: !open && Object.keys(P.review).length>0,
      opensAt:releaseLabel()
    },
    forgeCount:weakWords().length,
    gates:gateCards,
    bar:{enabled:barReady&&!barLocked&&!P.bar.passed,passScore:BAR_PASS,status:barStatus},
    sealedOpen:_sealedOpen,
    onSealedOpenChange:open=>{ _sealedOpen=open; },
    onGate:enterGate,
    onDocket:startReview,
    onBar:startBar,
    onSettings:settings,
    onLexicon:()=>rootLexicon(''),
    onForge:startForge,
    onDrill:startDrill
  });

  if(LEVELS.some(l=>{const g=G(l.id);return g.t1&&!g.sealed;}) || barLocked){
    clockTimer=setInterval(()=>{ if(!S) home(); },1000);
  }

}

/* ================= REVIEW DOCKET SESSION ================= */
// One sitting a day, of one size. selectDocketSitting takes the most overdue words
// first, cuts the batch to the daily size, and tops a thin day up from the next
// releases — so a long absence is worked off a day at a time instead of in one wall of
// items, and a quiet day still asks for a full sitting. Finishing it closes the docket
// until the next release and lifts the block, so the size is a stopping point, never a
// lockout.
function startReview():void{
  stopClock();
  if(!docketOpen()) return home();
  const keys = selectDocketSitting(P.review, deps.clock.now(), deps.random);
  if(!keys.length) return home();
  // Placeholders: reviewItem() builds the real item when the key reaches the head of the
  // queue, so a word requeued after a miss comes back at its new tier, from a new angle.
  const items:QuizItem[] = keys.map(k=>({k,m:"REC"}));
  S = { kind:'DOCKET', queue: items, debt:0, done:0, sit:{cleared:0,ahead:0}, retired:0 };
  reviewItem();
}
function reviewItem():void{
  const session=requireSession("DOCKET");
  if(session.queue.length===0){
    // The day is done: the docket shuts until the next release rather than reopening on
    // whatever the calendar sends next.
    closeDocketDay();
    // Anything still due was held back by the daily size, not left unanswered — say so
    // plainly rather than claiming the docket is clear when it isn't.
    const left = docket().due;
    const sealed = session.retired
      ? ` ${session.retired} word${session.retired>1?'s have':' has'} climbed the whole calendar and left the Docket for good — the Drill Hall still keeps ${session.retired>1?'them':'it'} sharp.`
      : '';
    sealScreen({seal:'⚖',title:left?'Sitting Cleared':'Docket Cleared',score:(session.debt?session.debt+' lapses reset':'no lapses'),
      note:(left
        ? `${left} word${left>1?'s':''} still waiting — they join the next sitting at ${releaseLabel()}. Lapsed words return in about a day; the rest climb the calendar.`
        : `Today's sitting is done. The Docket opens again at ${releaseLabel()}; lapsed words return in about a day, the rest climb the calendar.`)+sealed,
      actions:'<button class="btn" id="h2">Return to the gates</button>'});
    requiredButton("h2").onclick=home;
    return;
  }
  const head=session.queue[0];
  if(!head || !head.k) throw new Error("Invalid docket item");
  const reviewKey=head.k;
  const review=P.review[reviewKey];
  if(!review) throw new Error(`Missing review state for ${reviewKey}`);
  const entry=docketEntry(reviewKey);
  if(!entry){ session.queue.shift(); delete P.review[reviewKey]; save(); return reviewItem(); }
  // Retrieval depth follows the tier, not the box: a lapse resets the calendar but only
  // steps difficulty down one rung.
  const it=docketItem(entry, docketMode(entry, tierOf(review)));
  it.k=reviewKey;
  session.queue[0]=it;
  const w = entry.kind==='word' ? entry.d : null;
  const gateId = entry.kind==='word' ? gateAt(entry.gi!).id : entry.gate;
  renderTrialPrompt({
    label:'The Review Docket', gateLabel:'Gate '+rom(gateId)+' · box '+(review.box+1), it, w,
    onResolve: (ok:boolean)=>{
      const r=P.review[reviewKey];
      if(!r) throw new Error(`Missing review state for ${reviewKey}`);
      tallyKey(reviewKey,ok);
      if(ok){
        session.queue.shift(); session.done++; session.sit.cleared++;
        const next=scheduleReview(r,true,deps.clock.now(),deps.random);
        const t=P.ledger[reviewKey];
        // Top of the ladder and well ahead on the tally: the word leaves the Docket
        // for good rather than returning forever. tally() ran above, so this counts
        // the answer just given.
        if(retiresFromDocket(next.box, t? t.r-t.w : 0)){ delete P.review[reviewKey]; session.retired++; }
        else Object.assign(r,next);
      }
      else { const f=session.queue.shift(); if(f)session.queue.push(f); session.debt++; Object.assign(r,scheduleReview(r,false,deps.clock.now(),deps.random)); }
      save();
      return ok?null:'lapse — box reset to about a day; it returns this session until correct';
    },
    onNext: reviewItem
  });
}

/* ================= GATE ROUTER ================= */
function enterGate(idx:number):void{
  stopClock();
  const lv=gateAt(idx);
  if(!canAccessGate(idx,FREE_GATES,RS.active(),!!G(lv.id).sealed)) return paywall('gate', idx);
  const g=G(lv.id);
  if(g.sealed) return sealedGateView(idx);
  const mk=P.mark;
  if(mk && mk.idx===idx){
    if(markFresh(mk) && markUsable(mk,g)) return resumeMark(mk,idx);
    clearMark(idx);   // lapsed — soft return to the start of this stage, never further back
  }
  if(g.t1){ const left=temperUnlock(g.t1)-deps.clock.now();
    if(left>0) return temperScreen(idx); return startTrial2(idx); }
  return rootsScreen(idx);
}

// Speak a Latin/Greek root through the same audio engine used for the words
// (a bundled clip if one exists, otherwise on-device speech synthesis). We voice
// only the primary form — the piece before any "/", ",", or "+" — so a root
// listed as "pais, paidos" reads as "pais" and "aequus + vox" reads "aequus".
function rootSay(rootStr:string):string{
  return renderRootAudio(String(rootStr));
}
// Compact speaker button for a headword — same audio engine as pronLine, but no
// IPA text. Used to voice inference words and Drill-Hall stock, which never get
// a full study card of their own.
function saySmall(word:string):string{
  return renderWordAudio(String(word));
}
function rootsScreen(idx:number):void{
  const lv=gateAt(idx);
  const showEtym = previewFlag("etym");
  const rows=lv.roots.map(r=>{
    const et = showEtym ? ((ETYM as Readonly<Record<string,string>>)[r.root]||'') : '';
    return `<div class="root-row">
    <div><span class="root-key-line"><span class="root-key">${r.root}</span>${rootSay(r.root)}</span><span class="root-lang">${r.lang}</span></div>
    <div><div class="root-gloss">${r.gloss}</div>${et?`<div class="root-etym">${et}</div>`:''}</div></div>`;
  }).join('');
  renderRootsScreen({
    app, gate:lv, gateNumber:rom(lv.id), rootRowsHtml:rows,
    onHome:home, onStart:()=>rootDrill(idx)
  });
}

function rootDrill(idx:number):void{
  const lv=gateAt(idx), W=lv.words.length;
  S={kind:"ROOTS",idx,queue:shuffle(lv.quizRoots.map((_,i)=>i)),debt:0,done:0,sit:{cleared:0,ahead:W+3*W}};
  rootDrillItem();
}
function rootDrillItem():void{
  const session=requireSession("ROOTS");
  const lv=gateAt(session.idx);
  if(session.queue.length===0) return studyScreen(session.idx,0);
  avoidRepeat<number>(session.queue, session.lastRoot===undefined?undefined:String(session.lastRoot), x=>String(x));
  markSit('roots');
  const ri=session.queue[0];
  if(ri===undefined) throw new Error("Root queue unexpectedly empty");
  const r=lv.quizRoots[ri];
  if(!r) throw new Error(`Missing root ${ri} in gate ${session.idx}`);
  session.lastRoot=ri;
  const seen=new Set([r.gloss]); const others:string[]=[];
  for(const o of shuffle(lv.quizRoots.filter((o,i)=>i!==ri && (!r.compoundOf || o.compoundOf!==r.compoundOf)))){ if(seen.has(o.gloss)) continue; seen.add(o.gloss); others.push(o.gloss); if(others.length===3) break; }
  const opts=shuffle([{t:r.gloss,ok:true},...others.map(t=>({t,ok:false}))]);
  const screen=renderRootDrillScreen({
    app, gateNumber:rom(lv.id), progressHtml:sitBar(),
    queueLength:session.queue.length, debt:session.debt, root:r, rootAudioHtml:rootSay(r.root),
    choices:opts.map(o=>({text:o.t,correct:o.ok})), onHome:home
  });
  applyVeil();
  wireChoices((ok:boolean)=>{
    const v=screen.verdict;
    if(ok){ session.queue.shift(); session.done++; session.sit.cleared++; v.className='verdict right'; v.textContent='Correct.';
      setTimeout(()=>{ if(S===session) rootDrillItem(); },350); }
    else { session.queue.shift(); requeueMiss(session.queue, ri, ri); session.debt++;
      v.className='verdict wrong';
      const note=rootEtymNote(r);
      v.innerHTML=`No — <b>${esc(r.root)}</b> means “${esc(r.gloss)}.”`
        + (note?`<span class="fb-line fb-ety" style="display:block;margin-top:7px">${note}</span>`:'')
        + similarRootNote(r)
        + `<span class="fb-line" style="display:block;margin-top:7px;opacity:.72">It returns to the queue, with a penalty rep.</span>`;
      screen.actions.innerHTML=`<button class="btn" id="n">${session.queue.length?'Next →':'To the words →'}</button>`;
      const next=screen.actions.querySelector<HTMLButtonElement>('#n');
      if(!next) throw new Error("Root drill next control did not render");
      next.onclick=rootDrillItem;
      next.focus(); }
  });
}

function cardHtml(word:StudyCardWord):string{
  return renderStudyCard(word,{gates:LEVELS,etymology:etyOf,deepPanel,nearNote:inferRoots});
}
// Inference words teach by their roots line; it takes the slot a gate word gives its kin.
function inferRoots(word:StudyCardWord):string{
  return "roots" in word && word.roots ? esc(word.roots) : '';
}
// The deep-study panel for a whole word: each piece explained in turn — the authored affix
// note or the root's own paragraph — then the family that root grows into. Almost all of
// this prose already existed; only the affix notes were missing, and nothing called it from
// the study card.
function deepPanel(word:StudyCardWord):string{
  const seen=new Set<string>(); let out='';
  // The word's own sense-history leads the panel, above the per-piece notes. Seeding `out`
  // here also lets a story-only word open the panel: the empty-guard below sits after the
  // piece loop, so a word with a story but no resolvable pieces still returns a panel.
  const story=catalog.wordStory(word);
  if(story) out+=`<div class="deep-part deep-story">${story}</div>`;
  for(const [surface,gloss] of word.parts){
    const note=catalog.partDepth(surface,AFFIX_DEEP);
    if(!note||seen.has(note)) continue;
    seen.add(note);
    out+=`<div class="deep-part"><span class="deep-seg">${esc(surface)}${gloss?` — ${esc(gloss)}`:''}</span>${note}</div>`;
  }
  if(!out) return '';
  const root=LEVELS.flatMap(l=>l.quizRoots).find(r=>word.parts.some(p=>normRoot(p[0])&&rootForms(r).some(f=>normRoot(f)===normRoot(p[0]))));
  if(root){
    const fam=rootFamily(root,4).filter(k=>k.word!==word.word);
    if(fam.length) out+=`<div class="deep-part"><span class="deep-seg">grows into</span>${fam.map(k=>`<b>${k.word}</b>${k.def?` — ${esc(k.def).toLowerCase().replace(/\.$/,'')}`:''}`).join(' · ')}</div>`;
    const near=similarRootNote(root);
    if(near) out+=`<div class="deep-part">${near}</div>`;
  }
  return out;
}

function studyScreen(idx:number,w:number):void{
  const lv=gateAt(idx), word=lv.words[w], total=lv.words.length, last=w===total-1;
  if(!word) throw new Error(`Missing study word ${idx}-${w}`);
  if(S?.kind==="ROOTS"){
    S={kind:"STUDY",idx,queue:[],debt:S.debt,done:S.done,sit:S.sit,studyLeft:S.studyLeft??total};
  }
  const session=requireSession("STUDY");
  // On first arrival, move the study block out of 'ahead' into the live queue budget.
  if(!session.sit.studyEntered){ session.sit.ahead -= total; session.studyLeft = total; session.sit.studyEntered=true; }
  // Reconcile bar: cleared study words = total - studyLeft; queue is empty during study,
  // so temporarily represent remaining study as queue-length via studyLeft.
  const remaining = session.studyLeft + session.sit.ahead;
  const frac = session.sit.cleared/((session.sit.cleared+remaining)||1);
  setMark({stage:'study', idx, w, kind:'T1',
    sit: {cleared:session.sit.cleared, ahead:session.sit.ahead, studyEntered:true},
    studyLeft: session.studyLeft});
  renderStudyScreen({
    app, gateNumber:rom(lv.id), wordIndex:w, totalWords:total,
    progressHtml:stageBar(frac), cardHtml:cardHtml(word), onHome:home,
    onNext:()=>{
      session.sit.cleared++; session.studyLeft=Math.max(0,session.studyLeft-1);
      last?startTrial1(idx):studyScreen(idx,w+1);
    },
    onPrevious:()=>{
      session.sit.cleared=Math.max(0,session.sit.cleared-1); session.studyLeft++;
      studyScreen(idx,w-1);
    }
  });
}

/* ================= TRIALS ================= */
function startTrial1(idx:number):void{
  const lv=gateAt(idx);
  const inference = idx>=3 ? inferPick(idx,1) : [];
  const items=buildTrialOneItems(lv,idx,r=>rootOpts(idx,r),inference);
  const sit = (S&&S.sit)?S.sit:{cleared:0,ahead:0};
  sit.ahead=0; sit.studyEntered=true;                 // trial I is the last stage of sitting 1
  S={idx,kind:'T1',queue:shuffle(items),debt:0,done:0,sit,studyLeft:0,missed:[]};
  trialItem();
}
function startTrial2(idx:number):void{
  const lv=gateAt(idx);
  const items:QuizItem[]=lv.words.map((_,wi)=>({gi:idx,wi,m:'PROD'}));
  // review injections from sealed gates — affinity-scored: prefer words whose gate
  // shares root stock with the current gate (contrast over random repetition)
  const pool:{gi:number;wi:number}[]=[]; LEVELS.slice(0,idx).forEach((pl,pi)=>{ if(G(pl.id).sealed) pl.words.forEach((_,wi)=>pool.push({gi:pi,wi})); });
  const cur=gateRootKeys(idx);
  pool.map(r=>{ let s=0; gateRootKeys(r.gi).forEach(t=>{ if(cur.has(t)) s++; }); return {r,s:s+deps.random.next()*0.5}; })
      .sort((a,b)=>b.s-a.s).slice(0,4)
      .forEach(x=>items.push({...x.r, m:deps.random.next()<.5?'PROD':'VIGT'}));
  if(idx>=3) inferPick(idx,2).forEach(f=>items.push({m:'INFER',inf:f}));
  // confusable pairs: both members taught by now
  lv.quizRoots.forEach(r=>items.push({m:'ROOTT',root:r}));   // the roots again, this time recalled by typing
  const pairs = pairPick(idx,3);
  pairs.forEach(p=>items.push({m:'PAIR',pair:p}));
  // Trial II is the production trial, so it opens with production. Typed items first,
  // each block shuffled, rather than one flat shuffle that can lead with a multiple choice.
  // SENSET is deliberately absent: a trial never asks what a word used to mean, so
  // listing it here would describe an order for items this queue cannot hold.
  const TYPED:ReadonlySet<QuizMode>=new Set(['PROD','VIGT','CLOZE','LITT','ROOTT']);
  const queue=[...shuffle(items.filter(i=>TYPED.has(i.m))),...shuffle(items.filter(i=>!TYPED.has(i.m)))];
  S={idx,kind:'T2',queue,debt:0,done:0,sit:{cleared:0,ahead:0},missed:[]};
  trialItem();
}

function trialItem():void{
  if(!S || (S.kind!=="T1"&&S.kind!=="T2")) throw new Error("Expected gate trial session");
  const session=S;
  const lv=gateAt(session.idx);
  if(session.queue.length===0) return trialDone();
  avoidRepeat(session.queue, session.lastKey, itemKey);
  markSit('trial');
  const it=session.queue[0];
  if(!it) throw new Error("Trial queue unexpectedly empty");
  session.lastKey=itemKey(it);
  const label = session.kind==='T1'?'Trial I':'Trial II';
  renderTrialPrompt({
    label:'Gate '+rom(lv.id)+' · '+label,
    gateLabel: it.gi!==undefined && it.gi!==session.idx ? 'Review · Gate '+rom(gateAt(it.gi).id) : '',
    forgeOnMiss:true,
    it, w: (it.m==='PAIR'||it.m==='INFER'||it.m==='ROOTS'||it.m==='ROOTT')?null:wordAt(it.gi!,it.wi!),
    onResolve: (ok:boolean)=>{
      if(it.gi!==undefined && it.wi!==undefined) tally(it.gi,it.wi,ok);
      if(ok){ session.queue.shift(); session.done++; session.sit.cleared++; }
      else {
        const f=session.queue.shift();
        if(!f) throw new Error("Trial queue unexpectedly empty");
        requeueMiss(session.queue, f, {...f}); session.debt++;
        session.missed.push(it.m==='PAIR'?it.pair!.ans : it.m==='INFER'?it.inf!.word : it.root?it.root.root : wordAt(it.gi!,it.wi!).word);
      }
      return ok?null:'it returns to the queue, plus a penalty rep';
    },
    onNext: trialItem
  });
}

interface TrialPromptOptions {
  label:string;
  gateLabel:string;
  it:QuizItem;
  w:Word|DrillWord|null;
  onResolve(ok:boolean):string|null;
  onNext():void;
  oneShot?:boolean;
  forgeOnMiss?:boolean;
}

/* Shared prompt renderer: recognition, production, inference, and root prompts. */
function renderTrialPrompt({label,gateLabel,it,w,onResolve,onNext,oneShot=false,forgeOnMiss=false}:TrialPromptOptions):void{
  if(!S) throw new Error("Cannot render a trial prompt without a session");
  const session=S;
  const position=():number=>"pos" in session?session.pos:0;
  if(it.inf){ P.seenInfer[it.inf.word]=true; save(); }
  if(it.pair){ P.seenPair[String(CONFUSABLES.indexOf(it.pair))]=true; save(); }
  // Practice shows the letter cue; anything that is testing production does not. The gate
  // trials, the Docket and the Bar all ask the learner to produce the word cold, and a cue
  // reading "p·······" hands over its length and first letter.
  const cue = session.kind==='DRILL'||session.kind==='FORGE'||session.kind==='FORGENOW';
  const view=buildPromptView({
    item:it,word:w,gates:LEVELS,inferencePool:INFER_POOL,drillWords:drillWords(),
    random:deps.random,vignette:vigOf,literal:litOf,posOf,wordFoils,cue,rootForms,rootCue,rootAudio:rootSay,
    formerSense:wasOf,shiftLabel:shiftLabelOf
  });
  const {promptHtml,bodyHtml,typed}=view;
  if(view.compose) it._compose=view.compose;

  const screen=renderTrialScreen({
    app,label,gateLabel,promptHtml,bodyHtml,debt:session.debt,onHome:home,
    progressHtml:oneShot ? stageBar(position()/session.queue.length) : sitBar(),
    queueLabel:session.queue.length+' '+(oneShot?'· item '+(position()+1):'in queue')
  });

  const finish = (ok:boolean,picked=''):void=>{
    const extra = onResolve(ok);
    const v=screen.verdict;
    let hint='';
    if(it.m==='PAIR') hint=`<span class="root-hint">${it.pair!.why}</span>`;
    else if(it.m==='INFER') hint='';
    else if(it.m==='COMPOSE'){ const src=it.inf||w;
      if(!src) throw new Error("Compose feedback requires source data");
      hint=`<span class="root-hint">${src.parts.map((p:WordPart)=>p[0]+(p[1]?' ('+p[1]+')':'')).join(' + ')}</span>`; }
    else if(it.root) hint=`<span class="root-hint">${it.root.root} — ${it.root.gloss} · ${it.root.lang}</span>`+similarRootNote(it.root);
    else if(w) hint=`<span class="root-hint">${rootHint(w)}</span>`;
    // Inferred words and every word met in the Drill Hall pause on a correct
    // answer to show the etymological breakdown — never auto-advance.
    const lp = document.querySelector<HTMLElement>('.learn-prompt');
    const learnInput=lp?.querySelector<HTMLInputElement>('input');
    const learnRoot = !!learnInput?.checked;
    if(lp){ lp.classList.add('spent'); if(learnInput) learnInput.disabled=true; }
    const teach = it.inf || (session.kind==='DRILL' && !!w);
    if(ok && (teach || learnRoot)){ v.className='verdict right';
      let deep='';
      if(it.root){ deep = rootDeepHtml(it.root); }
      else if(it.inf){
        const src=it.inf;
        deep+=`<span class="fb-line fb-contrast">${src.word} ${saySmall(src.word)} — ${posTag(src)}${src.def.toLowerCase()}</span>`;
        deep+=inferDeep(src);
      } else if(w) {
            deep+=`<span class="fb-line fb-contrast">${w.word} ${saySmall(w.word)} — ${posTag(w)}${w.def.toLowerCase()}</span>`;
            const story = etyOf(w);
            if(story) deep+=`<span class="fb-line fb-ety">${story}</span>`;
            if(vigOf(w) && it.m!=='VIG' && it.m!=='VIGT') deep+=`<span class="fb-line fb-scene">“${esc(vigOf(w))}”</span>`;
      }
      v.innerHTML='Correct.'+hint+deep;
      screen.actions.innerHTML=`<button class="btn" id="n">${(session.queue.length&&!oneShot)||(oneShot&&position()<session.queue.length)?'Next →':'Finish →'}</button>`;
      const next=screen.actions.querySelector<HTMLButtonElement>('#n');
      if(!next) throw new Error("Trial next control did not render");
      next.onclick=onNext; next.focus(); }
    else if(ok){ v.className='verdict right'; v.innerHTML='Correct.'+hint;
      setTimeout(()=>{ if(S===session) onNext(); },350); }
    else {
      // SHIFT is the one word-mode whose answer is not the headword: it asks what happened
      // to the meaning, so the correct option is the name of the shift.
      const answer = it.m==='PAIR'?it.pair!.ans : it.m==='INFER'?it.inf!.def : it.m==='COMPOSE'?(it.inf||w)!.word : it.m==='ROOTQ'?'“'+it.part![1]+'”' : it.m==='ROOTS'?'“'+it.root!.gloss+'”' : it.m==='ROOTT'?it.root!.root : it.m==='SHIFT'?shiftLabelOf(w!) : w!.word;
      let deep='';
      if(w){
        const pd = picked && picked!==w.word ? defOfWord(picked) : '';
        if(pd) deep+=`<span class="fb-line fb-contrast">not <b>${picked}</b> — ${pd.toLowerCase()}</span>`;
        if(etyOf(w)) deep+=`<span class="fb-line fb-ety">${etyOf(w)}</span>`;
        if(vigOf(w) && it.m!=='VIG' && it.m!=='VIGT') deep+=`<span class="fb-line fb-scene">“${esc(vigOf(w))}”</span>`;
      }
      if(it.root && learnRoot) deep+=rootDeepHtml(it.root);
      if(it.inf) deep+=inferDeep(it.inf);
      v.className='verdict wrong';
      const ansAudio = (session.kind==='DRILL' && w) ? ' '+saySmall(w.word) : '';
      v.innerHTML=`<b>${answer}</b>${ansAudio}${extra?' — '+extra:''}.${hint}${deep}`;
      const fgOffer = (forgeOnMiss && it.gi!==undefined && w) ? `<button class="btn ghost" id="fg-now">⚒ Forge it</button>` : '';
      screen.actions.innerHTML=fgOffer+`<button class="btn" id="n">${(session.queue.length&&!oneShot)||(oneShot&&position()<session.queue.length)?'Next →':'Finish →'}</button>`;
      const next=screen.actions.querySelector<HTMLButtonElement>('#n');
      if(!next) throw new Error("Trial next control did not render");
      next.onclick=onNext;
      const fgn=screen.actions.querySelector<HTMLButtonElement>('#fg-now'); if(fgn && it.gi!==undefined && it.wi!==undefined) fgn.onclick=()=>forgeNow(it.gi!,it.wi!,it.m,onNext);
      next.focus(); }
  };

  if(it.m==='COMPOSE'){
    const c=it._compose;
    if(!c) throw new Error("Compose interaction is missing its segments");
    wireComposeInteraction({app,segmentCount:c.segs.length,target:c.target,resolve:finish});
  } else if(typed){
    wireTypedInteraction({
      app,
      isCorrect:value=>it.m==='ROOTT' ? rootMatch(value,it.root!) : value.trim().toLowerCase()===w!.word.toLowerCase(),
      resolve:finish
    });
  } else wireChoices(finish);
  applyVeil();
  applyRootLearn(it);
}

// Prediction veil: blur answer sets until the learner commits to a guess.
function applyVeil():void{
  applyPredictionVeil(app,P.predict);
}
// A subtle, per-question opt-in shown only on Drill Hall root questions. When ticked
// before answering, finish() pauses on the root's deep-study panel instead of the
// usual snappy auto-advance. Renders unticked every question (per-question, no memory).
function applyRootLearn(it:QuizItem):void{
  applyRootLearningPrompt(app,!!(it.root&&S&&S.kind==='DRILL'));
}
function wireChoices(resolve:(correct:boolean,picked:string)=>void):void{
  wirePromptChoices(app,resolve);
}

function trialDone():void{
  if(!S || (S.kind!=="T1"&&S.kind!=="T2")) throw new Error("Expected completed gate trial");
  const session=S;
  const lv=gateAt(session.idx), g=G(lv.id);
  clearMark(session.idx);
  const weak = [...new Set(session.missed)];
  const weakLine = weak.length ? ' Weak words — give them a second look: ' + weak.join(', ') + '.' : '';
  if(session.kind==='T1'){ g.t1=deps.clock.now(); save(); return temperScreen(session.idx, weak); }
  g.sealed=true; save();
  enqueueGateReview(session.idx);
  const newDrill=DRILL_POOL.filter(d=>d.req===lv.id).length;
  const isLast=allSealed();
  sealScreen({seal:rom(lv.id),title:'Gate Sealed',
    score:'queue cleared · '+(session.debt?session.debt+' penalty reps paid':'no errors'),
    note: (isLast?`All ${LEVELS.length} gates are sealed. Work today's sitting in the Docket, then the Bar sits open — fifty items, one attempt.`
               :'Gate '+rom(lv.id)+' is sealed and its words enter the Review Docket, which opens once a day at '+releaseLabel()+'. The next gate opens once the day\'s sitting is done.') + (newDrill?' '+newDrill+' advanced word'+(newDrill>1?'s':'')+' enter the Drill Hall.':'') + weakLine,
    actions:`<button class="btn" id="h2">Return to the gates</button>`});
  requiredButton('h2').onclick=home;
}

function temperScreen(idx:number, weak:string[]=[]):void{
  stopClock();
  const lv=gateAt(idx);
  const render=():void=>{
    const t1=G(lv.id).t1;
    if(t1===undefined) throw new Error(`Gate ${lv.id} has no tempering timestamp`);
    const left=temperUnlock(t1)-deps.clock.now();
    if(left<=0){stopClock();return startTrial2(idx);}
    renderTemperScreen({
      app, gateNumber:rom(lv.id), countdown:fmtDur(left), weakWords:weak||[],
      onHome:home, onRestudy:()=>{stopClock();studyReview(idx);}
    });
  };
  render();
  clockTimer=setInterval(()=>{
    const el=document.getElementById('clk');
    if(!el){stopClock();return;}
    const t1=G(lv.id).t1;
    if(t1===undefined){stopClock();return;}
    const left=temperUnlock(t1)-deps.clock.now();
    if(left<=0){stopClock();startTrial2(idx);} else el.textContent=fmtDur(left);
  },1000);
}

function studyReview(idx:number):void{
  const lv=gateAt(idx); let w=0;
  const draw=():void=>{
    const word=lv.words[w];
    if(!word) throw new Error(`Missing review word ${idx}-${w}`);
    renderStudyReviewScreen({
      app, gateNumber:rom(lv.id), wordIndex:w, totalWords:lv.words.length,
      cardHtml:cardHtml(word), onBack:()=>temperScreen(idx),
      onNext:()=>{w++;draw();}, onPrevious:()=>{w--;draw();}
    });
  };
  draw();
}

/* ================= THE BAR ================= */
function startBar():void{
  stopClock();
  if(!RS.active()) return paywall('bar');
  const pool:{gi:number;wi:number}[]=[]; LEVELS.forEach((lv,gi)=>lv.words.forEach((_,wi)=>pool.push({gi,wi})));
  const plan=barComposition(BAR_SIZE);
  const pairs = pairPick(LEVELS.length-1,plan.pairs);
  const infer = inferPick(LEVELS.length-1,plan.meaning+plan.compose);
  const form = P.bar.form ?? 0;
  S={kind:'BAR',queue:buildBarItems(pool,pairs,infer,deps.random,BAR_SIZE,form),pos:0,correct:0,debt:0};
  barItem();
}
function barItem():void{
  const session=requireSession("BAR");
  if(session.pos>=session.queue.length) return barDone();
  const it=session.queue[session.pos];
  if(!it) throw new Error("Bar queue unexpectedly empty");
  const w = (it.m==='PAIR'||it.m==='INFER') ? null : wordAt(it.gi!,it.wi!);
  // one-shot renderer reusing shared prompt
  renderBarPrompt(it,w);
}
function renderBarPrompt(it:QuizItem,w:Word|null):void{
  const session=requireSession("BAR");
  renderTrialPrompt({
    label:'The Bar · '+(session.pos+1)+' of '+BAR_SIZE,
    gateLabel: it.m==='PAIR'?'Confusables':it.m==='INFER'?'Inference':it.m==='COMPOSE'?'Assembly':'',
    it,w,oneShot:true,
    onResolve: (ok:boolean)=>{ if(it.gi!==undefined && it.wi!==undefined) tally(it.gi,it.wi,ok); if(ok)session.correct++; session.pos++; return null; },
    onNext: barItem
  });
  // patch the meta line for one-shot display
  const qm=document.querySelector('.queue-meta');
  if(qm) qm.innerHTML=`<span>${session.correct} correct</span><span class="debt">${BAR_PASS} needed to pass</span>`;
}
function barDone():void{
  const session=requireSession("BAR");
  const passed=session.correct>=BAR_PASS;
  if(passed){ P.bar.passed=true; P.bar.passedAt=deps.clock.now(); }
  else { P.bar.lockedUntil=deps.clock.now()+TEMPER_MIN_MS;
    // A retake is a different form, not a reshuffle of the same one.
    P.bar.form=((P.bar.form??0)+1)%BAR_FORMS; }
  save();
  sealScreen({gold:true,seal:passed?'✦':'—',
    title:passed?'Admitted':'Not This Sitting',
    score:session.correct+' of '+BAR_SIZE+' · '+BAR_PASS+' required',
    note:passed?'Thirty produced from memory, five twins told apart, and fifteen strangers read by their roots alone. The method is yours.'
               :'The doors lock for eight hours. Work the Docket and the cards — a different form sits waiting when they open.',
    actions:`<button class="btn" id="h2">Return to the gates</button>`});
  requiredButton('h2').onclick=home;
}

/* ================= SAVE / RESTORE ================= */
function serialize():string{
  return serializeProgress(P);
}
function deserialize(str:string):ProgressV2|null{
  return deserializeProgress(str);
}
function backupModal():void{
  showBackupModal(serialize());
}
function restoreModal():void{
  showRestoreModal({
    restore:code=>{
      const obj=deserialize(code);
      if(!obj) return false;
      P.gates=obj.gates||{}; P.bar=obj.bar||{passed:false,lockedUntil:0};
      P.review=obj.review||{}; P.prompted=obj.prompted||{}; P.seenInfer=obj.seenInfer||{}; P.predict=obj.predict!==false; P.ledger=obj.ledger||{}; P.drill=obj.drill||{theta:0,n:0,seen:{}}; P.drill.seen=P.drill.seen||{}; P.drill.roots=P.drill.roots||{};
      save();
      return true;
    },
    onRestored:home
  });
}

/* ================= LEXICON ================= */
interface SealedWord { w:Word; gi:number; wi:number }
type RuntimeLexEntry =
  | {key:string;g:SealedWord;inf:-1}
  | {key:string;g:null;inf:-1;dr:number}
  | {key:string;g:null;inf:number};
function sealedWords():SealedWord[]{ const out:SealedWord[]=[]; LEVELS.forEach((l,gi)=>{ if(G(l.id).sealed) l.words.forEach((w,wi)=>out.push({w,gi,wi})); }); return out; }
function lexiconBar():string{
  const n=lexEntries().length;
  if(!n) return '';
  return `<button class="lex-bar" id="lex-btn"><span>✧ The Lexicon</span><span class="ct">${n} words in your keeping</span></button>`;
}
function lexEntries():RuntimeLexEntry[]{
  return selectLexiconEntries(LEVELS,INFER_POOL,DRILL_POOL,P).map(e=>
    e.kind==='gate'
      ? {key:e.key,g:{w:wordAt(e.gateIndex,e.wordIndex),gi:e.gateIndex,wi:e.wordIndex},inf:-1 as const}
      : e.kind==='drill'
      ? {key:e.key,g:null,inf:-1 as const,dr:e.drillIndex}
      : {key:e.key,g:null,inf:e.inferenceIndex}
  );
}
// The Lexicon opens on the roots — the app is built around them — and an arrow
// leads out to the words that grow from them. Roots are drawn from every sealed
// gate; each opens a detail card with its origin note and the words it feeds.
function rootLexicon(q:string):void{
  const all=sealedRoots().sort((a,b)=>a.root.root.toLowerCase().localeCompare(b.root.root.toLowerCase()));
  const ql=(q||'').toLowerCase();
  const hits=ql?all.filter(x=> rootForms(x.root).some(f=>f.toLowerCase().includes(ql)) || (x.root.gloss||'').toLowerCase().includes(ql)):all;
  const wordsN=lexEntries().length;
  S=null; stopClock&&stopClock();
  const rows=hits.map(x=>{
      const r=x.root;
      return `<button class="lex-row" data-key="${esc(r.key||r.root)}"><span class="lex-w rl-w">${r.root}</span><span class="lex-d">${esc(r.gloss)}</span><span class="lex-led" style="color:var(--gild)">${r.lang}</span></button>`;
    }).join('');
  renderRootLexiconScreen({
    app, query:esc(q||''), rowsHtml:rows, rootCount:all.length, wordCount:wordsN,
    onHome:home, onWords:()=>lexicon(''), onSearch:rootLexicon,
    onRoot:key=>rootView(key,q)
  });
}
function rootView(key:string,q:string):void{
  const entry=sealedRoots().find(x=>(x.root.key||x.root.root)===key);
  if(!entry){ rootLexicon(q||''); return; }
  const r=entry.root;
  const note=rootEtymNote(r);
  const fam=rootFamily(r,8);
  const rows=fam.map(k=>{
    const loc=wordLoc(k.word), d=esc(k.def||'');
    if(loc) return `<button class="lex-row" data-gi="${loc.gi}" data-wi="${loc.wi}"><span class="lex-w">${k.word}</span><span class="lex-d">${d}</span></button>`;
    return `<div class="lex-row" style="cursor:default"><span class="lex-w">${k.word}</span><span class="lex-d">${d}</span></div>`;
  }).join('');
  S=null; stopClock&&stopClock();
  renderRootDetailScreen({
    app,
    stageLabel:`Root · ${r.lang}${entry.gate?' · Gate '+rom(entry.gate):''}`,
    root:r.root, gloss:esc(r.gloss), noteHtml:note?`<div class="rl-etym">${note}</div>`:'',
    familyRowsHtml:rows, onBack:()=>rootLexicon(q||''),
    onWord:(gi,wi)=>wordView(gi,wi,'',()=>rootView(key,q),'The Root')
  });
}
function lexicon(q:string):void{
  const all=lexEntries();
  const ql=(q||'').toLowerCase();
  const defOf=(e:RuntimeLexEntry):string=>{
    if(e.g) return e.g.w.def;
    if("dr" in e){ const word=DRILL_POOL[e.dr]; if(!word) throw new Error(`Missing drill word ${e.dr}`); return word.def; }
    const word=INFER_POOL[e.inf]; if(!word) throw new Error(`Missing inference word ${e.inf}`); return word.def;
  };
  const hits=ql?all.filter(e=>e.key.toLowerCase().includes(ql)||defOf(e).toLowerCase().includes(ql)):all;
  S=null; stopClock&&stopClock();
  const rows=hits.map(e=>{
      if(e.g){
        const x=e.g, t=P.ledger[x.gi+'-'+x.wi];
        const led=t?`<span class="lex-led ${t.w>t.r?'bad':''}">${t.r}–${t.w}</span>`:'';
        return `<button class="lex-row" data-gi="${x.gi}" data-wi="${x.wi}"><span class="lex-w">${x.w.word}</span><span class="lex-d">${esc(x.w.def)}</span>${led}</button>`;
      }
      if("dr" in e){
        const d=DRILL_POOL[e.dr];
        if(!d) throw new Error(`Missing drill word ${e.dr}`);
        const s=P.drill.seen[d.word];
        const led=s?`<span class="lex-led ${s.w>s.r?'bad':''}">${s.r}–${s.w}</span>`:'';
        return `<button class="lex-row" data-dr="${e.dr}"><span class="lex-w">${d.word}</span><span class="lex-d">${esc(d.def)}</span>${led}</button>`;
      }
      const inf=INFER_POOL[e.inf];
      if(!inf) throw new Error(`Missing inference word ${e.inf}`);
      return `<button class="lex-row" data-inf="${e.inf}"><span class="lex-w">${e.key}</span><span class="lex-d">${esc(inf.def)}</span><span class="lex-led" style="color:var(--gild)">inferred</span></button>`;
    }).join('');
  renderWordLexiconScreen({
    app, query:esc(q||''), rowsHtml:rows, wordCount:all.length,
    onRoots:()=>rootLexicon(''), onSearch:lexicon, onSelect:selection=>{
      if(selection.kind==='drill') drillView(selection.drillIndex,q);
      else if(selection.kind==='inference') inferView(selection.inferenceIndex,q);
      else wordView(selection.gateIndex,selection.wordIndex,q);
    }
  });
}
function inferView(fi:number,q:string):void{
  const f:InferenceWord|undefined=INFER_POOL[fi];
  if(!f) throw new Error(`Missing inference word ${fi}`);
  renderLexiconDetailScreen({
    app, backLabel:'The Lexicon', stageLabel:'Inference · a meaning built from roots',
    contentHtml:cardHtml(f),
    onBack:()=>lexicon(q||'')
  });
}
function drillView(di:number,q:string):void{
  const d:DrillWord|undefined=DRILL_POOL[di];
  if(!d) throw new Error(`Missing drill word ${di}`);
  const s=P.drill.seen[d.word];
  renderLexiconDetailScreen({
    app, backLabel:'The Lexicon', stageLabel:`The Drill Hall · unlocked by Gate ${rom(d.req)}`,
    contentHtml:cardHtml(d)+(s?`<div class="grad-note" style="text-align:center">drilled: ${s.r} right · ${s.w} wrong</div>`:''),
    onBack:()=>lexicon(q||'')
  });
}
function sealedGateView(idx:number):void{
  const lv=gateAt(idx);
  const rows=lv.roots.map(r=>`<div class="root-row">
    <div><span class="root-key">${r.root}</span><span class="root-lang">${r.lang}</span></div>
    <div class="root-gloss">${r.gloss}</div></div>`).join('');
  const words=lv.words.map((w,wi)=>{
    const t=P.ledger[idx+'-'+wi];
    const led=t?`<span class="lex-led ${t.w>t.r?'bad':''}">${t.r}–${t.w}</span>`:'';
    return `<button class="lex-row" data-wi="${wi}"><span class="lex-w">${w.word}</span><span class="lex-d">${posTag(w)}${esc(w.def)}</span>${led}</button>`;
  }).join('');
  renderSealedGateScreen({
    app, gate:lv, gateNumber:rom(lv.id), rootRowsHtml:rows, wordRowsHtml:words,
    onHome:home, onWord:wi=>wordView(idx,wi,'',()=>sealedGateView(idx))
  });
}

function wordView(gi:number,wi:number,q:string,backFn?:(()=>void),backLabel?:string):void{
  const w=wordAt(gi,wi), t=P.ledger[gi+'-'+wi];
  const gate=gateAt(gi);
  renderLexiconDetailScreen({
    app, backLabel:backLabel||(backFn?'Gate '+rom(gate.id):'The Lexicon'),
    stageLabel:`Gate ${rom(gate.id)} · ${gate.title}`,
    contentHtml:cardHtml(w)+(t?`<div class="grad-note" style="text-align:center">lifetime: ${t.r} right · ${t.w} wrong</div>`:''),
    onBack:backFn||(()=>lexicon(q||''))
  });
}

/* ================= THE FORGE ================= */
/* A missed word can be reworked from several angles, not one. forgeModes lists
   every drill facet a given word can support; the Forge draws a spread of them
   per word, and each penalty rep re-picks a fresh angle so a miss is met from a
   new direction rather than the same failed prompt. */
const FORGE_ANGLES = 2;       // distinct angles served per weak word in a Forge run
const FORGE_NOW_ANGLES = 2;   // angles in the on-the-spot rework after a gate miss
// The rework offered mid-trial is part of the trial: no sense-shift angles, whatever the
// word happens to support. The Forge proper, opened from home, keeps them.
function reworkAngles(w:Word):QuizItem["m"][]{ return trialReworkModes(w,!!vigOf(w)); }
function pickAngles(w:Word,n:number):QuizItem["m"][]{ return pickForgeModes(w,!!vigOf(w),n,deps.random,!!wasOf(w)&&!!shiftLabelOf(w)); }
function reangle(f:QuizItem,w:Word):QuizItem{ return reangleForgeItem(f,w,!!vigOf(w),deps.random,!!wasOf(w)&&!!shiftLabelOf(w)); }
function weakWords():SealedWord[]{
  // Lowered threshold: a single miss now qualifies, and words linger until they
  // are answered right three times over for each miss (t.w*3 >= t.r).
  return selectWeakWords(sealedWords(),P.ledger);
}
function startForge():void{
  const wk=weakWords();
  const items:QuizItem[]=[];
  wk.forEach(x=>{ const w=wordAt(x.gi,x.wi); pickAngles(w,FORGE_ANGLES).forEach(m=>items.push({gi:x.gi,wi:x.wi,m})); });
  if(!items.length) return home();
  S={kind:'FORGE',queue:shuffle(items),debt:0,done:0,words:wk.length,sit:{cleared:0,ahead:0}};
  forgeItem();
}
function forgeItem():void{
  const session=requireSession("FORGE");
  if(session.queue.length===0){
    const n=session.words||session.done;
    sealScreen({seal:'⚒',title:'Forge Cleared',score:n+(n===1?' word reworked':' words reworked')+(session.debt?' · '+session.debt+' penalty reps':''),
      note:'The tallies remember. Miss them less and they leave the Forge on their own.',
      actions:'<button class="btn" id="h2">The Gates →</button>'});
    requiredButton('h2').onclick=home;
    return;
  }
  const it=session.queue[0];
  if(!it || it.gi===undefined || it.wi===undefined) throw new Error("Invalid Forge item");
  const w=wordAt(it.gi,it.wi);
  renderTrialPrompt({
    label:'The Forge', gateLabel:'Gate '+rom(gateAt(it.gi).id), it, w,
    onResolve: (ok:boolean)=>{
      tally(it.gi!,it.wi!,ok);
      if(ok){ session.queue.shift(); session.done++; session.sit.cleared++; }
      else {
        const f=session.queue.shift();
        if(!f) throw new Error("Forge queue unexpectedly empty");
        session.queue.push(reangle(f,w)); session.queue.push(reangle(f,w)); session.debt++;
      }
      return ok?null:'it returns to the queue from a fresh angle, plus a penalty rep';
    },
    onNext: forgeItem
  });
}
/* On-the-spot rework: the moment a word is missed inside a gate, the learner can
   drill it straight away from a couple of fresh angles (skipping the one just
   failed), after which control returns to the gate exactly where it was left. */
function forgeNow(gi:number,wi:number,skipMode:QuizItem["m"],resume:()=>void):void{
  const w=wordAt(gi,wi);
  const modes=shuffle(reworkAngles(w).filter(m=>m!==skipMode)).slice(0,FORGE_NOW_ANGLES);
  if(!modes.length) return resume();
  if(!S) throw new Error("Forge rework requires a resumable session");
  S={kind:'FORGENOW', queue:modes.map(m=>({gi,wi,m})), pos:0, debt:0, resume, saved:S};
  forgeNowItem();
}
function forgeNowItem():void{
  const session=requireSession("FORGENOW");
  if(session.pos>=session.queue.length){ const r=session.resume; S=session.saved; return r(); }
  const it=session.queue[session.pos];
  if(!it || it.gi===undefined || it.wi===undefined) throw new Error("Invalid immediate Forge item");
  const w=wordAt(it.gi,it.wi);
  renderTrialPrompt({
    label:'The Forge · '+(session.pos+1)+' of '+session.queue.length,
    gateLabel:'Reworking · Gate '+rom(gateAt(it.gi).id),
    it, w, oneShot:true,
    onResolve: (ok:boolean)=>{ tally(it.gi!,it.wi!,ok); session.pos++; return null; },
    onNext: forgeNowItem
  });
}

/* ================= THE DRILL HALL (adaptive) =================
   A Rasch (1PL) engine: every drill word carries a difficulty b; the learner
   carries an ability θ. P(correct) = 1/(1+e^−(θ−b)). Each answer nudges θ by
   K·(result − P), K annealing with experience — so the drill converges on
   words you get right about seven times in ten, and climbs as you do. */
const DRILL_TLOGIT = Math.log(0.72/0.28);   // serve items near 72% expected success
function sig(x:number):number{ return sigmoid(x); }
function drillWords():DrillWord[]{ return DRILL_POOL.filter(d=>G(d.req).sealed); }
function caliber():number{ return calculateCaliber(P.drill.theta); }

/* ---- drill modalities: the same stock, attacked from every side ----
   Each word rotates through fresh angles before any repeats: recognize the
   meaning, fit the sentence, read the pieces literally, name what one piece
   carries, claim the etymology, spot the kin, assemble it, then produce it
   cold. Typed production is scored harder than recognition (MODE_SHIFT). */
function litOf(w:Word|DrillWord):string{ return literalReading(w); }
function sharedPrefix(a:string,b:string):number{ return sharedPrefixLength(a,b); }
function kinPick(w:Word|DrillWord):string|null{ return pickKin(w,deps.random); }
function drillFoils(
  w:Word|DrillWord,
  n:number,
  extra?:((candidate:Word|DrillWord)=>boolean),
  avoidShared=false
):string[]{
  return selectDrillFoils(
    w,n,[...drillWords(),...sealedWords().map(x=>x.w)],deps.random,extra,avoidShared
  );
}
function glossFoils(part:WordPart,w:Word|DrillWord):string[]{
  const correct=part[1];
  const bad=(g:string):boolean=>g===correct||g.includes(correct)||correct.includes(g);
  const own=w.parts.filter(p=>p[1]&&p!==part&&!bad(p[1])).map(p=>p[1]);
  const pool=new Set<string>();
  drillWords().forEach(x=>x.parts.forEach(p=>{ if(p[1]&&p[0].length>1) pool.add(p[1]); }));
  LEVELS.forEach(l=>{ if(G(l.id).sealed&&l.quizRoots) l.quizRoots.forEach(r=>pool.add(r.gloss)); });
  const foils=shuffle([...pool].filter(g=>!bad(g)&&!own.includes(g)));
  return shuffle([correct,...shuffle([...own.slice(0,1),...foils.slice(0,3)]).slice(0,3)]);
}
function maskEty(text:string,word:string):string{
  return maskEtymology(text,word);
}
function drillMode(d:DrillWord,s:DrillHistory|undefined):QuizMode{
  return chooseDrillMode(d,s,deps.random);
}
function rootsItem():QuizItem|null{
  const gs=LEVELS.filter(l=>G(l.id).sealed&&l.quizRoots&&l.quizRoots.length);
  if(!gs.length) return null;
  const g=gs[Math.floor(deps.random.next()*gs.length)]!;
  const r=g.quizRoots[Math.floor(deps.random.next()*g.quizRoots.length)];
  if(!r) return null;
  const all=new Set<string>();
  gs.forEach(x=>x.quizRoots.forEach(t=>{ if(t.gloss!==r.gloss&&!t.gloss.includes(r.gloss)&&!r.gloss.includes(t.gloss)) all.add(t.gloss); }));
  const foils=shuffle([...all]).slice(0,3);
  if(foils.length<3) return null;
  return {m:'ROOTS',root:r,gate:g.id,opts:shuffle([r.gloss,...foils])};
}
function drillStat(blocked:boolean):HomeDrillStat{
  const open=drillWords();
  const ok=open.length&&!blocked;
  return {enabled:!!ok,visible:open.length>0,label:blocked?'Docket first':'Drill'};
}
function startDrill():void{
  stopClock();
  if(!RS.active()) return paywall('drill');
  if(!P.drill.n) return drillIntro();
  drillMenu();
}
function drillIntro():void{
  renderDrillIntro({app,onHome:home,onEnter:drillMenu});
}
type DrillCandidate =
  | {t:"new";d:DrillWord;score:number}
  | {t:"rev";x:SealedWord;b:number;score:number};
function drillPick():DrillCandidate|undefined{
  const session=requireSession("DRILL");
  const tgt=P.drill.theta-DRILL_TLOGIT;
  const cands:DrillCandidate[]=[];
  const consider=(rec:string[]):void=>{
    drillWords().forEach(d=>{ if(rec.includes(d.word)) return;
      const s=P.drill.seen[d.word];
      let score=-Math.abs(d.b-tgt);
      if(!s) score+=0.35;                          // fresh stock first
      else if(s.r-s.w>=2) score-=0.8;              // mastered — retire gently
      cands.push({t:'new',d,score:score+deps.random.next()*0.3});
    });
    // seasoning: about one item in four revisits the sealed gates
    const pool=sealedWords();
    if(session.focus!=='new' && pool.length && (deps.random.next()<0.25 || !cands.length)){
      for(let k=0;k<3;k++){
        const x=pool[Math.floor(deps.random.next()*pool.length)];
        if(!x) continue;
        if(rec.includes(x.w.word)) continue;
        const t=P.ledger[x.gi+'-'+x.wi]||{r:0,w:0};
        const b=-1.8+x.gi*0.13+(t.w>t.r?0.5:0);
        cands.push({t:'rev',x,b,score:-Math.abs(b-tgt)-0.15+deps.random.next()*0.3});
      }
    }
  };
  consider(session.recent);
  if(!cands.length) consider([]);
  cands.sort((a,b)=>b.score-a.score);
  return cands[0];
}
function drillItem():void{
  const session=requireSession("DRILL");
  const tuneTheta=(ok:boolean,b:number):void=>{
    const pExp=sig(P.drill.theta-b);
    const K=Math.max(0.14,0.5/Math.sqrt(1+P.drill.n/5));
    P.drill.theta=Math.max(-3.5,Math.min(3.5,P.drill.theta+K*((ok?1:0)-pExp)));
    P.drill.n++; session.n++; if(ok)session.right++;
  };
  // about one item in eight steps back to the roots themselves
  if(session.focus==='all' && deps.random.next()<0.12){
    const rit=rootsItem();
    if(rit){
      session.queue=[1];
      renderTrialPrompt({label:'The Drill Hall',gateLabel:'The roots · Gate '+rom(rit.gate||0),it:rit,w:null,
        onResolve:(ok:boolean)=>{ tuneTheta(ok,-0.5); save(); return ok?null:'the drill eases to caliber '+caliber(); },
        onNext:drillItem});
      drillMeta(); return;
    }
  }
  const pick=drillPick();
  if(!pick) return home();
  let it:QuizItem,w:Word|DrillWord,b:number;
  if(pick.t==='rev'){
    w=wordAt(pick.x.gi,pick.x.wi);
    const ms:QuizMode[]=['REC','PROD'];
    if(vigOf(w)) ms.push('VIG');
    if(w.parts.some(p=>p[1]&&p[0].length>1)) ms.push('ROOTQ');
    const m=ms[Math.floor(deps.random.next()*ms.length)]!;
    it={gi:pick.x.gi,wi:pick.x.wi,m};
    if(m==='ROOTQ'){ const cs=w.parts.filter(p=>p[1]&&p[0].length>1); const part=cs[Math.floor(deps.random.next()*cs.length)]; if(part){ it.part=part; it.opts=glossFoils(part,w); } }
    b=pick.b+(MODE_SHIFT[m]||0);
    it.drillB=b;
  } else {
    const d=pick.d; w=d;
    const s=P.drill.seen[d.word];
    const m=drillMode(d,s);
    it={m,drill:d};
    if(m==='DSENT'){
      const near=drillWords().filter(x=>x.word!==d.word)
        .sort((a,c)=>Math.abs(a.b-d.b)-Math.abs(c.b-d.b)).slice(0,6);
      it.opts=shuffle([d.word,...shuffle(near).slice(0,3).map(x=>x.word)]);
    } else if(m==='LIT'){
      it.opts=shuffle([d.word,...drillFoils(d,3)]);
    } else if(m==='ETY'){
      it.masked=maskEty(d.ety,d.word);
      it.opts=shuffle([d.word,...drillFoils(d,3,x=>!d.ety.toLowerCase().includes(x.word.slice(0,5).toLowerCase()),true)]);
    } else if(m==='KIN'){
      it.kin=kinPick(d);
      const kin=it.kin;
      it.opts=shuffle([d.word,...drillFoils(d,3,x=>!!kin&&sharedPrefix(x.word,kin)<4&&!(x.kin||[]).includes(kin),true)]);
    } else if(m==='ROOTQ'){
      const cs=d.parts.filter(p=>p[1]&&p[0].length>1);
      const part=cs[Math.floor(deps.random.next()*cs.length)];
      if(part){ it.part=part; it.opts=glossFoils(part,d); }
    }
    b=d.b+(MODE_SHIFT[m]||0);
    it.drillB=b;
  }
  session.recent.push(w.word); if(session.recent.length>8) session.recent.shift();
  session.queue=[1];
  const isNew = pick.t==='new' && !P.drill.seen[w.word];
  renderTrialPrompt({
    label:'The Drill Hall',
    gateLabel: pick.t==='rev' ? 'Review · Gate '+rom(gateAt(it.gi!).id)
             : isNew && pick.t==='new' ? 'New stock · unlocked by Gate '+rom(pick.d.req) : '',
    it,w,
    onResolve: (ok:boolean)=>{
      tuneTheta(ok,b);
      if(pick.t==='rev') tally(it.gi!,it.wi!,ok);
      else { const s=P.drill.seen[w.word]||(P.drill.seen[w.word]={r:0,w:0}); ok?s.r++:s.w++;
        s.m=s.m||[]; s.m.push(it.m); if(s.m.length>12) s.m.shift(); }
      save();
      return ok?null:'the drill eases to caliber '+caliber();
    },
    onNext: drillItem
  });
  drillMeta();
}
function drillMeta():void{
  const session=requireSession("DRILL");
  const cal=caliber();
  updateDrillMeta({
    app,left:'Caliber '+cal,right:session.n?session.right+' of '+session.n+' this sitting':'endless · leave anytime',
    progressPercent:cal,onBack:drillMenu
  });
}

/* ================= THE DRILL HALL · FOCUS MENU =================
   Tapping Drill opens a menu of focuses — roots, definitions,
   etymology, usage, word families, new stock, or one adaptive mix.
   The scheduling engine below stays hidden. Within a focus it:
     · reintroduces items answered WRONG sooner and more often (weight
       up, due in ~2 steps), and rests the ones you know (weight decays,
       due pushed out on a growing Leitner ladder) — so nothing shows
       too quickly or too late;
     · covers every item once before repeating (unseen bonus + a
       recent-cooldown), so you don't see too much of the same root;
     · quietly raises the bar from multiple-choice to typed recall as
       your grip on an item tightens (mastery-gated tier ramp).
   The goal is proficiency across every term and root. */
const FOCUSES:readonly FocusDefinition[]=[
  {id:'roots',label:'Roots',blurb:'The Latin and Greek pieces themselves — each root and the sense it carries.',kind:'root',mc:['ROOTS'],hard:['ROOTT']},
  {id:'defs',label:'Definitions',blurb:'Each word against its meaning — recognized first, then produced from memory.',kind:'word',mc:['REC','REV'],hard:['PROD']},
  {id:'ety',label:'Etymology',blurb:'Where a word comes from, and the literal reading of its pieces.',kind:'word',mc:['ETY','LIT'],hard:['LITT']},
  {id:'shift',label:'Sense-shift',blurb:'What a word used to mean, and how it moved to what it means now.',kind:'word',mc:['SENSE','SHIFT'],hard:['SENSET']},
  {id:'usage',label:'Usage',blurb:'The word alive in a sentence — the sense it takes in context.',kind:'word',mc:['DSENT','VIG'],hard:['CLOZE','VIGT']},
  {id:'kin',label:'Word families',blurb:'Words of one blood — spot the kin, then assemble them piece by piece.',kind:'word',mc:['KIN'],hard:['COMPOSE']},
  {id:'new',label:'New stock',blurb:'Advanced words the gates never taught, each built from roots you have sealed.',kind:'new'},
  {id:'all',label:'Everything',blurb:'One adaptive mix — every word and root, attacked from every side.',kind:'all'}
];
const FOCUS_GLYPH:Readonly<Record<FocusId,string>>={roots:'❦',defs:'≡',ety:'❧',shift:'↻',usage:'❝',kin:'⁂',new:'✦',all:'⌖'};
const FBOX=[3,4,6,9,13,18];

interface SealedRoot {root:Root;gate:number}
function sealedRoots():SealedRoot[]{ const seen=new Set<string>(),out:SealedRoot[]=[]; LEVELS.forEach(l=>{ if(G(l.id).sealed&&l.quizRoots) l.quizRoots.forEach(r=>{ const key=r.key||r.root; if(!seen.has(key)){ seen.add(key); out.push({root:r,gate:l.id}); } }); }); return out; }
function buildFocusPool(f:FocusDefinition):FocusEntry[]{
  if(f.kind==='root') return sealedRoots().map(x=>({key:'r:'+(x.root.key||x.root.root),kind:'root',root:x.root,gate:x.gate}));
  const seen=new Set<string>(),out:FocusEntry[]=[];
  LEVELS.forEach((l,gi)=>{ if(G(l.id).sealed) l.words.forEach((w,wi)=>{ if(!seen.has(w.word)){ seen.add(w.word); out.push({key:'w:'+w.word,kind:'word',d:w,gi,wi}); } }); });
  drillWords().forEach(d=>{ if(!seen.has(d.word)){ seen.add(d.word); out.push({key:'w:'+d.word,kind:'word',d,drill:true}); } });
  return out.filter(e=> (f.mc||[]).some(m=>feasible(e,m)) || (f.hard||[]).some(m=>feasible(e,m)) );
}
function focusCount(f:FocusDefinition):number{
  if(f.kind==='root'){ const n=sealedRoots().length; return n>=4?n:0; }
  if(f.kind==='new'||f.kind==='all') return drillWords().length;
  return buildFocusPool(f).length;
}
function drillMenu():void{
  stopClock(); S=null; P=load();
  const focuses=FOCUSES.map(f=>{
    const ok=focusCount(f)>0;
    const note = ok ? f.blurb : (f.kind==='root'?'Seal more gates to gather roots.':'Seal a gate to open this.');
    return {id:f.id,glyph:FOCUS_GLYPH[f.id],label:f.label,note,enabled:ok};
  });
  renderDrillMenu({app,focuses,onHome:home,onFocus:startFocus});
}
function startFocus(id:string):void{
  stopClock();
  const f=FOCUSES.find(x=>x.id===id);
  if(id==='all'||id==='new'){ S={kind:'DRILL',focus:id,n:0,right:0,recent:[],queue:[1],debt:0,sit:{cleared:0,ahead:0}}; return drillItem(); }
  if(!f || f.id==="all" || f.id==="new") return drillMenu();
  const pool=buildFocusPool(f);
  if(!pool.length) return drillMenu();
  S={kind:'DRILL',focus:f.id,fdef:f,n:0,right:0,recent:[],step:0,sched:{},pool,queue:[1],debt:0,sit:{cleared:0,ahead:0}};
  focusItem();
}
function feasible(e:FocusEntry,mode:QuizMode):boolean{
  if(e.kind==='root') return mode==='ROOTS'||mode==='ROOTT';
  const d=e.d;
  switch(mode){
    case 'REC': return !!(d.distractors&&d.distractors.length>=3);
    case 'REV': return e.gi!=null && gateAt(e.gi).words.length>=4;
    case 'PROD': return true;
    case 'DSENT': case 'CLOZE': return !!d.sentence;
    case 'VIG': return e.gi!=null && !!vigOf(d);
    case 'VIGT': return !!vigOf(d);
    case 'LIT': case 'LITT': return d.parts.filter(p=>p[1]).length>=2;
    case 'ETY': return !!etyOf(d);
    // All three sense-shift modes stand on the same authored pair, which most words lack.
    case 'SENSE': case 'SENSET': case 'SHIFT': return !!wasOf(d) && !!shiftLabelOf(d);
    case 'KIN': return !!kinPick(d);
    case 'ROOTQ': return d.parts.some(p=>p[1]&&p[0].length>1);
    case 'COMPOSE': return d.parts.length>=2;
  }
  return false;
}
function masteryOf(e:FocusEntry):number{ const s = e.kind==='root'?P.drill.roots[e.root.key||e.root.root]:P.drill.seen[e.d.word]; return s?s.r-s.w:0; }
// hidden scheduler: coverage-first, wrong-answers sooner/heavier, known items rested
function focusPick():FocusEntry{
  const session=requireFocusSession();
  const step=session.step;
  let cand=session.pool.filter(e=>!session.recent.includes(e.key));
  if(!cand.length) cand=session.pool.slice();
  let best=cand[0],bestScore=-1e9;
  if(!best) throw new Error("Focus drill has no eligible items");
  for(const e of cand){
    const sc=session.sched[e.key]||{due:0,weight:1,box:0,seen:false};
    const m=masteryOf(e);
    let score = sc.weight + (sc.seen?0:1.4) - Math.max(0,m-4)*0.4 + deps.random.next()*0.45;
    score += sc.due<=step ? (step-sc.due)*0.12 : -(sc.due-step)*0.5;
    if(score>bestScore){ bestScore=score; best=e; }
  }
  return best;
}
// mastery-gated MC → typed: eligible at net +3, ramping to certain by +6
function pickMode(f:FocusDefinition,e:FocusEntry):QuizMode{
  const mc=(f.mc||[]).filter(x=>feasible(e,x)), hard=(f.hard||[]).filter(x=>feasible(e,x));
  const m=masteryOf(e);
  let useHard=false;
  if(hard.length){ if(!mc.length) useHard=true; else if(m>=3) useHard=deps.random.next()<Math.min(1,(m-2)/4); }
  const bank = useHard?hard:(mc.length?mc:hard);
  const s = e.kind==='root'?P.drill.roots[e.root.key||e.root.root]:P.drill.seen[e.d.word];
  const last = s&&s.m&&s.m[s.m.length-1];
  const fresh = bank.filter(x=>x!==last);
  const use = fresh.length?fresh:bank;
  const mode=use[Math.floor(deps.random.next()*use.length)];
  if(!mode) throw new Error(`Focus ${f.id} has no feasible mode`);
  return mode;
}
// `neighbours` supplies DSENT's wrong-word choices. Passing them in rather than reaching
// for the focus session's pool is what lets the Docket build items with this too.
function mkItem(e:FocusEntry,mode:QuizMode,neighbours:readonly (Word|DrillWord)[]):{it:QuizItem;w:Word|DrillWord|null;b:number}{
  if(e.kind==='root'){
    const r=e.root; let it:QuizItem;
    if(mode==='ROOTT') it={m:'ROOTT',root:r};
    else {
      const all=new Set<string>();
      sealedRoots().forEach(x=>{ const g=x.root.gloss; if(g!==r.gloss&&!g.includes(r.gloss)&&!r.gloss.includes(g)) all.add(g); });
      it={m:'ROOTS',root:r,opts:shuffle([r.gloss,...shuffle([...all]).slice(0,3)])};
    }
    return {it,w:null,b:-0.5+(MODE_SHIFT[mode]||0)};
  }
  const d=e.d, it:QuizItem={m:mode};
  if(e.gi!=null){ it.gi=e.gi; if(e.wi!=null) it.wi=e.wi; }
  if(mode==='PROD'||mode==='CLOZE'||mode==='VIGT'||mode==='LITT'||mode==='SENSET') it.drill=d;
  else if(mode==='DSENT'){
    const near=neighbours.filter(x=>x.word!==d.word)
      .sort((a,c)=>Math.abs(("b" in a?a.b:0)-("b" in d?d.b:0))-Math.abs(("b" in c?c.b:0)-("b" in d?d.b:0))).slice(0,6);
    it.opts=shuffle([d.word,...shuffle(near).slice(0,3).map(x=>x.word)]);
  }
  else if(mode==='LIT') it.opts=shuffle([d.word,...drillFoils(d,3)]);
  else if(mode==='SENSE'){
    // Same shape as REV: the stimulus is a meaning and the options are headwords, so the
    // foils come from the confusability ranking rather than at random.
    it.opts=shuffle([d.word,...drillFoils(d,3)]); }
  else if(mode==='SHIFT'){
    // Options are the five kinds themselves — the answer and three of the other four.
    const right=shiftLabelOf(d);
    const others=shuffle(SHIFT_KINDS.map(k=>SHIFT_LABELS[k]).filter(l=>l!==right)).slice(0,3);
    it.opts=shuffle([right,...others]); }
  else if(mode==='ETY'){ const t=etyOf(d); it.masked=maskEty(t,d.word);
    it.opts=shuffle([d.word,...drillFoils(d,3,x=>!t.toLowerCase().includes(x.word.slice(0,5).toLowerCase()),true)]); }
  else if(mode==='KIN'){ it.kin=kinPick(d); const kin=it.kin;
    it.opts=shuffle([d.word,...drillFoils(d,3,x=>!!kin&&sharedPrefix(x.word,kin)<4&&!(x.kin||[]).includes(kin),true)]); }
  else if(mode==='ROOTQ'){ const cs=d.parts.filter(p=>p[1]&&p[0].length>1); const part=cs[Math.floor(deps.random.next()*cs.length)]; if(part){ it.part=part; it.opts=glossFoils(part,d); } }
  else if(mode==='COMPOSE') it.drill=d;
  const base = e.drill ? ("b" in d?d.b:0) : (-1.8+(e.gi||0)*0.13);
  return {it,w:d,b:base+(MODE_SHIFT[mode]||0)};
}
function drillTune(ok:boolean,b:number):void{
  const session=requireSession("DRILL");
  const next=updateAbility(P.drill.theta,P.drill.n,b,ok);
  P.drill.theta=next.theta; P.drill.n=next.attempts; session.n++; if(ok)session.right++;
}
function focusItem():void{
  const session=requireFocusSession();
  const e=focusPick();
  const mode=pickMode(session.fdef,e);
  const {it,w,b}=mkItem(e,mode,session.pool.flatMap(x=>x.kind==='word'?[x.d]:[]));
  const cd=Math.min(session.pool.length-1,5);
  session.recent.push(e.key); while(session.recent.length>cd) session.recent.shift();
  session.queue=[1];
  const gl = e.kind==='root' ? 'The roots · Gate '+rom(e.gate)
           : e.gi!=null ? 'Review · Gate '+rom(gateAt(e.gi).id)
           : 'Advanced stock';
  renderTrialPrompt({
    label:'The Drill Hall', gateLabel:gl, it, w,
    onResolve: (ok:boolean)=>{
      drillTune(ok,b);
      if(e.kind==='root'){ const rk=e.root.key||e.root.root; const s=P.drill.roots[rk]||(P.drill.roots[rk]={r:0,w:0}); ok?s.r++:s.w++; s.m=s.m||[]; s.m.push(mode); if(s.m.length>8)s.m.shift(); }
      else { if(e.gi!=null && e.wi!=null) tally(e.gi,e.wi,ok);
        const s=P.drill.seen[e.d.word]||(P.drill.seen[e.d.word]={r:0,w:0}); ok?s.r++:s.w++; s.m=s.m||[]; s.m.push(mode); if(s.m.length>12)s.m.shift(); }
      const sc=session.sched[e.key]||(session.sched[e.key]={due:0,weight:1,box:0,seen:false});
      sc.seen=true;
      if(ok){ sc.box=Math.min(sc.box+1,FBOX.length-1); sc.weight=Math.max(sc.weight*0.55,0.35); sc.due=session.step+(FBOX[sc.box]||3); }
      else { sc.box=Math.max(sc.box-1,0); sc.weight=Math.min(sc.weight+1.6,4.5); sc.due=session.step+2; }
      session.step++; save();
      return ok?null:'the drill eases — that one returns soon';
    },
    onNext: focusItem
  });
  focusMeta();
}
function focusMeta():void{
  const session=requireFocusSession();
  updateDrillMeta({
    app,left:session.fdef.label,right:session.n?session.right+' of '+session.n+' this sitting':'endless · leave anytime',
    progressPercent:caliber(),onBack:drillMenu
  });
}
function rootOpts(gi:number,r:Root):string[]{
  const seen=new Set([r.gloss]),foils:string[]=[];
  const take=(list:readonly Root[]):void=>{ for(const t of shuffle(list)){ if(seen.has(t.gloss)||t.gloss.includes(r.gloss)||r.gloss.includes(t.gloss)) continue; seen.add(t.gloss); foils.push(t.gloss); if(foils.length===3)return; } };
  take(gateAt(gi).quizRoots.filter(x=>x!==r));
  if(foils.length<3) LEVELS.forEach(l=>{ if(foils.length<3&&l.quizRoots) take(l.quizRoots); });
  return shuffle([r.gloss,...foils.slice(0,3)]);
}
function normRoot(s:string):string{ return normalizeRoot(s||''); }
function rootForms(r:Root):string[]{ return getRootForms(r); }
function rootMatch(input:string,r:Root):boolean{ return rootMatches(input,r); }
function rootCue(r:Root):string{ return letterCue(rootForms(r)[0]||r.root); }

function sealScreen(options:SealScreenOptions):void{
  renderSealScreen(app,options);
}

/* ===================================================================
   MONETIZATION / ACCESS LAYER
   The first FREE_GATES gates are free; a subscription opens the rest,
   the Bar, and the Drill Hall. Entitlement is owned by the native
   wrapper (StoreKit); this JS reads it through a small bridge and
   falls back to a local simulation when run outside the app (web
   preview) so the whole flow stays demoable. See NATIVE.md.
   =================================================================== */
const FREE_GATES = 3;
const LEGAL = { privacy:'legal/privacy.html', terms:'legal/terms.html', support:'legal/support.html' };

const RS = new EntitlementController({
  storage: deps.storage,
  clock: deps.clock,
  port: deps.entitlement,
  devPreview: previewFlag("dev"),
  notify: rsToast,
  onChange: ()=>{
    if(!S && document.getElementById('cta')) home();
  }
});

let toastTimer:ReturnType<typeof setTimeout>|undefined;
function rsToast(msg:string):void{
  let t=document.getElementById('rs-toast');
  if(!t){ t=document.createElement('div'); t.id='rs-toast'; document.body.appendChild(t); }
  t.textContent=msg; t.classList.add('show');
  if(toastTimer!==undefined) clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'), 2400);
}

/* ================= ONBOARDING (first run) ================= */
function onboarding(step=0):void{
  stopClock(); S=null;
  const done=()=>{ P.onboarded=true; save(); home(); };
  renderOnboarding({
    app,
    step:step||0,
    gateCount:LEVELS.length,
    onNext:onboarding,
    onDone:done,
    onPlans:()=>{ P.onboarded=true; save(); paywall('intro'); }
  });
}

/* ================= PAYWALL ================= */
function paywall(ctx:"bar"|"drill"|"gate"|"intro"|"upgrade", idx?:number):void{
  stopClock(); S=null;
  const gate=ctx==='gate' && idx!==undefined ? gateAt(idx) : null;
  const ctxLine = ctx==='bar' ? 'The Bar' : ctx==='drill' ? 'The Drill Hall'
    : gate ? 'Gate '+rom(gate.id)+' \u00b7 '+gate.title : 'Rootstock Full';
  renderPaywall({
    app,
    contextLabel:ctxLine,
    gateCount:LEVELS.length,
    trialDays:RS.trialDays(),
    prices:RS.prices(),
    onBack:home,
    onPurchase:plan=>RS.purchase(plan),
    onRestore:()=>RS.restore(),
    onTerms:()=>RS.openURL(LEGAL.terms),
    onPrivacy:()=>RS.openURL(LEGAL.privacy)
  });
}

/* ================= SETTINGS & ACCOUNT ================= */
function settings():void{
  stopClock(); S=null; P=load();
  renderSettings({
    app,
    active:RS.active(),
    trial:RS.inTrial(),
    planName:RS.planName(),
    trialDaysLeft:RS.trialDaysLeft(),
    gateCount:LEVELS.length,
    currentTheme:currentAppearance(),
    predictionEnabled:P.predict,
    onHome:home,
    onUpgrade:()=>paywall('upgrade'),
    onManage:()=>RS.manage(),
    onRestore:()=>RS.restore(),
    onBackup:backupModal,
    onRestoreCode:restoreModal,
    onPrivacy:()=>RS.openURL(LEGAL.privacy),
    onTerms:()=>RS.openURL(LEGAL.terms),
    onSupport:()=>RS.openURL(LEGAL.support),
    onTogglePrediction:()=>{ P.predict=!P.predict; save(); settings(); },
    onTheme:theme=>{
      P.appearance=theme;
      appearanceController.apply(P.appearance,true);
      appearanceController.syncAmbience();
      save();
      settings();
      rsToast(appearanceName(theme)+' is active');
    }
  });
}

/* ================= BOOT ================= */
function boot():void{
  P=load();
  P.appearance=currentAppearance();
  appearanceController.apply(P.appearance);
  RS.requestStatus();
  const cog=document.getElementById('cog'); if(cog) cog.onclick=settings;
  if(!P.onboarded) return onboarding(0);
  home();
}
boot();
}
