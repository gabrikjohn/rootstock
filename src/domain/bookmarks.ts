import type { ConfusablePair, InferenceWord, Root, RuntimeGate } from "../types/content";
import type { QuizItem, SerializedQuizItem } from "../types/state";

export function serializeQuizItem(
  item: QuizItem,
  confusables: readonly ConfusablePair[]
): SerializedQuizItem {
  const output: SerializedQuizItem = { m: item.m };
  if (item.gi !== undefined) {
    output.gi = item.gi;
    if (item.wi !== undefined) output.wi = item.wi;
  }
  if (item.pair) output.pi = confusables.indexOf(item.pair);
  if (item.inf) output.fw = item.inf.word;
  if (item.root) output.rr = item.root.root;
  return output;
}

interface DeserializeQuizItemOptions {
  value: SerializedQuizItem;
  gateIndex: number;
  gates: readonly RuntimeGate[];
  confusables: readonly ConfusablePair[];
  inference: readonly InferenceWord[];
  rootOptions(gateIndex: number, root: Root): string[];
}

export function deserializeQuizItem(options: DeserializeQuizItemOptions): QuizItem | null {
  const mode = options.value.m === "BLANK" ? "VIG" : options.value.m;
  const item: QuizItem = { m: mode };
  if (options.value.gi !== undefined) {
    if (options.value.wi === undefined) return null;
    item.gi = options.value.gi;
    item.wi = options.value.wi;
  }
  if (options.value.pi !== undefined) {
    const pair = options.confusables[options.value.pi];
    if (!pair) return null;
    item.pair = pair;
  }
  if (options.value.fw) {
    const inference = options.inference.find((word) => word.word === options.value.fw);
    if (!inference) return null;
    item.inf = inference;
  }
  if (options.value.rr !== undefined) {
    const gate = options.gates[options.gateIndex];
    const root = gate?.quizRoots.find((candidate) => candidate.root === options.value.rr);
    if (!root) return null;
    item.root = root;
    if (mode === "ROOTS") {
      item.opts = options.rootOptions(options.gateIndex, root);
    }
  }
  if (mode === "PAIR" && !item.pair) return null;
  if (mode === "INFER" && !item.inf) return null;
  if ((mode === "ROOTS" || mode === "ROOTT") && !item.root) return null;
  return item;
}
