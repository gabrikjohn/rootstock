import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  COGNATES,
  CONFUSABLES,
  DEPTH,
  DRILL_POOL,
  ETYM,
  INFER_POOL,
  LEVELS,
  ROOT_DEEP,
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

  it("prevents answer length from revealing the correct option", () => {
    for (const pool of [gateWords, INFER_POOL, DRILL_POOL]) {
      const stats = optionStats(pool);
      expect(stats.longestPercent).toBeLessThanOrEqual(33);
      expect(stats.averageGap).toBeLessThanOrEqual(2);
    }
  });
});
