import { shuffle } from "../../domain/collections";
import { pronLine } from "../../platform/audio";
import type { RandomSource } from "../../platform/contracts";
import type { DrillWord, Gate, InferenceWord, Root, Word } from "../../types/content";
import type { QuizItem } from "../../types/state";

interface PromptViewOptions {
  item: QuizItem;
  word: Word | DrillWord | null;
  gates: readonly Gate[];
  inferencePool: readonly InferenceWord[];
  drillWords: readonly DrillWord[];
  random: RandomSource;
  vignette(word: Word | DrillWord): string;
  literal(word: Word | DrillWord): string;
  rootForms(root: Root): string[];
  rootCue(root: Root): string;
  rootAudio(root: string): string;
}

export interface PromptView {
  promptHtml: string;
  bodyHtml: string;
  typed: boolean;
  compose?: { segs: string[]; target: string };
}

const labels = ["A", "B", "C", "D"];

export function buildPromptView(options: PromptViewOptions): PromptView {
  const { item } = options;
  switch (item.m) {
    case "REC": {
      const word = requireWord(options.word, item.m);
      const choices = shuffle([
        { text: word.def, correct: true },
        ...word.distractors.map((text) => ({ text, correct: false }))
      ], options.random);
      return {
        promptHtml: `<div class="q-ask">What does it mean?</div><div class="q-word">${word.word}</div>`,
        bodyHtml: renderObjectChoices(choices),
        typed: false
      };
    }
    case "REV": {
      const word = requireWord(options.word, item.m);
      const gate = requireGate(options.gates, item.gi);
      const others = shuffle(
        gate.words.filter((candidate) => candidate.word !== word.word),
        options.random
      ).slice(0, 3).map((candidate) => candidate.word);
      const choices = shuffle([
        { text: word.word, correct: true },
        ...others.map((text) => ({ text, correct: false }))
      ], options.random);
      return {
        promptHtml: `<div class="q-ask">Which word fits?</div><div class="q-def">“${word.def}”</div>`,
        bodyHtml: renderObjectChoices(choices, true),
        typed: false
      };
    }
    case "PAIR": {
      const pair = requireValue(item.pair, "PAIR data");
      const choices = shuffle([pair.a, pair.b], options.random);
      return {
        promptHtml: `<div class="q-ask">Near twins — which one fits?</div><div class="q-sentence">“${escapeHtml(pair.s).replace("___", "<b>＿＿＿＿</b>")}”</div>`,
        bodyHtml: renderStringChoices(choices, (choice) => choice === pair.ans, true),
        typed: false
      };
    }
    case "INFER": {
      const inference = requireValue(item.inf, "INFER data");
      const choices = shuffle([
        { text: inference.def, correct: true },
        ...inference.distractors.map((text) => ({ text, correct: false }))
      ], options.random);
      return {
        promptHtml: `<div class="q-ask">Never taught — build it from its roots</div><div class="q-word">${inference.word}</div>${pronLine(inference.word, inference.pron ?? "")}`,
        bodyHtml: renderObjectChoices(choices),
        typed: false
      };
    }
    case "DSENT": {
      const word = requireWord(options.word, item.m);
      const choices = requireValue(item.opts, "DSENT options");
      return {
        promptHtml: `<div class="q-ask">Which word fits the sentence?</div><div class="q-sentence">“${blankWord(word)}”</div>`,
        bodyHtml: renderStringChoices(choices, (choice) => choice === word.word, true),
        typed: false
      };
    }
    case "LIT":
    case "ETY":
    case "KIN": {
      const word = requireWord(options.word, item.m);
      const choices = requireValue(item.opts, `${item.m} options`);
      const promptHtml = item.m === "LIT"
        ? `<div class="q-ask">Its pieces read, in order</div><div class="q-def" style="font-family:'IBM Plex Mono',monospace;font-size:16.5px;line-height:1.7">${options.literal(word)}</div><div class="q-ask" style="margin:12px 0 0">— which word is built so?</div>`
        : item.m === "ETY"
          ? `<div class="q-ask">A word's history — whose is it?</div><div class="q-sentence">“${item.masked ?? ""}”</div>`
          : `<div class="q-ask">Same blood — which word is kin to</div><div class="q-word">${item.kin ?? ""}</div>`;
      return {
        promptHtml,
        bodyHtml: renderStringChoices(choices, (choice) => choice === word.word, true),
        typed: false
      };
    }
    case "ROOTQ": {
      const word = requireWord(options.word, item.m);
      const part = requireValue(item.part, "ROOTQ part");
      const choices = requireValue(item.opts, "ROOTQ options");
      const wordHtml = word.parts.map((candidate) =>
        candidate === part ? `<span style="color:var(--ox)">${candidate[0]}</span>` : candidate[0]
      ).join("");
      return {
        promptHtml: `<div class="q-ask">One piece of it — what does the marked piece carry?</div><div class="q-word">${wordHtml}</div>`,
        bodyHtml: renderStringChoices(choices, (choice) => choice === part[1], false, true),
        typed: false
      };
    }
    case "ROOTS": {
      const root = requireValue(item.root, "ROOTS root");
      const choices = requireValue(item.opts, "ROOTS options");
      return {
        promptHtml: `<div class="q-ask">The root itself — what does it carry?</div><div class="q-word" style="font-family:'IBM Plex Mono',monospace">${root.root} ${options.rootAudio(root.root)}</div><div class="pron">${root.lang}</div>`,
        bodyHtml: renderStringChoices(choices, (choice) => choice === root.gloss, false, true),
        typed: false
      };
    }
    case "ROOTT": {
      const root = requireValue(item.root, "ROOTT root");
      const multipleForms = options.rootForms(root).length > 1;
      return {
        promptHtml: `<div class="q-ask">Name the root — the ${root.lang} for</div><div class="q-def">“${root.gloss}”</div><div class="cue">${options.rootCue(root)}</div>${multipleForms ? '<div class="hint">Either spelling is accepted — punctuation and spacing don\'t need to match exactly.</div>' : ""}`,
        bodyHtml: `<div class="typebox"><input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${multipleForms ? "either form…" : "the root…"}"><button class="btn" id="sub">Submit</button></div>`,
        typed: true
      };
    }
    case "COMPOSE": {
      const source = item.inf ?? requireWord(options.word, item.m);
      const segments = source.parts.map((part) => part[0]);
      const distractorPool: string[] = [];
      const collect = (word: Word | DrillWord | InferenceWord): void => {
        if (word.word === source.word) return;
        word.parts.forEach((part) => {
          if (part[0].length > 1) distractorPool.push(part[0]);
        });
      };
      if (item.inf) options.inferencePool.forEach(collect);
      else if (item.drill) options.drillWords.forEach(collect);
      else requireGate(options.gates, item.gi).words.forEach(collect);
      const distractors = shuffle(
        [...new Set(distractorPool)].filter((segment) => !segments.includes(segment)),
        options.random
      ).slice(0, 3);
      const bank = shuffle([...segments, ...distractors], options.random);
      return {
        promptHtml: `<div class="q-ask">Assemble the word — ${segments.length} pieces, in order</div><div class="q-def">“${source.def}”</div>`,
        bodyHtml: `<div class="built" id="built">&nbsp;</div>
          <div class="chipbank">${bank.map((segment) => `<button class="chip" data-seg="${escapeHtml(segment)}">${segment}</button>`).join("")}</div>
          <div class="typebox" style="justify-content:center"><button class="btn ghost" id="clr">Clear</button></div>`,
        typed: false,
        compose: { segs: segments, target: source.word }
      };
    }
    case "VIG": {
      const word = requireWord(options.word, item.m);
      const gate = requireGate(options.gates, item.gi);
      const scene = options.vignette(word) || word.def;
      const others = shuffle(
        gate.words.filter((candidate) => candidate.word !== word.word),
        options.random
      ).slice(0, 3).map((candidate) => candidate.word);
      const choices = shuffle([
        { text: word.word, correct: true },
        ...others.map((text) => ({ text, correct: false }))
      ], options.random);
      return {
        promptHtml: `<div class="q-ask">Read the scene — which word does it call for?</div><div class="q-sentence">“${escapeHtml(scene)}”</div>`,
        bodyHtml: renderObjectChoices(choices, true),
        typed: false
      };
    }
    case "PROD":
    case "VIGT":
    case "CLOZE":
    case "LITT": {
      const word = requireWord(options.word, item.m);
      const vignette = options.vignette(word);
      const promptHtml = item.m === "VIGT" && vignette
        ? `<div class="q-ask">Name the word the scene calls for — exact spelling</div><div class="q-sentence">“${escapeHtml(vignette)}”</div><div class="cue">${letterCue(word.word)}</div>`
        : item.m === "CLOZE"
          ? `<div class="q-ask">Complete the sentence — exact spelling</div><div class="q-sentence">“${blankWord(word)}”</div><div class="cue">${letterCue(word.word)}</div>`
          : item.m === "LITT"
            ? `<div class="q-ask">Its pieces read, in order — type the word</div><div class="q-def" style="font-family:'IBM Plex Mono',monospace;font-size:16.5px;line-height:1.7">${options.literal(word)}</div><div class="cue">${letterCue(word.word)}</div>`
            : `<div class="q-ask">Type the word — exact spelling</div><div class="q-def">“${word.def}”</div>${item.drill ? `<div class="cue">${letterCue(word.word)}</div>` : ""}`;
      return {
        promptHtml,
        bodyHtml: '<div class="typebox"><input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="the word…"><button class="btn" id="sub">Submit</button></div>',
        typed: true
      };
    }
  }
}

