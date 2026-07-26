import type { Gate, Root } from "../../types/content";

interface RootsScreenOptions {
  app: HTMLElement;
  gate: Gate;
  gateNumber: string;
  rootRowsHtml: string;
  onHome(): void;
  onStart(): void;
}

export function renderRootsScreen(options: RootsScreenOptions): void {
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="home">← The Gates</button>
    <div class="stage-label">Gate ${options.gateNumber} · The Roots</div>
    <div class="stage-title">${options.gate.title}</div>
    <p class="theme">${options.gate.theme}</p>${options.rootRowsHtml}
    <div class="actions"><button class="btn" id="go">Prove the roots →</button></div></section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  requiredButton(options.app, "#go").onclick = options.onStart;
}

export interface RootChoice {
  text: string;
  correct: boolean;
}

interface RootDrillScreenOptions {
  app: HTMLElement;
  gateNumber: string;
  progressHtml: string;
  queueLength: number;
  debt: number;
  root: Root;
  rootAudioHtml: string;
  choices: readonly RootChoice[];
  onHome(): void;
}

export interface RootDrillElements {
  verdict: HTMLElement;
  actions: HTMLElement;
}

export function renderRootDrillScreen(options: RootDrillScreenOptions): RootDrillElements {
  const labels = ["A", "B", "C", "D"];
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="home">← The Gates</button>
    <div class="stage-label">Gate ${options.gateNumber} · Root Drill</div>
    ${options.progressHtml}
    <div class="queue-meta"><span>${options.queueLength} in queue</span><span class="debt">${options.debt ? `+${options.debt} penalty reps` : ""}</span></div>
    <div class="prompt"><div class="q-ask">What does the root mean?</div>
      <div class="q-word" style="font-family:'IBM Plex Mono',monospace;font-weight:500">${options.root.root} ${options.rootAudioHtml}</div>
      <div class="grad-score">${options.root.lang}</div></div>
    <div class="choices">${options.choices.map((choice, index) =>
      `<button class="choice" data-ok="${choice.correct}"><span class="mark">${labels[index] ?? ""}</span><span>${choice.text}</span></button>`
    ).join("")}</div>
    <div class="verdict" id="v"></div><div class="actions" id="a"></div></section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  const verdict = options.app.querySelector<HTMLElement>("#v");
  const actions = options.app.querySelector<HTMLElement>("#a");
  if (!verdict || !actions) throw new Error("Root drill controls did not render");
  return { verdict, actions };
}

interface StudyScreenOptions {
  app: HTMLElement;
  gateNumber: string;
  wordIndex: number;
  totalWords: number;
  progressHtml: string;
  cardHtml: string;
  onHome(): void;
  onNext(): void;
  onPrevious(): void;
}

export function renderStudyScreen(options: StudyScreenOptions): void {
  const last = options.wordIndex === options.totalWords - 1;
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="home">← The Gates</button>
    <div class="stage-label">Gate ${options.gateNumber} · Study — word ${options.wordIndex + 1} of ${options.totalWords}</div>
    ${options.progressHtml}
    ${options.cardHtml}
    <div class="actions">
      ${options.wordIndex > 0 ? '<button class="btn ghost" id="prev">← Back</button>' : ""}
      <button class="btn" id="next">${last ? "Trial I →" : "Next word →"}</button>
    </div></section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  requiredButton(options.app, "#next").onclick = options.onNext;
  const previous = options.app.querySelector<HTMLButtonElement>("#prev");
  if (previous) previous.onclick = options.onPrevious;
}

interface TemperScreenOptions {
  app: HTMLElement;
  gateNumber: string;
  countdown: string;
  weakWords: readonly string[];
  onHome(): void;
  onRestudy(): void;
}

