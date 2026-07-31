import { pronLine } from "../../platform/audio";
import type { DrillWord, Gate, InferenceWord, Word } from "../../types/content";

// The part-of-speech label, where one has been authored. Deliberately absent from live
// prompts unless every option shares a part of speech — otherwise it narrows the field.
export function posTag(word: Word | DrillWord | InferenceWord): string {
  return word.pos ? `<span class="pos">${word.pos}</span> ` : "";
}

// Every word the card can render. Inference words carry no example sentence and no `pron`;
// both are handled rather than required, so one card serves the whole corpus.
export type StudyCardWord = Word | DrillWord | InferenceWord;

interface StudyCardContext {
  gates: readonly Gate[];
  etymology(word: StudyCardWord): string;
  // Deep note per word piece, plus the family a root grows into. Empty string = omit.
  deepPanel?(word: StudyCardWord): string;
  // A closing line under the definition — the roots note an inference word is built to
  // teach. Empty string = omit, same contract as deepPanel.
  nearNote?(word: StudyCardWord): string;
}

interface GhostRange {
  start: number;
  end: number;
  definition: string;
}

export function renderStudyCard(word: StudyCardWord, context: StudyCardContext): string {
  const morphology = word.parts.map((part, index) => {
    const segment = `<div class="seg ${part[1] === "" ? "empty" : ""}"><div class="sy">${part[0]}</div>${part[1] ? `<div class="mn">${part[1]}</div>` : ""}</div>`;
    return index < word.parts.length - 1 ? `${segment}<span class="plus">+</span>` : segment;
  }).join("");
  const kinList = "kin" in word ? word.kin : undefined;
  const near = kinList?.length
    ? `<div class="near">kin: ${kinList.join(" · ")}</div>`
    : (context.nearNote?.(word) ? `<div class="near">${context.nearNote(word)}</div>` : "");
  const etymology = context.etymology(word);
  // Inference words have no authored sentence yet; the example line is omitted rather than
  // rendered empty, so the card closes cleanly on the definition.
  const example = word.sentence
    ? `<div class="exline">“${ghostify(word, word.sentence, context.gates)}”<div class="ghost-note" style="display:none"></div></div>`
    : "";
  return `<div class="card"><div class="headword">${word.word}</div>${pronLine(word.word, word.pron ?? "")}
    <div class="morph">${morphology}</div><div class="def">${posTag(word)}${word.def}</div>
    ${example}${etymology ? `<div class="ety">${etymology}</div>` : ""}${near}${deepDisclosure(word, context)}</div>`;
}

// An in-card expander rather than a screen: the study stage bookmarks by word index, and a
// navigation would need mark state that opening a panel does not.
function deepDisclosure(word: StudyCardWord, context: StudyCardContext): string {
  const body = context.deepPanel?.(word) ?? "";
  if (!body) return "";
  return `<div class="deep-wrap"><button class="deep-toggle" data-deep>Where it comes from ▾</button>
    <div class="deep-body" style="display:none">${body}</div></div>`;
}

export function installDeepDisclosure(root: Document = document): void {
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const toggle = target.closest<HTMLButtonElement>("[data-deep]");
    const body = toggle?.parentElement?.querySelector<HTMLElement>(".deep-body");
    if (!toggle || !body) return;
    const open = body.style.display !== "none";
    body.style.display = open ? "none" : "block";
    toggle.textContent = open ? "Where it comes from ▾" : "Less ▴";
  });
}

export function installGhostDefinitions(root: Document = document): void {
  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const ghost = target.closest<HTMLButtonElement>(".ghost:not(.btn)");
    const example = ghost?.closest<HTMLElement>(".exline");
    const note = example?.querySelector<HTMLElement>(".ghost-note");
    const definition = ghost?.dataset.def;
    if (!note || definition === undefined) return;
    if (note.style.display !== "none" && note.textContent === definition) {
      note.style.display = "none";
      return;
    }
    note.textContent = definition;
    note.style.display = "block";
  });
}

function ghostify(word: StudyCardWord, source: string, gates: readonly Gate[]): string {
  // Drill and inference words are not members of any gate, so this resolves to -1 and they
  // ghost nothing. Do not substitute `req` here: it is a gate id on a DrillWord but a gate
  // index on an InferenceWord, so one scale would silently mis-slice the other's history.
  const gateIndex = gates.findIndex((gate) => gate.words.some((candidate) => candidate === word));
  const sentence = escapeHtml(source);
  const normalizedSentence = sentence.toLowerCase();
  const headwordStart = normalizedSentence.indexOf(word.word.toLowerCase());
  const headwordEnd = headwordStart < 0 ? -1 : headwordStart + word.word.length;
  const ranges: GhostRange[] = [];

  gates.slice(0, Math.max(gateIndex, 0)).forEach((gate) => {
    gate.words.forEach((earlierWord) => {
      const stem = (earlierWord.word.length >= 6
        ? earlierWord.word.slice(0, -1)
        : earlierWord.word).toLowerCase();
      const match = normalizedSentence.indexOf(stem);
      if (match < 0) return;
      let end = match + stem.length;
      while (end < sentence.length && /[a-zA-Z]/.test(sentence[end] ?? "")) end += 1;
      let start = match;
      while (start > 0 && /[a-zA-Z]/.test(sentence[start - 1] ?? "")) start -= 1;
      if (!sentence.slice(start, end).toLowerCase().startsWith(stem)) return;
      if (headwordStart >= 0 && start < headwordEnd && end > headwordStart) return;
      if (ranges.some((range) => start < range.end && end > range.start)) return;
      ranges.push({
        start,
        end,
        definition: `${escapeHtml(earlierWord.word)} — ${escapeHtml(earlierWord.def)}`
      });
    });
  });

  ranges.sort((left, right) => right.start - left.start);
  let output = sentence;
  ranges.forEach((range) => {
    output = `${output.slice(0, range.start)}<button class="ghost" data-def="${range.definition}">${output.slice(range.start, range.end)}</button>${output.slice(range.end)}`;
  });
  return output;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
