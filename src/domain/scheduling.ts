import type { RandomSource } from "../platform/contracts";
import type { ReviewProgress } from "../types/state";
import { shuffle } from "./collections";

export interface DocketSummary {
  due: number;
  ahead: number;
  oldestDue: number | null;
}

export const DAY_MS = 24 * 60 * 60 * 1000;
export const REVIEW_INTERVALS = [1, 3, 7, 16, 35, 75].map((days) => days * DAY_MS);
export const REVIEW_FUZZ_MIN = 0.85;
export const REVIEW_FUZZ_RANGE = 0.3;
export const REVIEW_RETIRE_NET = 4;
export const DOCKET_TIERS = 4;

// Retrieval difficulty, tracked apart from the timing box. A lapse resets when a word
// comes back but only steps its difficulty down one rung, so one slip on a word you
// nearly know no longer drops you from assembly all the way to recognition.
// Saves written before tiers existed fall back to the old box-indexed behaviour, so
// nobody's difficulty moves on upgrade.
export function tierOf(review: ReviewProgress): number {
  return review.tier ?? Math.min(review.box, DOCKET_TIERS - 1);
}

/* ---- One release a day ----
   The Docket used to open whenever a word's fuzzed timer happened to elapse, so it
   could interrupt three times in an afternoon and hand over a different number of
   words each time. It now has a single release moment per day, on the device's own
   clock: every due date is rounded to a release, so nothing new appears between them
   and the day's sitting is the same set of words from the moment it opens. Change the
   hour here and the whole schedule moves with it. */
export const DOCKET_RELEASE_HOUR = 6;
// One sitting's worth, and the same number every day. Whatever the schedule sends
// past this waits for tomorrow's release rather than swelling the sitting.
export const DOCKET_DAILY_SIZE = 20;
// A thin day borrows its shortfall from the words due in the next couple of releases,
// so the count holds steady instead of swinging between three words and forty. The
// borrowed words are the soonest due — never anything the calendar has parked months out.
export const DOCKET_LOOKAHEAD_MS = 2 * DAY_MS;
export const DOCKET_BACKLOG_MS = 7 * DAY_MS;

// setDate/setHours rather than arithmetic on the epoch: a day either side of a
// daylight-saving change is 23 or 25 hours long, and the release must stay at the
// same wall-clock hour through it.
function atReleaseHour(value: number, dayOffset = 0): number {
  const day = new Date(value);
  day.setDate(day.getDate() + dayOffset);
  day.setHours(DOCKET_RELEASE_HOUR, 0, 0, 0);
  return day.getTime();
}

// The moment the current docket opened: today's release if it has passed, else yesterday's.
export function docketRelease(now: number): number {
  const today = atReleaseHour(now);
  return today <= now ? today : atReleaseHour(now, -1);
}

// The next release strictly after `now` — when the following docket opens.
export function nextDocketRelease(now: number): number {
  const today = atReleaseHour(now);
  return today > now ? today : atReleaseHour(now, 1);
}

// Round a raw timer to the release it belongs to. A word whose interval lands at
// 4pm tomorrow comes back with tomorrow's docket, not at 4pm; one whose interval
// lands just short of a release still waits for the next one, so no word answered
// today can return to today's sitting.
export function docketDue(rawDue: number, answeredAt: number): number {
  return Math.max(docketRelease(rawDue), nextDocketRelease(answeredAt));
}

// Has the day's sitting already been worked? `clearedDay` is the release stamped when
// a sitting was finished; anything at or past the current release means today is done.
export function docketCleared(clearedDay: number | undefined, now: number): boolean {
  return clearedDay !== undefined && clearedDay >= docketRelease(now);
}

// Released count, borrowable count, and longest-waiting due date in one pass. home()
// re-renders every second while a gate tempers, so the docket is counted once per
// render, not once per question it might ask.
export function docketSummary(
  review: Readonly<Record<string, ReviewProgress>>,
  now: number
): DocketSummary {
  const release = docketRelease(now);
  const horizon = release + DOCKET_LOOKAHEAD_MS;
  let due = 0;
  let ahead = 0;
  let oldestDue: number | null = null;
  for (const entry of Object.values(review)) {
    if (entry.due > release) {
      if (entry.due <= horizon) ahead += 1;
      continue;
    }
    due += 1;
    if (oldestDue === null || entry.due < oldestDue) oldestDue = entry.due;
  }
  return { due, ahead, oldestDue };
}

// How many words today's sitting will actually ask for. Nothing due means no docket at
// all — the borrowed words top a sitting up, they never conjure one out of nothing.
export function docketSittingSize(
  summary: DocketSummary,
  size: number = DOCKET_DAILY_SIZE
): number {
  if (summary.due === 0) return 0;
  return Math.min(Math.max(0, size), summary.due + summary.ahead);
}

export function docketBlocks(
  dueCount: number,
  oldestDue: number | null,
  now: number
): boolean {
  if (dueCount > DOCKET_DAILY_SIZE) return true;
  return oldestDue !== null && now - oldestDue >= DOCKET_BACKLOG_MS;
}

// The day's sitting: everything released, most overdue first so nothing rots, cut to
// the daily size, topped up from the next releases when the day comes up short, then
// shuffled within the selection so the sitting itself stays varied.
export function selectDocketSitting(
  review: Readonly<Record<string, ReviewProgress>>,
  now: number,
  random: RandomSource,
  size: number = DOCKET_DAILY_SIZE
): string[] {
  const release = docketRelease(now);
  const limit = Math.max(0, size);
  const keys = Object.keys(review).sort((left, right) => review[left]!.due - review[right]!.due);
  const due = keys.filter((key) => review[key]!.due <= release);
  if (!due.length || !limit) return [];
  if (due.length >= limit) return shuffle(due.slice(0, limit), random);
  const horizon = release + DOCKET_LOOKAHEAD_MS;
  const ahead = keys
    .filter((key) => review[key]!.due > release && review[key]!.due <= horizon)
    .slice(0, limit - due.length);
  return shuffle(due.concat(ahead), random);
}

export function fuzzInterval(interval: number, random: RandomSource): number {
  return Math.round(interval * (REVIEW_FUZZ_MIN + random.next() * REVIEW_FUZZ_RANGE));
}

export function initialReview(now: number, random: RandomSource): ReviewProgress {
  return { box: 0, tier: 0, due: docketDue(now + fuzzInterval(REVIEW_INTERVALS[0]!, random), now) };
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
  const tier = correct
    ? Math.min(tierOf(current) + 1, DOCKET_TIERS - 1)
    : Math.max(tierOf(current) - 1, 0);
  return { box, tier, due: docketDue(now + fuzzInterval(REVIEW_INTERVALS[box]!, random), now) };
}

// A word that has climbed the whole ladder and is well ahead on the tally has
// nothing left to prove in the Docket. It leaves for good — the Drill Hall and
// the Forge still reach it, so retiring costs no coverage, only repetitions.
export function retiresFromDocket(box: number, net: number): boolean {
  return box >= REVIEW_INTERVALS.length - 1 && net >= REVIEW_RETIRE_NET;
}
