import type { ReviewProgress } from "../types/state";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const REVIEW_INTERVALS = [2, 5, 12, 30].map((days) => days * DAY_MS);

export function initialReview(now: number): ReviewProgress {
  return { box: 0, due: now + REVIEW_INTERVALS[0]! };
}

export function scheduleReview(
  current: ReviewProgress,
  correct: boolean,
  now: number
): ReviewProgress {
  const box = correct
    ? Math.min(current.box + 1, REVIEW_INTERVALS.length - 1)
    : 0;
  return { box, due: now + REVIEW_INTERVALS[box]! };
}
