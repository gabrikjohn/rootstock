export type WordPart = readonly [surface: string, gloss: string];

// The part of speech the word's own definition uses, not the word's full range in English.
// Several headwords are legitimately multi-POS (aggregate, consummate, cosmopolitan); tagging
// them with every valid sense would make the option-set homogeneity rule meaningless.
export type PartOfSpeech = "n." | "v." | "adj." | "adv.";

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
