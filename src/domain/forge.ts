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

/**
 * The angles for the on-the-spot rework that fires when a word is missed inside a gate
 * trial. It is the Forge's mode list with the sense-shift axis withheld: that rework
 * happens mid-trial, and a trial never asks what a word used to mean. The Forge opened
 * from home is a place the learner chose to be, so it keeps the full list.
 */
export function trialReworkModes(word: Word, hasVignette: boolean): QuizMode[] {
  return forgeModes(word, hasVignette, false);
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
