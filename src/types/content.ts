export type WordPart = readonly [surface: string, gloss: string];

// The part of speech the word's own definition uses, not the word's full range in English.
// Several headwords are legitimately multi-POS (aggregate, consummate, cosmopolitan); tagging
// them with every valid sense would make the option-set homogeneity rule meaningless.
export type PartOfSpeech = "n." | "v." | "adj." | "adv.";

/**
 * How a word's meaning moved between its earlier English sense and its current one.
 * Five kinds, chosen to be distinguishable by a learner rather than exhaustive: a sense
 * contracts, expands, sours, improves, or is carried across from a literal domain into a
 * figurative one. A word is tagged only where one kind is clearly dominant — where two
 * compete, the word carries no former sense at all rather than an arguable label.
 */
export type ShiftKind = "narrow" | "widen" | "worse" | "better" | "figure";

export interface Root {
  root: string;
  lang: string;
  gloss: string;
  compoundOf?: string;
  key?: string;
}

export interface Word {
  word: string;
  parts: WordPart[];
  pron: string;
  def: string;
  sentence: string;
  distractors: string[];
  kin?: string[];
  ety?: string;
  // The sense-history paragraph, for words that carry their own rather than one filed in
  // DEPTH. Gate words use DEPTH.s; Drill Hall words keep theirs here beside `ety`.
  story?: string;
  // The word's earlier English sense, written as a quiz stimulus for the SENSE modes, and
  // the kind of shift that carried it to the current one. Authored as a pair, and only
  // where a documented shift exists — most words never had one. Must not name the word.
  was?: string;
  shift?: ShiftKind;
  pos?: PartOfSpeech;
}

export interface Gate {
  id: number;
  title: string;
  theme: string;
  roots: Root[];
  words: Word[];
  quizRoots?: Root[];
}

export interface RuntimeGate extends Omit<Gate, "quizRoots"> {
  quizRoots: Root[];
}

export interface InferenceWord {
  word: string;
  parts: WordPart[];
  req: number;
  def: string;
  distractors: string[];
  roots: string;
  pron?: string;
  // Inference words entered the corpus without an example sentence or a history; both are
  // being authored, so both stay optional until every entry carries them.
  sentence?: string;
  story?: string;
  was?: string;
  shift?: ShiftKind;
  pos?: PartOfSpeech;
}

export interface DrillWord extends Word {
  req: number;
  b: number;
  ety: string;
}

export interface DepthEntry {
  v: string;
  e: string;
  // A paragraph on how the word came to mean what it means today — a sense-history, not a
  // gloss. Distinct from `e` (the one-line epigram, which also serves as the ETY drill prompt)
  // and shown only in the study card's disclosure. Optional so the corpus can fill in by gate.
  s?: string;
  // The earlier English sense (`w`) and the kind of shift that left it (`k`) — the gate-word
  // half of the pair `Word.was`/`Word.shift` carries for the other pools. Sparse by design.
  w?: string;
  k?: ShiftKind;
}

export interface ConfusablePair {
  s: string;
  a: string;
  b: string;
  ans: string;
  why: string;
}

export type StringMap = Readonly<Record<string, string>>;
export type StringListMap = Readonly<Record<string, readonly string[]>>;
