import type { RandomSource } from "../platform/contracts";
import type { ReviewProgress } from "../types/state";
import { shuffle } from "./collections";

export interface DocketSummary {
  due: number;
  oldestDue: number | null;
}

export const DAY_MS = 24 * 60 * 60 * 1000;
export const REVIEW_INTERVALS = [1, 3, 7, 16, 35, 75].map((days) => days * DAY_MS);
export const REVIEW_FUZZ_MIN = 0.85;
export const REVIEW_FUZZ_RANGE = 0.3;
export const REVIEW_RETIRE_NET = 4;
export const DOCKET_SESSION_CAP = 20;
export const DOCKET_BACKLOG_MS = 7 * DAY_MS;

export function docketSummary(
  review: Readonly<Record<string, ReviewProgress>>,
  now: number
): DocketSummary {
  let due = 0;
  let oldestDue: number | null = null;
  for (const entry of Object.values(review)) {
    if (entry.due > now) continue;
    due += 1;
    if (oldestDue === null || entry.due < oldestDue) oldestDue = entry.due;
  }
  return { due, oldestDue };
}

export function docketBlocks(
  dueCount: number,
  oldestDue: number | null,
  now: number
): boolean {
  if (dueCount > DOCKET_SESSION_CAP) return true;
  return oldestDue !== null && now - oldestDue >= DOCKET_BACKLOG_MS;
}

// One sitting's worth of due words: the most overdue first so nothing rots,
// capped so a returning learner never faces the whole backlog, then shuffled
// within the selection so the sitting itself stays varied.
export function selectDocketSitting(
  review: Readonly<Record<string, ReviewProgress>>,
  now: number,
  random: RandomSource,
  cap: number = DOCKET_SESSION_CAP
): string[] {
  const due = Object.keys(review).filter((key) => review[key]!.due <= now);
  due.sort((left, right) => review[left]!.due - review[right]!.due);
  return shuffle(due.slice(0, Math.max(0, cap)), random);
}

export function fuzzInterval(interval: number, random: RandomSource): number {
  return Math.round(interval * (REVIEW_FUZZ_MIN + random.next() * REVIEW_FUZZ_RANGE));
}

export function initialReview(now: number, random: RandomSource): ReviewProgress {
  return { box: 0, due: now + fuzzInterval(REVIEW_INTERVALS[0]!, random) };
}

export function scheduleReview(
  current: ReviewProgress,
  correct: boolean,
  now: number,
  random: RandomSource
): ReviewProgress {
  const box = correct
    ? Math.min(current.box + 1, REVIEW_INTERVALS.length - 1)
    : 0;
  return { box, due: now + fuzzInterval(REVIEW_INTERVALS[box]!, random) };
}

// A word that has climbed the whole ladder and is well ahead on the tally has
// nothing left to prove in the Docket. It leaves for good — the Drill Hall and
// the Forge still reach it, so retiring costs no coverage, only repetitions.
export function retiresFromDocket(box: number, net: number): boolean {
  return box >= REVIEW_INTERVALS.length - 1 && net >= REVIEW_RETIRE_NET;
}
