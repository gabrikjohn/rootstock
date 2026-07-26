interface TrialScreenOptions {
  app: HTMLElement;
  label: string;
  gateLabel: string;
  progressHtml: string;
  queueLabel: string;
  debt: number;
  promptHtml: string;
  bodyHtml: string;
  onHome(): void;
}

export interface TrialScreenElements {
  verdict: HTMLElement;
  actions: HTMLElement;
}

export function renderTrialScreen(options: TrialScreenOptions): TrialScreenElements {
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="home">← The Gates</button>
    <div class="stage-label">${options.label}</div>
    ${options.progressHtml}
    <div class="queue-meta"><span>${options.queueLabel}</span><span class="debt">${options.debt ? `+${options.debt} penalty reps` : ""}</span></div>
    <div class="prompt">${options.gateLabel ? `<div class="review-tag">${options.gateLabel}</div>` : ""}${options.promptHtml}</div>
    ${options.bodyHtml}
    <div class="verdict" id="v"></div><div class="actions" id="a"></div></section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  const verdict = options.app.querySelector<HTMLElement>("#v");
  const actions = options.app.querySelector<HTMLElement>("#a");
  if (!verdict || !actions) throw new Error("Trial feedback controls did not render");
  return { verdict, actions };
}

interface ComposeInteractionOptions {
  app: HTMLElement;
  segmentCount: number;
  target: string;
  resolve(correct: boolean): void;
}

export function wireComposeInteraction(options: ComposeInteractionOptions): void {
  const built = options.app.querySelector<HTMLElement>("#built");
  const clear = options.app.querySelector<HTMLButtonElement>("#clr");
  const chips = [...options.app.querySelectorAll<HTMLButtonElement>(".chip")];
  if (!built || !clear) throw new Error("Compose controls did not render");
  let picked: string[] = [];
  let done = false;
  const paint = (): void => {
    built.innerHTML = picked.length
      ? picked.map((segment) => `<span class="bseg">${segment}</span>`).join("")
      : "&nbsp;";
  };
  chips.forEach((chip) => {
    chip.onclick = () => {
      if (done || chip.disabled || chip.dataset.seg === undefined) return;
      picked.push(chip.dataset.seg);
      chip.disabled = true;
      paint();
      if (picked.length !== options.segmentCount) return;
      done = true;
      const correct = picked.join("") === options.target;
      built.classList.add(correct ? "ok" : "bad");
      chips.forEach((item) => {
        item.disabled = true;
      });
      clear.disabled = true;
      options.resolve(correct);
    };
  });
  clear.onclick = () => {
    if (done) return;
    picked = [];
    chips.forEach((chip) => {
      chip.disabled = false;
    });
    paint();
  };
}

interface TypedInteractionOptions {
  app: HTMLElement;
  isCorrect(answer: string): boolean;
  resolve(correct: boolean): void;
}

export function wireTypedInteraction(options: TypedInteractionOptions): void {
  const input = options.app.querySelector<HTMLInputElement>("#ans");
  const submit = options.app.querySelector<HTMLButtonElement>("#sub");
  if (!input || !submit) throw new Error("Typed-answer controls did not render");
  input.focus();
  const check = (): void => {
    if (!input.value.trim()) return;
    const correct = options.isCorrect(input.value);
    input.disabled = true;
    submit.disabled = true;
    input.classList.add(correct ? "ok" : "bad");
    options.resolve(correct);
  };
  submit.onclick = check;
  input.onkeydown = (event) => {
    if (event.key === "Enter") check();
  };
}

function requiredButton(app: HTMLElement, selector: string): HTMLButtonElement {
  const button = app.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`Trial control ${selector} did not render`);
  return button;
}
