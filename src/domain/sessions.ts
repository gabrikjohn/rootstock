import type { ConfusablePair, Gate, InferenceWord, Root } from "../types/content";
import type { GateProgress, QuizItem } from "../types/state";
import type { RandomSource } from "../platform/contracts";
import { shuffle } from "./collections";

export interface WordLocation {
  gi: number;
  wi: number;
}

export type SessionItem = QuizItem;

export function selectInference(
  pool: readonly InferenceWord[],
  gates: readonly Gate[],
  progress: Readonly<Record<string, GateProgress>>,
  seen: Readonly<Record<string, boolean>>,
  maxGateIndex: number,
  count: number,
  random: RandomSource
): InferenceWord[] {
  const eligible = pool.filter((word) =>
    word.req <= maxGateIndex
    && gates[word.req] !== undefined
    && progress[String(gates[word.req]!.id)]?.sealed === true
  );
  const fresh = shuffle(eligible.filter((word) => !seen[word.word]), random);
  const selected = fresh.slice(0, count);
  if (selected.length < count) {
    selected.push(...shuffle(
      eligible.filter((word) => !selected.includes(word)),
      random
    ).slice(0, count - selected.length));
  }
  return selected;
}

export function buildTrialOneItems(
  gate: Gate,
  gateIndex: number,
  rootOptions: (root: Root) => string[],
  inference: readonly InferenceWord[] = []
): SessionItem[] {
  const items: SessionItem[] = [];
  gate.words.forEach((_, wi) => {
    items.push(
      { gi: gateIndex, wi, m: "REC" },
      { gi: gateIndex, wi, m: "REV" },
      { gi: gateIndex, wi, m: "VIG" }
    );
  });
  gate.quizRoots?.forEach((root) => {
    items.push({ m: "ROOTS", root, opts: rootOptions(root) });
  });
  inference.forEach((inf) => items.push({ m: "INFER", inf }));
  return items;
}

export function buildBarItems(
  wordPool: readonly WordLocation[],
  pairs: readonly ConfusablePair[],
  inference: readonly InferenceWord[],
  random: RandomSource
): SessionItem[] {
  const production: SessionItem[] = shuffle(wordPool, random).slice(0, 35).map((location) => ({
    ...location,
    m: random.next() < 0.6 ? "PROD" : "VIGT"
  }));
  const pairItems: SessionItem[] = pairs.slice(0, 5).map((pair) => ({ m: "PAIR", pair }));
  const meaningItems: SessionItem[] = inference.slice(0, 5).map((inf) => ({ m: "INFER", inf }));
  const composeItems: SessionItem[] = inference.slice(5, 10).map((inf) => ({ m: "COMPOSE", inf }));
  return shuffle([...production, ...pairItems, ...meaningItems, ...composeItems], random);
}
