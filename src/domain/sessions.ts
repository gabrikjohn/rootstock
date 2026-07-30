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

export const BAR_FORMS = 3;

export interface BarComposition {
  size: number;
  pairs: number;
  meaning: number;
  compose: number;
}

/** Derived from the total so the "N of SIZE" label and the pass mark can never disagree. */
export function barComposition(size: number): BarComposition {
  const pairs = Math.round(size * 0.1);
  const meaning = Math.round(size * 0.2);
  const compose = Math.round(size * 0.1);
  return { size, pairs, meaning, compose };
}

/**
 * One of BAR_FORMS fixed forms, not a fresh sample each sitting.
 *
 * Every attempt used to re-draw from the whole corpus, so "one attempt" was never true and
 * two sittings could repeat most of their items. Partitioning by form index means Form I,
 * II and III share no production words and no inference words at all: a retake is genuinely
 * a different exam, and it is stable enough to be worth preparing for.
 *
 * The never-taught share is 30% here rather than the old 20%. Those items are the only ones
 * that test the method instead of the memory, and they cost nothing extra — every inference
 * word already has a recording.
 */
export function buildBarItems(
  wordPool: readonly WordLocation[],
  pairs: readonly ConfusablePair[],
  inference: readonly InferenceWord[],
  random: RandomSource,
  size = 50,
  form = 0
): SessionItem[] {
  const plan = barComposition(size);
  const production = plan.size - plan.pairs - plan.meaning - plan.compose;
  const slice = <T,>(items: readonly T[], count: number): T[] => {
    if (!items.length) return [];
    const share = Math.floor(items.length / BAR_FORMS) || items.length;
    const start = (form % BAR_FORMS) * share;
    const block = items.slice(start, start + share);
    const pool = block.length >= count ? block : items;
    return shuffle(pool, random).slice(0, count);
  };

  const productionItems: SessionItem[] = slice(wordPool, production).map((location) => ({
    ...location,
    m: random.next() < 0.6 ? "PROD" : "VIGT"
  }));
  const meaningPool = slice(inference, plan.meaning + plan.compose);
  const pairItems: SessionItem[] = slice(pairs, plan.pairs).map((pair) => ({ m: "PAIR", pair }));
  const meaningItems: SessionItem[] = meaningPool.slice(0, plan.meaning)
    .map((inf) => ({ m: "INFER", inf }));
  const composeItems: SessionItem[] = meaningPool.slice(plan.meaning, plan.meaning + plan.compose)
    .map((inf) => ({ m: "COMPOSE", inf }));

  const built: SessionItem[] = [...productionItems, ...pairItems, ...meaningItems, ...composeItems];
  // A pool too small to fill its share must not shrink the exam: the size, the "N of SIZE"
  // label and the pass mark are one number, so a short draw would quietly move the goalposts.
  // Top up from production, which is the only pool guaranteed to be large enough.
  if (built.length < plan.size) {
    const used = new Set(productionItems.map((item) => `${item.gi}-${item.wi}`));
    const spare = wordPool.filter((location) => !used.has(`${location.gi}-${location.wi}`));
    for (const location of shuffle(spare, random).slice(0, plan.size - built.length)) {
      built.push({ ...location, m: random.next() < 0.6 ? "PROD" : "VIGT" });
    }
  }
  return shuffle(built, random);
}
