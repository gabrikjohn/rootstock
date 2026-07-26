import type { DrillWord, Gate, InferenceWord } from "../types/content";
import type { ProgressV2 } from "../types/state";

export type LexiconEntry =
  | { key: string; kind: "gate"; gateIndex: number; wordIndex: number }
  | { key: string; kind: "inference"; inferenceIndex: number }
  | { key: string; kind: "drill"; drillIndex: number };

export function selectLexiconEntries(
  gates: readonly Gate[],
  inference: readonly InferenceWord[],
  drill: readonly DrillWord[],
  progress: ProgressV2
): LexiconEntry[] {
  const entries: LexiconEntry[] = [];
  gates.forEach((gate, gateIndex) => {
    if (!progress.gates[String(gate.id)]?.sealed) return;
    gate.words.forEach((word, wordIndex) => {
      entries.push({ key: word.word, kind: "gate", gateIndex, wordIndex });
    });
  });
  inference.forEach((word, inferenceIndex) => {
    if (progress.seenInfer[word.word]) {
      entries.push({ key: word.word, kind: "inference", inferenceIndex });
    }
  });
  drill.forEach((word, drillIndex) => {
    if (progress.drill.seen[word.word]) {
      entries.push({ key: word.word, kind: "drill", drillIndex });
    }
  });
  return entries.sort((left, right) => left.key.localeCompare(right.key));
}
