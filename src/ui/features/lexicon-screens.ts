interface SearchScreenOptions {
  app: HTMLElement;
  query: string;
  rowsHtml: string;
  onSearch(query: string): void;
}

interface RootLexiconScreenOptions extends SearchScreenOptions {
  rootCount: number;
  wordCount: number;
  onHome(): void;
  onWords(): void;
  onRoot(key: string): void;
}

export function renderRootLexiconScreen(options: RootLexiconScreenOptions): void {
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="home">← The Gates</button>
    <div class="stage-label">The Lexicon · Roots · ${options.rootCount}</div>
    <button class="lex-switch" id="to-words">
      <span class="lex-switch-t">The Words</span>
      <span class="lex-switch-ct">${options.wordCount} ${options.wordCount === 1 ? "word" : "words"} grown from these roots</span>
      <span class="lex-switch-arrow">→</span></button>
    <div class="typebox" style="margin:6px 0 14px"><input id="lexq" placeholder="search root or meaning…" value="${options.query}" autocomplete="off"></div>
    <div class="lex-list">${options.rowsHtml || '<div class="grad-note">No roots yet — seal a gate to begin your keeping.</div>'}</div></section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  requiredButton(options.app, "#to-words").onclick = options.onWords;
  wireSearch(options);
  options.app.querySelectorAll<HTMLButtonElement>(".lex-row[data-key]").forEach((button) => {
    button.onclick = () => {
      if (button.dataset.key) options.onRoot(button.dataset.key);
    };
  });
}

interface RootDetailScreenOptions {
  app: HTMLElement;
  stageLabel: string;
  root: string;
  gloss: string;
  noteHtml: string;
  familyRowsHtml: string;
  onBack(): void;
  onWord(gateIndex: number, wordIndex: number): void;
}

export function renderRootDetailScreen(options: RootDetailScreenOptions): void {
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="back">← The Roots</button>
    <div class="stage-label">${options.stageLabel}</div>
    <div class="card">
      <div class="headword rl-head">${options.root}</div>
      <div class="rl-gloss-lg">“${options.gloss}”</div>
      ${options.noteHtml}
    </div>
    ${options.familyRowsHtml ? `<div class="rl-grow-label">Grows into</div><div class="lex-list">${options.familyRowsHtml}</div>` : ""}
  </section>`;
  requiredButton(options.app, "#back").onclick = options.onBack;
  options.app.querySelectorAll<HTMLButtonElement>(".lex-row[data-gi][data-wi]").forEach((button) => {
    button.onclick = () => {
      const gateIndex = Number(button.dataset.gi);
      const wordIndex = Number(button.dataset.wi);
      if (Number.isInteger(gateIndex) && Number.isInteger(wordIndex)) {
        options.onWord(gateIndex, wordIndex);
      }
    };
  });
}

export type LexiconSelection =
  | { kind: "gate"; gateIndex: number; wordIndex: number }
  | { kind: "drill"; drillIndex: number }
  | { kind: "inference"; inferenceIndex: number };

interface WordLexiconScreenOptions extends SearchScreenOptions {
  wordCount: number;
  onRoots(): void;
  onSelect(selection: LexiconSelection): void;
}

export function renderWordLexiconScreen(options: WordLexiconScreenOptions): void {
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="home">← The Roots</button>
    <div class="stage-label">The Lexicon · Words · ${options.wordCount}</div>
    <div class="typebox" style="margin:6px 0 14px"><input id="lexq" placeholder="search word or meaning…" value="${options.query}" autocomplete="off"></div>
    <div class="lex-list">${options.rowsHtml || '<div class="grad-note">Nothing matches.</div>'}</div></section>`;
  requiredButton(options.app, "#home").onclick = options.onRoots;
  wireSearch(options);
  options.app.querySelectorAll<HTMLButtonElement>(".lex-row").forEach((button) => {
    button.onclick = () => {
      if (button.dataset.dr !== undefined) {
        options.onSelect({ kind: "drill", drillIndex: Number(button.dataset.dr) });
      } else if (button.dataset.inf !== undefined) {
        options.onSelect({ kind: "inference", inferenceIndex: Number(button.dataset.inf) });
      } else {
        options.onSelect({
          kind: "gate",
          gateIndex: Number(button.dataset.gi),
          wordIndex: Number(button.dataset.wi)
        });
      }
    };
  });
}

interface DetailScreenOptions {
  app: HTMLElement;
  stageLabel: string;
  contentHtml: string;
  backLabel: string;
  onBack(): void;
}

export function renderLexiconDetailScreen(options: DetailScreenOptions): void {
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="back">← ${options.backLabel}</button>
    <div class="stage-label">${options.stageLabel}</div>
    ${options.contentHtml}
  </section>`;
  requiredButton(options.app, "#back").onclick = options.onBack;
}

function wireSearch(options: SearchScreenOptions): void {
  const input = options.app.querySelector<HTMLInputElement>("#lexq");
  if (!input) throw new Error("Lexicon search control did not render");
  let timer: ReturnType<typeof setTimeout> | undefined;
  input.oninput = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => options.onSearch(input.value), 140);
  };
  if (options.query) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

function requiredButton(app: HTMLElement, selector: string): HTMLButtonElement {
  const button = app.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`Lexicon control ${selector} did not render`);
  return button;
}
