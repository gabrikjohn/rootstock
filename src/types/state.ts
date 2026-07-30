import type {
  ConfusablePair,
  DrillWord,
  InferenceWord,
  Root,
  Word,
  WordPart
} from "./content";

export interface GateProgress {
  t1?: number;
  sealed?: boolean;
}

export interface ReviewProgress {
  due: number;
  box: number;
  tier?: number;
}

export interface DrillHistory {
  r: number;
  w: number;
  m?: string[];
}

export interface DrillProgress {
  theta: number;
  n: number;
  seen: Record<string, DrillHistory>;
  roots: Record<string, DrillHistory>;
}

export interface ProgressV2 {
  gates: Record<string, GateProgress>;
  bar: { passed: boolean; lockedUntil: number; passedAt?: number; form?: number };
  review: Record<string, ReviewProgress>;
  prompted: Record<string, boolean>;
  seenInfer: Record<string, boolean>;
  seenPair: Record<string, boolean>;
  predict: boolean;
  appearance: string;
  ledger: Record<string, { r: number; w: number }>;
  mark: ProgressMark | null;
  drill: DrillProgress;
  onboarded?: boolean;
  lastActive?: number;
  streak?: number;
}

export type QuizMode =
  | "REC" | "REV" | "PAIR" | "INFER" | "DSENT" | "LIT" | "ETY" | "KIN"
  | "ROOTQ" | "ROOTS" | "ROOTT" | "COMPOSE" | "VIG" | "PROD" | "VIGT"
  | "CLOZE" | "LITT";

export interface QuizItem {
  m: QuizMode;
  gi?: number;
  wi?: number;
  k?: string;
  pair?: ConfusablePair;
  inf?: InferenceWord;
  root?: Root;
  opts?: string[];
  part?: WordPart;
  drill?: DrillWord | Word;
  masked?: string;
  kin?: string | null;
  gate?: number;
  drillB?: number;
  _compose?: { segs: string[]; target: string };
}

export interface SerializedQuizItem {
  m: QuizMode | "BLANK";
  gi?: number;
  wi?: number;
  pi?: number;
  fw?: string;
  rr?: string;
}

export interface SittingProgress {
  cleared: number;
  ahead: number;
  studyEntered?: boolean;
}

export interface ProgressMark {
  t: number;
  stage: "roots" | "study" | "trial";
  idx: number;
  kind: "T1" | "T2";
  q?: Array<number | SerializedQuizItem> | undefined;
  debt?: number | undefined;
  done?: number | undefined;
  sit?: SittingProgress | undefined;
  missed?: string[] | undefined;
  studyLeft?: number | undefined;
  w?: number | undefined;
}

interface SessionBase {
  debt: number;
  sit?: SittingProgress;
}

export interface RootSessionState extends SessionBase {
  kind: "ROOTS";
  idx: number;
  queue: number[];
  done: number;
  sit: SittingProgress;
  lastRoot?: number;
  studyLeft?: number;
}

export interface StudySessionState extends SessionBase {
  kind: "STUDY";
  idx: number;
  queue: QuizItem[];
  done: number;
  sit: SittingProgress;
  studyLeft: number;
}

export interface TrialSessionState extends SessionBase {
  kind: "T1" | "T2";
  idx: number;
  queue: QuizItem[];
  done: number;
  sit: SittingProgress;
  missed: string[];
  lastKey?: string;
  studyLeft?: number;
}

export interface DocketSessionState extends SessionBase {
  kind: "DOCKET";
  queue: QuizItem[];
  done: number;
  sit: SittingProgress;
  retired: number;
}

export interface BarSessionState extends SessionBase {
  kind: "BAR";
  queue: QuizItem[];
  pos: number;
  correct: number;
}

export interface ForgeSessionState extends SessionBase {
  kind: "FORGE";
  queue: QuizItem[];
  done: number;
  words: number;
  sit: SittingProgress;
}

export interface ForgeNowSessionState extends SessionBase {
  kind: "FORGENOW";
  queue: QuizItem[];
  pos: number;
  resume: () => void;
  saved: SessionState;
}

export type FocusId = "roots" | "defs" | "ety" | "usage" | "kin" | "new" | "all";

export interface FocusDefinition {
  id: FocusId;
  label: string;
  blurb: string;
  kind: "root" | "word" | "new" | "all";
  mc?: readonly QuizMode[];
  hard?: readonly QuizMode[];
}

export type FocusEntry =
  | { key: string; kind: "root"; root: Root; gate: number }
  | { key: string; kind: "word"; d: Word | DrillWord; gi?: number; wi?: number; drill?: boolean };

export interface FocusSchedule {
  due: number;
  weight: number;
  box: number;
  seen: boolean;
}

export interface AdaptiveDrillSessionState extends SessionBase {
  kind: "DRILL";
  focus: "all" | "new";
  queue: number[];
  n: number;
  right: number;
  recent: string[];
  sit: SittingProgress;
}

export interface FocusDrillSessionState extends SessionBase {
  kind: "DRILL";
  focus: Exclude<FocusId, "all" | "new">;
  fdef: FocusDefinition;
  queue: number[];
  n: number;
  right: number;
  recent: string[];
  step: number;
  sched: Record<string, FocusSchedule>;
  pool: FocusEntry[];
  sit: SittingProgress;
}

export type SessionState =
  | RootSessionState
  | StudySessionState
  | TrialSessionState
  | DocketSessionState
  | BarSessionState
  | ForgeSessionState
  | ForgeNowSessionState
  | AdaptiveDrillSessionState
  | FocusDrillSessionState;

export interface Entitlement {
  active: boolean;
  plan?: "annual" | "monthly" | null;
  trial?: boolean;
  expiresAt?: number | null;
  priceMonthly?: string;
  priceAnnual?: string;
}

export type NativeBridgeRequest =
  | { action: "status" }
  | { action: "purchase"; plan: "annual" | "monthly"; productId: string }
  | { action: "restore" }
  | { action: "manage" }
  | { action: "openURL"; url: string };
