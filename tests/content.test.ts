import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ContentCatalog } from "../src/domain/catalog";
import type { DrillWord, InferenceWord, Word } from "../src/types/content";
import {
  AFFIX_DEEP,
  COGNATES,
  CONFUSABLES,
  DEPTH,
  DRILL_POOL,
  ETYM,
  INFER_POOL,
  LEVELS,
  ROOT_DEEP,
  SHIFT_KINDS,
  SIMILARS
} from "../src/content";
import { AUDIO_MANIFEST } from "../src/content/audio-manifest";
import { ROOT_PRONUNCIATION_SEEDS } from "../src/content/root-pronunciation-seeds";
import { normalizeRoot, rootForms } from "../src/domain/roots";

const gateWords = LEVELS.flatMap((gate) => gate.words);
const allWords = [...gateWords, ...INFER_POOL, ...DRILL_POOL];
const etymology = ETYM as Readonly<Record<string, string>>;
const depthEntries = DEPTH as Readonly<Record<string, unknown>>;
const similarEntries = SIMILARS as Readonly<Record<string, readonly string[]>>;

function optionStats(words: Array<{ def: string; distractors: string[] }>) {
  const correctLongest = words.filter((word) =>
    word.def.length >= Math.max(...word.distractors.map((distractor) => distractor.length))
  ).length;
  const averageDefinition = words.reduce((sum, word) => sum + word.def.length, 0) / words.length;
  const distractors = words.flatMap((word) => word.distractors);
  const averageDistractor = distractors.reduce((sum, value) => sum + value.length, 0) / distractors.length;
  return {
    longestPercent: (correctLongest / words.length) * 100,
    averageGap: Math.abs(averageDefinition - averageDistractor)
  };
}

function inferenceCoverage() {
  const stop = new Set(["to", "of", "the", "a", "an", "one", "who", "or", "and", "in", "on", "by", "for", "esp", "via", "from", "with", "as", "it", "that"]);
  const affix = new Set(["ist", "er", "or", "y", "ic", "ical", "al", "ation", "ition", "tion", "ion", "ate", "ity", "ism", "ous", "ary", "ory", "ent", "ant", "ia", "ish", "ize", "ise", "ly", "ness", "ment", "age", "ure", "ble", "able", "ible"]);
  const tokens = (gloss: string) => gloss.toLowerCase().split(/[^a-z]+/)
    .map((word) => word.replace(/(ing|s|ed|e)$/, ""))
    .filter((word) => word.length >= 3 && !stop.has(word));
  const formOwner = new Map<string, number>();
  const conceptOwner = new Map<string, number>();
  LEVELS.forEach((gate, gateIndex) => gate.quizRoots?.forEach((root) => {
    rootForms(root).map(normalizeRoot).filter((form) => form.length > 1)
      .forEach((form) => { if (!formOwner.has(form)) formOwner.set(form, gateIndex); });
    tokens(root.gloss).forEach((token) => {
      if (!conceptOwner.has(token)) conceptOwner.set(token, gateIndex);
    });
  }));
  const taughtFormAt = (form: string): number => {
    if (formOwner.has(form)) return formOwner.get(form)!;
    for (const [candidate, owner] of formOwner) {
      if ((candidate.length >= 3 && form.startsWith(candidate))
        || (form.length >= 3 && candidate.startsWith(form))) return owner;
    }
    return -1;
  };
  const taughtConceptAt = (gloss: string): number => {
    let best = -1;
    for (const token of tokens(gloss)) {
      let owner = conceptOwner.get(token) ?? -1;
      if (owner < 0) {
        for (const [candidate, candidateOwner] of conceptOwner) {
          if (token.length >= 4 && (candidate.startsWith(token) || token.startsWith(candidate))) {
            owner = candidateOwner;
            break;
          }
        }
      }
      if (owner >= 0 && (best < 0 || owner < best)) best = owner;
    }
    return best;
  };
  return INFER_POOL.flatMap((word) => word.parts.flatMap(([surface, gloss]) => {
    const form = normalizeRoot(surface);
    if (form.length < 3 || affix.has(form) || !gloss.trim()) return [];
    const taughtAt = [taughtFormAt(form), taughtConceptAt(gloss)].filter((owner) => owner >= 0).sort((a, b) => a - b)[0];
    return taughtAt === undefined || taughtAt > word.req
      ? [`${word.word}: ${surface} (${gloss}) at ${String(taughtAt)} > ${word.req}`]
      : [];
  }));
}

