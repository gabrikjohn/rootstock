export type WordPart = readonly [surface: string, gloss: string];

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
}

export interface DrillWord extends Word {
  req: number;
  b: number;
  ety: string;
}

export interface DepthEntry {
  v: string;
  e: string;
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
