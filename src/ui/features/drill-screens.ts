export interface DrillFocusCard {
  id: string;
  glyph: string;
  label: string;
  note: string;
  enabled: boolean;
}

interface DrillMenuOptions {
  app: HTMLElement;
  focuses: readonly DrillFocusCard[];
  onHome(): void;
  onFocus(id: string): void;
}

export function renderDrillMenu(options: DrillMenuOptions): void {
  const cards = options.focuses.map((focus) => `<button class="lvl-card" ${focus.enabled ? "" : "disabled"} data-focus="${focus.id}">
    <div class="lvl-num" style="color:var(--gild)">${focus.glyph}</div>
    <div class="lvl-body"><h3>${focus.label}</h3><p>${focus.note}</p></div></button>`).join("");
  options.app.innerHTML = `<section class="panel">
    <button class="back" id="home">← The Gates</button>
    <div class="stage-label">The Drill Hall</div>
    <div class="stage-title">Choose a focus</div>
    <p class="theme">Drill one facet at a time, or take the adaptive mix. Every focus tunes itself to you and runs as long as you like.</p>
    ${cards}</section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  options.app.querySelectorAll<HTMLButtonElement>(".lvl-card[data-focus]:not(:disabled)")
    .forEach((button) => {
      button.onclick = () => {
        if (button.dataset.focus) options.onFocus(button.dataset.focus);
      };
    });
}

interface DrillIntroOptions {
  app: HTMLElement;
  onHome(): void;
  onEnter(): void;
}

export function renderDrillIntro(options: DrillIntroOptions): void {
  options.app.innerHTML = `<section class="panel seal-wrap">
    <button class="back" id="home" style="display:block;text-align:left">← The Gates</button>
    <div class="stage-label">The Drill Hall</div>
    <div class="grad-title">Words the gates never taught.</div>
    <p class="grad-note">An advanced stock, every word built from roots you have already sealed. The drill attacks each word from a different side every time you meet it — what it means, the sentence it lives in, the literal reading of its pieces, the root inside it, its history, its kin — until it comes off your fingers on demand. It measures your caliber as you answer and serves words just past your reach — right about seven times in ten, by design. Sealing more gates unlocks deeper stock. Drill as long as you like; nothing here is required.</p>
    <div class="actions"><button class="btn" id="go">Enter the Drill Hall →</button></div></section>`;
  requiredButton(options.app, "#home").onclick = options.onHome;
  requiredButton(options.app, "#go").onclick = options.onEnter;
}

interface DrillMetaOptions {
  app: HTMLElement;
  left: string;
  right: string;
  progressPercent: number;
  onBack(): void;
}

export function updateDrillMeta(options: DrillMetaOptions): void {
  const meta = options.app.querySelector<HTMLElement>(".queue-meta");
  if (meta) meta.innerHTML = `<span>${options.left}</span><span>${options.right}</span>`;
  const fill = options.app.querySelector<HTMLElement>(".sbar .sfill");
  if (fill) fill.style.width = `${options.progressPercent}%`;
  const back = options.app.querySelector<HTMLButtonElement>("#home");
  if (back) {
    back.textContent = "← The Drill Hall";
    back.onclick = options.onBack;
  }
}

function requiredButton(app: HTMLElement, selector: string): HTMLButtonElement {
  const button = app.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`Drill Hall control ${selector} did not render`);
  return button;
}
