import type {
  DepthEntry,
  DrillWord,
  InferenceWord,
  RuntimeGate,
  Root,
  ShiftKind,
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

function sharedPrefix(left: string, right: string): number {
  let index = 0;
  while (index < left.length && index < right.length && left[index] === right[index]) index += 1;
  return index;
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

  /**
   * The deep note for a single piece of a word. Tries the authored affix list first, then
   * the root paragraphs — including their combining forms, since a word spells a root as
   * `psycho-` where ROOT_DEEP files it under `psyche`. Returns "" when nothing matches, so
   * the panel simply omits a piece rather than inventing one.
   */
  partDepth(surface: string, affixes: StringMap): string {
    const form = normalizeRoot(surface);
    if (!form) return "";
    const affix = affixes[form] ?? affixes[surface.toLowerCase()];
    if (affix) return affix;
    for (const [key, note] of Object.entries(this.deepRoots)) {
      for (const variant of key.split(/[/,]/)) {
        const candidate = normalizeRoot(variant.trim());
        if (!candidate) continue;
        if (candidate === form) return note;
        // Combining forms: psycho / psyche, grapho / graphein. Require a real stem in
        // common so that short endings cannot collide with unrelated roots.
        const shared = sharedPrefix(candidate, form);
        if (shared >= 4 && shared >= Math.min(candidate.length, form.length) - 2) return note;
      }
    }
    return "";
  }

  wordDepth(word: Word | DrillWord | InferenceWord): Partial<DepthEntry> {
    return this.depth[word.word] ?? {};
  }

  vignette(word: Word | DrillWord): string {
    return this.wordDepth(word).v ?? "";
  }

  wordEtymology(word: Word | DrillWord): string {
    return this.wordDepth(word).e ?? word.ety ?? "";
  }

  // The paragraph-length sense-history, where one has been authored. Gate words file theirs
  // in DEPTH; Drill Hall and inference words carry their own, the same split `wordEtymology`
  // already makes for `ety`. Never falls back to the epigram — a missing story yields "" so
  // the disclosure simply omits the block.
  wordStory(word: Word | DrillWord | InferenceWord): string {
    return this.wordDepth(word).s ?? word.story ?? "";
  }

  // The earlier English sense, where the word had one worth teaching. Same three-pool split
  // as the story: DEPTH for gate words, inline for Drill Hall and inference words. "" means
  // this word never shifted — the SENSE modes are simply not offered for it.
  wordFormerSense(word: Word | DrillWord | InferenceWord): string {
    return this.wordDepth(word).w ?? word.was ?? "";
  }

  // The kind of shift that carried the former sense to the current one. Authored with the
  // former sense or not at all, so a null here and a "" above always travel together.
  wordShiftKind(word: Word | DrillWord | InferenceWord): ShiftKind | null {
    return this.wordDepth(word).k ?? word.shift ?? null;
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
