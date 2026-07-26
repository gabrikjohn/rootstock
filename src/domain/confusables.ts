import type { RandomSource } from "../platform/contracts";
import type { ConfusablePair, RuntimeGate } from "../types/content";
import { shuffle } from "./collections";

type Ledger = Readonly<Record<string, { r: number; w: number }>>;

export function gateIndexForForm(gates: readonly RuntimeGate[], form: string): number {
  const target = form.toLowerCase();
  let bestGate = -1;
  let bestLength = 0;
  gates.forEach((gate, gateIndex) => {
    gate.words.forEach((word) => {
      const headword = word.word.toLowerCase();
      const stem = headword.endsWith("e") ? headword.slice(0, -1) : headword;
      if (
        (target === headword || target.startsWith(headword) || target.startsWith(stem))
        && headword.length > bestLength
      ) {
        bestGate = gateIndex;
        bestLength = headword.length;
      }
    });
  });
  return bestGate;
}

export function confusableMissWeight(
  pair: ConfusablePair,
  gates: readonly RuntimeGate[],
  ledger: Ledger
): number {
  let misses = 0;
  [pair.a, pair.b].forEach((form) => {
    const target = form.toLowerCase();
    gates.forEach((gate, gateIndex) => {
      gate.words.forEach((word, wordIndex) => {
        const headword = word.word.toLowerCase();
        const stem = headword.endsWith("e") ? headword.slice(0, -1) : headword;
        if (
          target === headword
          || target.startsWith(headword)
          || target.startsWith(stem)
        ) {
          misses += ledger[`${gateIndex}-${wordIndex}`]?.w ?? 0;
        }
      });
    });
  });
  return misses;
}

interface PickConfusablesOptions {
  pairs: readonly ConfusablePair[];
  gates: readonly RuntimeGate[];
  ledger: Ledger;
  seen: Record<string, boolean>;
  maxGateIndex: number;
  count: number;
  random: RandomSource;
  onCycleReset(): void;
}

export function pickConfusables(options: PickConfusablesOptions): ConfusablePair[] {
  const eligible = options.pairs.filter((pair) => {
    const first = gateIndexForForm(options.gates, pair.a);
    const second = gateIndexForForm(options.gates, pair.b);
    return first >= 0
      && second >= 0
      && first <= options.maxGateIndex
      && second <= options.maxGateIndex;
  });
  if (!eligible.length) return [];

  const idOf = (pair: ConfusablePair): number => options.pairs.indexOf(pair);
  let fresh = eligible.filter((pair) => !options.seen[idOf(pair)]);
  if (!fresh.length) {
    eligible.forEach((pair) => {
      delete options.seen[idOf(pair)];
    });
    options.onCycleReset();
    fresh = eligible.slice();
  }
  const selected = fresh
    .map((pair) => ({
      pair,
      score: confusableMissWeight(pair, options.gates, options.ledger) + options.random.next()
    }))
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.pair)
    .slice(0, options.count);
  if (selected.length < options.count) {
    shuffle(
      eligible.filter((pair) => !selected.includes(pair)),
      options.random
    ).slice(0, options.count - selected.length).forEach((pair) => selected.push(pair));
  }
  return selected;
}
