import type { RandomSource } from "../platform/contracts";
import type { Word } from "../types/content";
import type { QuizItem, QuizMode } from "../types/state";
import { shuffle } from "./collections";

export interface LocatedWord {
  w: Word;
  gi: number;
  wi: number;
}

export function forgeModes(
  word: Word,
  hasVignette: boolean,
  hasFormerSense = false
): QuizMode[] {
  const modes: QuizMode[] = ["REV", "PROD"];
  if (word.distractors.length) modes.unshift("REC");
  if (hasVignette) modes.push("VIG", "VIGT");
  // Gate words keep their former sense in DEPTH, as they keep the vignette, so the Forge is
  // told what the word supports rather than reading it off the word.
  if (hasFormerSense) modes.push("SENSE", "SENSET", "SHIFT");
  if (word.sentence) modes.push("CLOZE");
  if (word.parts.length >= 2) {
    modes.push("COMPOSE");
    if (word.parts.some((part) => part[1])) modes.push("LITT");
  }
  return modes;
}

export function pickForgeModes(
  word: Word,
  hasVignette: boolean,
  count: number,
  random: RandomSource,
  hasFormerSense = false
): QuizMode[] {
  const modes = forgeModes(word, hasVignette, hasFormerSense);
  return shuffle(modes, random).slice(0, Math.max(1, Math.min(count, modes.length)));
}

export function reangleForgeItem(
  item: QuizItem,
  word: Word,
  hasVignette: boolean,
  random: RandomSource,
  hasFormerSense = false
): QuizItem {
  const modes = forgeModes(word, hasVignette, hasFormerSense);
  const alternatives = modes.filter((mode) => mode !== item.m);
  const pool = alternatives.length ? alternatives : modes;
  const mode = pool[Math.floor(random.next() * pool.length)] ?? item.m;
  return { ...item, m: mode };
}

export function weakWords(
  words: readonly LocatedWord[],
  ledger: Readonly<Record<string, { r: number; w: number }>>
): LocatedWord[] {
  return words.filter((entry) => {
    const tally = ledger[`${entry.gi}-${entry.wi}`];
    return tally !== undefined && tally.w >= 1 && tally.w * 3 >= tally.r;
  });
}
