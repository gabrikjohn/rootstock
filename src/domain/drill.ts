export function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

export function caliber(theta: number): number {
  return Math.round(100 * sigmoid(theta / 1.4));
}

export interface AbilityUpdate {
  theta: number;
  attempts: number;
  expected: number;
}

export function updateAbility(
  theta: number,
  attempts: number,
  difficulty: number,
  correct: boolean
): AbilityUpdate {
  const expected = sigmoid(theta - difficulty);
  const factor = Math.max(0.14, 0.5 / Math.sqrt(1 + attempts / 5));
  const nextTheta = Math.max(
    -3.5,
    Math.min(3.5, theta + factor * ((correct ? 1 : 0) - expected))
  );
  return { theta: nextTheta, attempts: attempts + 1, expected };
}

export function literalReading(word: Word | DrillWord): string {
  return word.parts.filter((part) => part[1])
    .map((part) => `“${part[1]}”`)
    .join(" + ");
}

export function sharedPrefixLength(first: string, second: string): number {
  const left = first.toLowerCase();
  const right = second.toLowerCase();
  let index = 0;
  while (index < left.length && index < right.length && left[index] === right[index]) {
    index += 1;
  }
  return index;
}

export function pickKin(word: Word | DrillWord, random: RandomSource): string | null {
  const candidates = (word.kin ?? []).filter((kin) =>
    sharedPrefixLength(kin, word.word) < 4
  );
  return candidates[Math.floor(random.next() * candidates.length)] ?? null;
}

export function sharesMeaningfulPart(first: Word | DrillWord, second: Word | DrillWord): boolean {
  const parts = (word: Word | DrillWord): WordPart[] =>
    word.parts.filter((part) => Boolean(part[1]) && part[0].length > 1);
  return parts(first).some((left) => parts(second).some((right) => {
    const firstSurface = left[0].toLowerCase();
    const secondSurface = right[0].toLowerCase();
    return firstSurface.startsWith(secondSurface.slice(0, 4))
      || secondSurface.startsWith(firstSurface.slice(0, 4))
      || left[1] === right[1];
  }));
}

export function maskEtymology(text: string, word: string): string {
  let output = escapeHtml(text);
  word.split(/\s+/).forEach((token) => {
    if (token.length < 4) return;
    const stem = token.slice(0, Math.max(4, token.length - 3)).replace(/[^A-Za-z]/g, "");
    if (stem.length < 3) return;
    output = output.replace(new RegExp(`[A-Za-z]*${stem}[A-Za-z]*`, "gi"), "＿＿＿");
  });
  return output;
}

export function supportsDrillMode(
  mode: QuizMode,
  word: Word | DrillWord,
  hasEtymology: boolean,
  hasKin: boolean
): boolean {
  if (mode === "LIT" || mode === "LITT") {
    return word.parts.filter((part) => part[1]).length >= 2;
  }
  if (mode === "ROOTQ") {
    return word.parts.some((part) => Boolean(part[1]) && part[0].length > 1);
  }
  if (mode === "ETY") return hasEtymology;
  if (mode === "KIN") return hasKin;
  if (mode === "COMPOSE") return word.parts.length >= 2;
  return true;
}

export function chooseDrillMode(
  word: DrillWord,
  history: DrillHistory | undefined,
  random: RandomSource
): QuizMode {
  if (!history || !(history.r + history.w)) return "REC";
  const priorModes = history.m ?? [];
  const supported = (mode: QuizMode): boolean =>
    supportsDrillMode(mode, word, Boolean(word.ety), Boolean(pickKin(word, random)));
  const fresh = DRILL_LADDER.filter((mode) =>
    supported(mode) && !priorModes.includes(mode)
  );
  if (fresh.length) {
    return fresh[Math.floor(random.next() * Math.min(3, fresh.length))] ?? "PROD";
  }
  const pool = DRILL_LADDER.filter((mode) =>
    supported(mode) && mode !== priorModes[priorModes.length - 1]
  );
  return pool[Math.floor(random.next() * pool.length)] ?? "PROD";
}

export function drillFoils(
  word: Word | DrillWord,
  count: number,
  candidates: readonly (Word | DrillWord)[],
  random: RandomSource,
  predicate?: (candidate: Word | DrillWord) => boolean,
  avoidShared = false
): string[] {
  let pool = candidates.filter((candidate) =>
    candidate.word !== word.word && (!predicate || predicate(candidate))
  );
  if (avoidShared) {
    const distinct = pool.filter((candidate) => !sharesMeaningfulPart(candidate, word));
    if (distinct.length >= count) pool = distinct;
  }
  const seen = new Set([word.word]);
  return shuffle(pool, random)
    .filter((candidate) => !seen.has(candidate.word) && Boolean(seen.add(candidate.word)))
    .slice(0, count)
    .map((candidate) => candidate.word);
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
import type { RandomSource } from "../platform/contracts";
import type { DrillWord, Word, WordPart } from "../types/content";
import type { DrillHistory, QuizMode } from "../types/state";
import { shuffle } from "./collections";

export const DRILL_LADDER: readonly QuizMode[] = [
  "DSENT", "LIT", "ROOTQ", "ETY", "KIN", "COMPOSE", "CLOZE", "LITT", "PROD"
];

export const MODE_SHIFT: Readonly<Partial<Record<QuizMode, number>>> = {
  ROOTS: -0.5,
  ROOTT: 0.3,
  REC: -0.35,
  ROOTQ: -0.2,
  DSENT: 0,
  LIT: 0,
  VIG: 0,
  KIN: 0.15,
  ETY: 0.25,
  COMPOSE: 0.35,
  CLOZE: 0.45,
  LITT: 0.55,
  PROD: 0.7,
  VIGT: 0.7
};