export function renderTemperScreen(options: TemperScreenOptions): HTMLElement {
  options.app.innerHTML = `<section class="panel seal-wrap">
    <button class="back" id="home" style="display:block;text-align:left">← The Gates</button>
    <div class="stage-label">Gate ${options.gateNumber} · Tempering</div>
    <div class="grad-title">Trial I is passed.</div>
    <p class="grad-note">A word learned in one sitting is a word half-learned. Sleep is where it sets. Trial II — typed production, exact spelling, with review and confusable pairs — opens after a night, in:</p>
    <div class="temper-clock" id="clk">${options.countdown}</div>
    ${options.weakWords.length ? `<p class="grad-note" style="color:var(--ox)">Weak words this sitting: ${options.weakWords.join(", ")}. Read their cards once more before you close the book.</p>` : ""}
    <p class="grad-note">Close the book. Use the words aloud today. Sleep, then return in the morning.</p>
    <div class="actions"><button class="btn ghost" id="restudy">Re-read the cards meanwhile</button></div></section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  requiredButton(options.app, "#restudy").onclick = options.onRestudy;
  const clock = options.app.querySelector<HTMLElement>("#clk");
  if (!clock) throw new Error("Tempering clock did not render");
  return clock;
}

interface StudyReviewScreenOptions {
  app: HTMLElement;
  gateNumber: string;
  wordIndex: number;
  totalWords: number;
  cardHtml: string;
  onBack(): void;
  onNext(): void;
  onPrevious(): void;
}

export function renderStudyReviewScreen(options: StudyReviewScreenOptions): void {
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="back">← Tempering clock</button>
    <div class="stage-label">Gate ${options.gateNumber} · Review — ${options.wordIndex + 1} of ${options.totalWords}</div>
    ${options.cardHtml}
    <div class="actions">
      ${options.wordIndex > 0 ? '<button class="btn ghost" id="p">←</button>' : ""}
      ${options.wordIndex < options.totalWords - 1 ? '<button class="btn" id="n">→</button>' : ""}
    </div></section>`;
  requiredButton(options.app, "#back").onclick = options.onBack;
  const next = options.app.querySelector<HTMLButtonElement>("#n");
  if (next) next.onclick = options.onNext;
  const previous = options.app.querySelector<HTMLButtonElement>("#p");
  if (previous) previous.onclick = options.onPrevious;
}

interface SealedGateScreenOptions {
  app: HTMLElement;
  gate: Gate;
  gateNumber: string;
  rootRowsHtml: string;
  wordRowsHtml: string;
  onHome(): void;
  onWord(wordIndex: number): void;
}

export function renderSealedGateScreen(options: SealedGateScreenOptions): void {
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="home">← The Gates</button>
    <div class="stage-label">Gate ${options.gateNumber} · Sealed</div>
    <div class="stage-title">${options.gate.title}</div>
    <p class="theme">${options.gate.theme}</p>${options.rootRowsHtml}
    <div class="lex-list" style="margin-top:14px">${options.wordRowsHtml}</div></section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  options.app.querySelectorAll<HTMLButtonElement>(".lex-row[data-wi]").forEach((button) => {
    button.onclick = () => {
      const index = Number(button.dataset.wi);
      if (Number.isInteger(index)) options.onWord(index);
    };
  });
}

export interface SealScreenOptions {
  seal: string;
  title: string;
  score: string;
  note: string;
  actions: string;
  gold?: boolean;
}

export function renderSealScreen(app: HTMLElement, options: SealScreenOptions): void {
  app.innerHTML = `<section class="panel seal-wrap">
    <div class="wax ${options.gold ? "gold" : ""}"><span>${options.seal}</span></div>
    <div class="grad-score">${options.score}</div>
    <div class="grad-title">${options.title}</div>
    <p class="grad-note">${options.note}</p>
    <div class="actions">${options.actions}</div></section>`;
}

function requiredButton(app: HTMLElement, selector: string): HTMLButtonElement {
  const button = app.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`Gate screen control ${selector} did not render`);
  return button;
}
