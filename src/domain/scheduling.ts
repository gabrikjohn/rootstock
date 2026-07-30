import type { RandomSource } from "../platform/contracts";
import type { ReviewProgress } from "../types/state";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const REVIEW_INTERVALS = [2, 5, 12, 30].map((days) => days * DAY_MS);
export const REVIEW_FUZZ_MIN = 0.85;
export const REVIEW_FUZZ_RANGE = 0.3;
export const DOCKET_SESSION_CAP = 20;
export const DOCKET_BACKLOG_MS = 7 * DAY_MS;

export function docketBlocks(
  dueCount: number,
  oldestDue: number | null,
  now: number
): boolean {
  if (dueCount > DOCKET_SESSION_CAP) return true;
  return oldestDue !== null && now - oldestDue >= DOCKET_BACKLOG_MS;
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
