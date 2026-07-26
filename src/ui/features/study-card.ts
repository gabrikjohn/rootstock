import { pronLine } from "../../platform/audio";
import type { Gate, Word } from "../../types/content";

interface StudyCardContext {
  gates: readonly Gate[];
  etymology(word: Word): string;
}

interface GhostRange {
  start: number;
  end: number;
  definition: string;
}

export function renderStudyCard(word: Word, context: StudyCardContext): string {
  const morphology = word.parts.map((part, index) => {
    const segment = `<div class="seg ${part[1] === "" ? "empty" : ""}"><div class="sy">${part[0]}</div>${part[1] ? `<div class="mn">${part[1]}</div>` : ""}</div>`;
    return index < word.parts.length - 1 ? `${segment}<span class="plus">+</span>` : segment;
  }).join("");
  const kin = word.kin ? `<div class="near">kin: ${word.kin.join(" · ")}</div>` : "";
  const etymology = context.etymology(word);
  return `<div class="card"><div class="headword">${word.word}</div>${pronLine(word.word, word.pron)}
    <div class="morph">${morphology}</div><div class="def">${word.def}</div>
    <div class="exline">“${ghostify(word, context.gates)}”<div class="ghost-note" style="display:none"></div></div>${etymology ? `<div class="ety">${etymology}</div>` : ""}${kin}</div>`;
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

function ghostify(word: Word, gates: readonly Gate[]): string {
  const gateIndex = gates.findIndex((gate) => gate.words.includes(word));
  const sentence = escapeHtml(word.sentence);
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
