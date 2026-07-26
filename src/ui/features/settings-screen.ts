export type Appearance =
  | "parchment"
  | "classic"
  | "plain"
  | "odyssey"
  | "dragon-codex";

interface SettingsOptions {
  app: HTMLElement;
  active: boolean;
  trial: boolean;
  planName: string;
  trialDaysLeft: number;
  gateCount: number;
  currentTheme: Appearance;
  predictionEnabled: boolean;
  onHome(): void;
  onUpgrade(): void;
  onManage(): void;
  onRestore(): void;
  onBackup(): void;
  onRestoreCode(): void;
  onPrivacy(): void;
  onTerms(): void;
  onSupport(): void;
  onTogglePrediction(): void;
  onTheme(theme: Appearance): void;
}

function requiredButton(app: HTMLElement, selector: string): HTMLButtonElement {
  const button = app.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`Missing Rootstock settings control: ${selector}`);
  return button;
}

const THEMES: ReadonlyArray<{
  id: Appearance;
  previewClass: string;
  title: string;
  description: string;
}> = [
  {
    id: "parchment",
    previewClass: "parchment",
    title: "Classic Parchment",
    description: "Rootstock’s original scholarly folio"
  },
  {
    id: "classic",
    previewClass: "classic",
    title: "Classic Book",
    description: "A restrained old-reference treatment"
  },
  {
    id: "plain",
    previewClass: "plain",
    title: "Plain",
    description: "Minimal color and ornament"
  },
  {
    id: "odyssey",
    previewClass: "odyssey",
    title: "Odyssey",
    description: "Limited-edition seafaring folio"
  },
  {
    id: "dragon-codex",
    previewClass: "codex",
    title: "The Dragon Codex",
    description: "Limited Edition · Included"
  }
];

export function appearanceName(theme: Appearance): string {
  return THEMES.find((entry) => entry.id === theme)?.title ?? "Classic Parchment";
}

export function renderSettings(options: SettingsOptions): void {
  const statusTitle = options.active
    ? `Rootstock Full${options.planName ? ` · ${options.planName}` : ""}`
    : "Free";
  const statusDescription = options.trial
    ? `Free trial — ${options.trialDaysLeft} day${options.trialDaysLeft === 1 ? "" : "s"} left`
    : options.active
      ? "Subscription active"
      : `Gates I–III · upgrade to open all ${options.gateCount}`;
  const subscriptionRows = options.active
    ? `<button class="set-row" id="s-manage"><span class="lab"><span>Manage subscription</span><span class="d">Change plan or cancel in the App Store</span></span><span class="chev">›</span></button>
       <button class="set-row" id="s-restore"><span class="lab">Restore purchases</span><span class="chev">›</span></button>`
    : `<button class="set-row" id="s-upgrade"><span class="lab"><span>Upgrade to Rootstock Full</span><span class="d">All ${options.gateCount} gates, the Bar &amp; the Drill Hall</span></span><span class="chev">›</span></button>
       <button class="set-row" id="s-restore"><span class="lab">Restore purchases</span><span class="chev">›</span></button>`;
  const themeOptions = THEMES.map((theme) => {
    const selected = theme.id === options.currentTheme;
    return `<button class="theme-option ${selected ? "sel" : ""}" type="button" role="radio" aria-checked="${selected}" data-theme="${theme.id}">
      <span class="theme-preview ${theme.previewClass}" aria-hidden="true"></span>
      <span><b>${theme.title}</b><span class="d">${theme.description}</span></span>
    </button>`;
  }).join("");

  options.app.innerHTML = `<section class="panel">
    <button class="back" id="s-home">← The Gates</button>
    <div class="stage-label">Settings</div>
    <div class="stage-title" style="margin-bottom:22px">Your account</div>
    <div class="set-grp"><div class="set-h">Subscription</div>
      <div class="set-card">
        <div class="set-status ${options.active ? "" : "free"}"><div class="badge">${options.active ? "✦" : "○"}</div>
          <div class="st"><b>${statusTitle}</b><div class="d">${statusDescription}</div></div></div>
        ${subscriptionRows}
      </div></div>
    <div class="set-grp"><div class="set-h">Study</div>
      <div class="set-card">
        <button class="set-row" id="s-predict"><span class="lab"><span>Prediction veil</span><span class="d">Guess a word’s sense before it’s revealed</span></span><span class="rs-sw ${options.predictionEnabled ? "on" : ""}"></span></button>
      </div></div>
    <div class="set-grp"><div class="set-h">Appearance</div>
      <div class="theme-picker" role="radiogroup" aria-label="App theme">${themeOptions}</div></div>
    <div class="set-grp"><div class="set-h">Progress</div>
      <div class="set-card">
        <button class="set-row" id="s-backup"><span class="lab"><span>Get a backup code</span><span class="d">Carry your progress to another device</span></span><span class="chev">›</span></button>
        <button class="set-row" id="s-restorecode"><span class="lab">Restore from a code</span><span class="chev">›</span></button>
      </div></div>
    <div class="set-grp"><div class="set-h">About</div>
      <div class="set-card">
        <button class="set-row" id="s-privacy"><span class="lab">Privacy Policy</span><span class="chev">›</span></button>
        <button class="set-row" id="s-terms"><span class="lab">Terms of Use</span><span class="chev">›</span></button>
        <button class="set-row" id="s-support"><span class="lab">Support &amp; contact</span><span class="chev">›</span></button>
      </div></div>
    <div class="fine">Rootstock · Word Power · v1.0</div>
  </section>`;

  requiredButton(options.app, "#s-home").onclick = options.onHome;
  const upgrade = options.app.querySelector<HTMLButtonElement>("#s-upgrade");
  if (upgrade) upgrade.onclick = options.onUpgrade;
  const manage = options.app.querySelector<HTMLButtonElement>("#s-manage");
  if (manage) manage.onclick = options.onManage;
  requiredButton(options.app, "#s-restore").onclick = options.onRestore;
  requiredButton(options.app, "#s-backup").onclick = options.onBackup;
  requiredButton(options.app, "#s-restorecode").onclick = options.onRestoreCode;
  requiredButton(options.app, "#s-privacy").onclick = options.onPrivacy;
  requiredButton(options.app, "#s-terms").onclick = options.onTerms;
  requiredButton(options.app, "#s-support").onclick = options.onSupport;
  requiredButton(options.app, "#s-predict").onclick = options.onTogglePrediction;
  options.app.querySelectorAll<HTMLButtonElement>("[data-theme]").forEach((button) => {
    button.onclick = () => {
      const theme = button.dataset.theme as Appearance | undefined;
      if (theme && THEMES.some((entry) => entry.id === theme)) options.onTheme(theme);
    };
  });
}
