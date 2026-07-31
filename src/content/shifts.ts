import type { ShiftKind } from "../types/content";

/**
 * The five ways a meaning moves, as the learner meets them in the SHIFT prompt.
 *
 * The labels are written to be told apart at a glance in a four-option list, so each names
 * the motion rather than the technical term: a philologist's pejoration and amelioration are
 * here simply souring and improving. `figure` covers both metaphor and metonymy, which are
 * worth distinguishing in a seminar and not in a drill.
 */
export const SHIFT_KINDS: readonly ShiftKind[] = [
  "narrow", "widen", "worse", "better", "figure"
];

export const SHIFT_LABELS: Readonly<Record<ShiftKind, string>> = {
  narrow: "It narrowed — the sense contracted to part of what it once covered",
  widen: "It widened — the sense spread beyond what it once covered",
  worse: "It soured — the sense picked up a disapproval it did not have",
  better: "It improved — the sense shed a disapproval it used to carry",
  figure: "It was carried across — a literal sense became a figurative one"
};