function renderObjectChoices(
  choices: readonly { text: string; correct: boolean }[],
  monospace = false
): string {
  return `<div class="choices">${choices.map((choice, index) =>
    `<button class="choice" data-ok="${choice.correct}"><span class="mark">${labels[index] ?? ""}</span><span${monospace ? " style=\"font-family:'IBM Plex Mono',monospace\"" : ""}>${choice.text}</span></button>`
  ).join("")}</div>`;
}

function renderStringChoices(
  choices: readonly string[],
  isCorrect: (choice: string) => boolean,
  monospace: boolean,
  quote = false
): string {
  return renderObjectChoices(
    choices.map((choice) => ({
      text: quote ? `“${choice}”` : choice,
      correct: isCorrect(choice)
    })),
    monospace
  );
}

function blankWord(word: Word | DrillWord): string {
  const pattern = new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return escapeHtml(word.sentence).replace(pattern, "<b>＿＿＿＿</b>");
}

function letterCue(word: string): string {
  return word[0] + word.slice(1).replace(/[^ ]/g, "·");
}

function requireWord(
  word: Word | DrillWord | null,
  mode: QuizItem["m"]
): Word | DrillWord {
  if (!word) throw new Error(`${mode} prompt requires a word`);
  return word;
}

function requireGate(gates: readonly Gate[], index: number | undefined): Gate {
  const gate = index === undefined ? undefined : gates[index];
  if (!gate) throw new Error("Prompt requires a valid gate");
  return gate;
}

function requireValue<T>(value: T | null | undefined, label: string): T {
  if (value === null || value === undefined) throw new Error(`Prompt requires ${label}`);
  return value;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
