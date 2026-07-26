import type {
  DepthEntry,
  DrillWord,
  RuntimeGate,
  Root,
  StringListMap,
  StringMap,
  Word
} from "../types/content";
import { normalizeRoot, rootForms } from "./roots";

export interface WordLocation {
  gi: number;
  wi: number;
}

export interface RootFamilyEntry {
  word: string;
  def: string;
}

export class ContentCatalog {
  constructor(
    private readonly gates: readonly RuntimeGate[],
    private readonly drillWords: readonly DrillWord[],
    private readonly depth: Readonly<Record<string, DepthEntry>>,
    private readonly deepRoots: StringMap,
    private readonly etymology: StringMap,
    private readonly cognates: StringListMap
  ) {}

  rootEtymology(root: Root): string {
    return this.deepRoots[root.root] ?? this.etymology[root.root] ?? "";
  }

  wordDepth(word: Word | DrillWord): Partial<DepthEntry> {
    return this.depth[word.word] ?? {};
  }

  vignette(word: Word | DrillWord): string {
    return this.wordDepth(word).v ?? "";
  }

  wordEtymology(word: Word | DrillWord): string {
    return this.wordDepth(word).e ?? word.ety ?? "";
  }

  definition(headword: string): string {
    for (const gate of this.gates) {
      const word = gate.words.find((candidate) => candidate.word === headword);
      if (word) return word.def;
    }
    return this.drillWords.find((candidate) => candidate.word === headword)?.def ?? "";
  }

  rootFamily(root: Root, limit = 4): RootFamilyEntry[] {
    const forms = rootForms(root).map(normalizeRoot).filter((form) => form.length > 1);
    const authored = this.cognates[root.root]
      ?? rootForms(root).flatMap((form) => this.cognates[form] ?? []);
    if (authored.length) {
      return [...new Set(authored)]
        .map((word) => ({ word, def: this.definition(word) }))
        .slice(0, limit);
    }

    const output: RootFamilyEntry[] = [];
    const seen = new Set<string>();
    const partMatches = (part: readonly [string, string]): boolean => {
      const normalizedPart = normalizeRoot(part[0]);
      return normalizedPart.length > 1 && forms.some((form) =>
        normalizedPart === form
        || (form.length >= 3 && normalizedPart.startsWith(form))
        || (normalizedPart.length >= 3 && form.startsWith(normalizedPart))
      );
    };
    const scan = (word: Word | DrillWord): void => {
      if (seen.has(word.word) || !word.parts.some(partMatches)) return;
      seen.add(word.word);
      output.push({ word: word.word, def: word.def });
    };
    this.gates.forEach((gate) => gate.words.forEach(scan));
    this.drillWords.forEach(scan);
    return output.slice(0, limit);
  }

  locateWord(headword: string): WordLocation | null {
    for (let gateIndex = 0; gateIndex < this.gates.length; gateIndex += 1) {
      const gate = this.gates[gateIndex];
      if (!gate) continue;
      const wordIndex = gate.words.findIndex((word) => word.word === headword);
      if (wordIndex >= 0) return { gi: gateIndex, wi: wordIndex };
    }
    return null;
  }
}
