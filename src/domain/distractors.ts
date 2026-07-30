import type { RandomSource } from "../platform/contracts";
import type { DrillWord, StringListMap, Word } from "../types/content";
import { normalizeRoot } from "./roots";

export interface DistractorOptions {
  target: Word | DrillWord;
  candidates: readonly (Word | DrillWord)[];
  count: number;
  random: RandomSource;
  /** Words sharing a root with the target, by headword. Raises confusability most. */
  family?: ReadonlySet<string>;
  /** Authored near-twin root clusters, keyed by root form. */
  similars?: StringListMap;
  /** Gate index of the target, so foils from other gates can be preferred. */
  gate?: number;
  gateOf?: (word: Word | DrillWord) => number | undefined;
  predicate?: (candidate: Word | DrillWord) => boolean;
}

const SHARED_FAMILY = 3.2;
const SHARED_MORPHEME = 2.1;
const SIMILAR_ROOT = 1.6;
const CROSS_GATE = 0.8;
const DIFFICULTY_WEIGHT = 1.4;
const JITTER = 0.5;

function difficulty(word: Word | DrillWord): number {
  return "b" in word ? word.b : 0;
}

function morphemes(word: Word | DrillWord): Set<string> {
  const out = new Set<string>();
  for (const [surface] of word.parts) {
    const form = normalizeRoot(surface);
    if (form.length > 2) out.add(form);
  }
  return out;
}

/**
 * Wrong answers ranked by how confusable they are, not how unlike the target.
 *
 * The generators this replaces filtered foils *away* from the answer — same-gate random
 * picks, substring exclusion, and one that actively discarded candidates sharing a
 * morpheme. That makes a four-option question answerable by elimination: spot the three
 * that obviously do not belong. Scoring for nearness instead means the learner has to
 * know the word rather than recognise its silhouette.
 *
 * Part of speech is a hard filter rather than a score. A foil of the wrong class is not
 * merely a weak distractor, it is a free elimination — and it is what stops the prompt
 * showing its part-of-speech tag at all.
 */
export function scoreDistractors(options: DistractorOptions): (Word | DrillWord)[] {
  const { target, candidates, count, random } = options;
  const targetParts = morphemes(target);
  const targetDifficulty = difficulty(target);
  const similarForms = new Set<string>();
  if (options.similars) {
    for (const part of targetParts) {
      for (const near of options.similars[part] ?? []) similarForms.add(normalizeRoot(near));
    }
  }

  const eligible = candidates.filter((candidate) => {
    if (candidate.word === target.word) return false;
    if (candidate.def === target.def) return false;
    if (options.predicate && !options.predicate(candidate)) return false;
    // Same part of speech, or unknown on either side — never a class the learner can rule out.
    return !target.pos || !candidate.pos || candidate.pos === target.pos;
  });

  const scored = eligible.map((candidate) => {
    let score = random.next() * JITTER;
    if (options.family?.has(candidate.word)) score += SHARED_FAMILY;
    const parts = morphemes(candidate);
    for (const part of parts) {
      if (targetParts.has(part)) { score += SHARED_MORPHEME; break; }
    }
    for (const part of parts) {
      if (similarForms.has(part)) { score += SIMILAR_ROOT; break; }
    }
    if (options.gate !== undefined && options.gateOf) {
      const gate = options.gateOf(candidate);
      if (gate !== undefined && gate !== options.gate) score += CROSS_GATE;
    }
    score -= Math.abs(difficulty(candidate) - targetDifficulty) * DIFFICULTY_WEIGHT;
    return { candidate, score };
  });

  scored.sort((left, right) => right.score - left.score);
  const seen = new Set<string>();
  const out: (Word | DrillWord)[] = [];
  for (const { candidate } of scored) {
    if (seen.has(candidate.word)) continue;
    seen.add(candidate.word);
    out.push(candidate);
    if (out.length === count) break;
  }
  return out;
}