describe("runtime content", () => {
  it("has stable unique gates and headwords", () => {
    expect(LEVELS).toHaveLength(24);
    expect(new Set(LEVELS.map((gate) => gate.id)).size).toBe(LEVELS.length);
    expect(new Set(allWords.map((word) => word.word.toLowerCase())).size).toBe(allWords.length);
  });

  it("keeps every multiple-choice item structurally valid", () => {
    for (const word of allWords) {
      expect(word.distractors, word.word).toHaveLength(3);
      expect(new Set([word.def, ...word.distractors]).size, word.word).toBe(4);
    }
    expect(INFER_POOL.every((word) => word.req >= 0 && word.req < LEVELS.length)).toBe(true);
    expect(DRILL_POOL.every((word) => LEVELS.some((gate) => gate.id === word.req))).toBe(true);
  });

  it("keeps inference roots taught before use", () => {
    expect(inferenceCoverage()).toEqual([]);
  });

  it("covers roots, depth notes, and audio", () => {
    for (const gate of LEVELS) {
      for (const root of gate.roots) expect(etymology[root.root], root.root).toBeTruthy();
      for (const word of gate.words) expect(depthEntries[word.word], word.word).toBeTruthy();
    }
    for (const word of allWords) {
      expect(AUDIO_MANIFEST[word.word] ?? AUDIO_MANIFEST[word.word.toLowerCase()], word.word).toBeTruthy();
    }
    for (const seed of ROOT_PRONUNCIATION_SEEDS) {
      const word = typeof seed === "string" ? seed : seed.word;
      expect(AUDIO_MANIFEST[word] ?? AUDIO_MANIFEST[word.toLowerCase()], word).toBeTruthy();
    }
    for (const [word, asset] of Object.entries(AUDIO_MANIFEST)) {
      expect(asset, word).toMatch(/^audio\/.+\.mp3$/);
      const file = fileURLToPath(new URL(`../public/${asset}`, import.meta.url));
      expect(existsSync(file), `${word}: ${asset}`).toBe(true);
      const signature = readFileSync(file).subarray(0, 3);
      const isMp3 = signature.toString("ascii") === "ID3"
        || (signature[0] === 0xff && (signature[1]! & 0xe0) === 0xe0);
      expect(isMp3, word).toBe(true);
    }
    expect(Object.keys(ROOT_DEEP).length).toBeGreaterThan(200);
  });

  it("authors sense-history stories to spec and caps the epigram", () => {
    const catalog = new ContentCatalog(LEVELS, DRILL_POOL, DEPTH, ROOT_DEEP, ETYM, COGNATES);
    const depth = DEPTH as Readonly<Record<string, { v: string; e: string; s?: string }>>;
    // Count sentence terminators, tolerating a closing quote after the stop (…of two.') so a
    // sentence that ends on a gloss still counts. Abbreviations may over-count — that is a
    // safe direction for a floor. Soft by design.
    const sentences = (text: string) => (text.match(/[.!?]['"’”)\]]*(\s|$)/g) ?? []).length;
    // The epigram doubles as the masked ETY drill prompt, where the headword is the answer;
    // a paragraph there would be an unreadable, answer-leaking prompt. Keep it a caption.
    // Only gate and drill words carry an epigram at all; inference words never had one.
    for (const word of [...gateWords, ...DRILL_POOL]) {
      expect(catalog.wordEtymology(word).length, word.word).toBeLessThanOrEqual(200);
    }
    const inferenceWords: readonly InferenceWord[] = INFER_POOL;
    let withStory = 0;
    for (const word of [...gateWords, ...DRILL_POOL, ...inferenceWords]) {
      const story = catalog.wordStory(word);
      if (!story) continue;
      withStory += 1;
      // The story is a paragraph, not an epigram: long enough to narrate a sense-shift,
      // short enough for a card. Four sentences roughly matches the five-move house style.
      expect(story.length, word.word).toBeGreaterThanOrEqual(350);
      expect(story.length, word.word).toBeLessThanOrEqual(900);
      expect(sentences(story), word.word).toBeGreaterThanOrEqual(4);
      // A story pasted from the epigram or the vignette is not a story.
      expect(story, word.word).not.toBe(depth[word.word]?.e);
      expect(story, word.word).not.toBe(depth[word.word]?.v);
    }
    // Every headword in every pool now carries one. The ratchet this replaced is finished:
    // these are floors, and the failure names the words that regressed. Never weaken them.
    const missingStory = (pool: readonly (Word | DrillWord | InferenceWord)[]) =>
      pool.filter((word) => !catalog.wordStory(word)).map((word) => word.word);
    expect(missingStory(gateWords)).toEqual([]);
    expect(missingStory(DRILL_POOL)).toEqual([]);
    expect(missingStory(inferenceWords)).toEqual([]);
    expect(withStory).toBe(allWords.length);
    // Inference words were authored without the example sentence the study card renders.
    // All of them have one now, so the card never falls back to omitting the line.
    expect(inferenceWords.filter((word) => !word.sentence).map((word) => word.word)).toEqual([]);
  });

  it("authors the sense-shift pair so the SENSE prompt stays answerable", () => {
    const catalog = new ContentCatalog(LEVELS, DRILL_POOL, DEPTH, ROOT_DEEP, ETYM, COGNATES);
    const inferenceWords: readonly InferenceWord[] = INFER_POOL;
    const pool = [...gateWords, ...DRILL_POOL, ...inferenceWords];
    const unpaired: string[] = [];
    const leaks: string[] = [];
    let paired = 0;
    for (const word of pool) {
      const former = catalog.wordFormerSense(word);
      const kind = catalog.wordShiftKind(word);
      // The two are authored together or not at all: a former sense with no kind cannot be
      // asked about, and a kind with no former sense has nothing to show.
      if (Boolean(former) !== Boolean(kind)) { unpaired.push(word.word); continue; }
      if (!former || !kind) continue;
      paired += 1;
      expect(SHIFT_KINDS, word.word).toContain(kind);
      expect(former.length, word.word).toBeGreaterThanOrEqual(40);
      expect(former.length, word.word).toBeLessThanOrEqual(160);
      // If the earlier sense is the current one there was no shift worth drilling.
      expect(former.trim().toLowerCase(), word.word).not.toBe(word.def.trim().toLowerCase());
      // SENSE shows this line and asks the learner to name the word, so the line must not
      // contain it. The vignettes already satisfy the identical rule, 240 out of 240.
      const stem = word.word.toLowerCase().slice(0, Math.max(4, word.word.length - 3));
      if (former.toLowerCase().includes(stem)) leaks.push(word.word);
    }
    expect(unpaired).toEqual([]);
    expect(leaks).toEqual([]);
    // Ratchets up as each batch lands. The Drill Hall only offers the focus if enough words
    // support it, so this floor is also what keeps that menu entry worth opening.
    expect(paired).toBeGreaterThanOrEqual(98);
  });

  it("keeps similar roots symmetric and cognates meaningful", () => {
    for (const [root, similars] of Object.entries(SIMILARS)) {
      for (const similar of similars) {
        expect(similarEntries[similar], `${root} -> ${similar}`).toContain(root);
      }
    }
    const roots = new Set(LEVELS.flatMap((gate) => gate.roots.map((root) => root.root)));
    for (const [root, cognates] of Object.entries(COGNATES)) {
      expect(roots.has(root), root).toBe(true);
      expect(cognates.length, root).toBeGreaterThan(1);
    }
    for (const pair of CONFUSABLES) expect([pair.a, pair.b]).toContain(pair.ans);
  });

  it("tags every headword with the part of speech its definition uses", () => {
    for (const word of allWords) {
      expect(word.pos, word.word).toBeTruthy();
      expect(["n.", "v.", "adj.", "adv."], word.word).toContain(word.pos);
    }
    // A definition opening "To …" names an action; anything else tagged as a verb is a slip.
    for (const word of allWords) {
      if (word.pos === "v.") expect(word.def, word.word).toMatch(/^[Tt]o\s/);
      if (/^[Tt]o\s/.test(word.def)) expect(word.pos, word.word).toBe("v.");
    }
  });

  it("only offers a part-of-speech tag when it eliminates no option", () => {
    // The tag is shown on a prompt only when every option shares a part of speech, so it
    // teaches without narrowing the field. Most authored sets are mixed, which is fine —
    // what must never happen is a tag appearing over a set it could be used to filter.
    const posByText = new Map<string, string>();
    for (const word of allWords) {
      if (!word.pos) continue;
      posByText.set(word.word, word.pos);
      posByText.set(word.def, word.pos);
    }
    const shared = (options: string[]): string | null => {
      const first = posByText.get(options[0] ?? "");
      if (!first) return null;
      return options.every((option) => posByText.get(option) === first) ? first : null;
    };
    for (const word of allWords) {
      const tag = shared([word.def, ...word.distractors]);
      if (tag === null) continue;
      // Where a tag would show, it must match the answer and every foil alike.
      expect(tag, word.word).toBe(word.pos);
      for (const distractor of word.distractors) {
        expect(posByText.get(distractor), `${word.word} / ${distractor}`).toBe(word.pos);
      }
    }
  });

  it("can explain at least one piece of every word built from pieces", () => {
    // The deep panel omits what it cannot resolve, so the failure mode is a card whose
    // "Learn more" opens onto nothing. Words the corpus records as a single unanalysed
    // morpheme — glib, tyro, gauche, sinister — have nothing to decompose and simply show
    // no panel; every word that *is* built from parts must reach at least one note.
    // Known gaps: words whose pieces are spelled as stems the root corpus files under a
    // different form (man- for manus, chiro- for cheir, urb- for urbs). They show no panel
    // rather than a wrong one. Shrink this list; never grow it without a reason.
    const KNOWN_GAPS = new Set([
      "taciturn", "urbane", "manacle", "mandate", "chiropody", "ambit", "cognoscenti"
    ]);
    const catalog = new ContentCatalog(LEVELS, DRILL_POOL, DEPTH, ROOT_DEEP, ETYM, COGNATES);
    const unexplained: string[] = [];
    for (const word of allWords) {
      if (word.parts.length < 2 || KNOWN_GAPS.has(word.word)) continue;
      const explained = word.parts.some(([surface]) =>
        catalog.partDepth(surface, AFFIX_DEEP) !== ""
      );
      if (!explained) unexplained.push(word.word);
    }
    expect(unexplained).toEqual([]);
  });

  it("prevents answer length from revealing the correct option", () => {
    for (const pool of [gateWords, INFER_POOL, DRILL_POOL]) {
      const stats = optionStats(pool);
      expect(stats.longestPercent).toBeLessThanOrEqual(33);
      expect(stats.averageGap).toBeLessThanOrEqual(2);
    }
  });
});
