export interface HomeSession {
  kicker: string;
  title: string;
  meta: string;
  progressPercent: number;
  onOpen?: (() => void) | undefined;
}

export type HomeCardStatus =
  | { kind: "stamp" }
  | { kind: "label"; text: string; detail?: string | undefined; className?: string | undefined };

export interface HomeGateCard {
  index: number;
  roman: string;
  title: string;
  theme: string;
  sealed: boolean;
  current: boolean;
  enabled: boolean;
  status: HomeCardStatus;
}

export interface HomeBarCard {
  enabled: boolean;
  passScore: number;
  status: HomeCardStatus;
}

export interface HomeDocketCard {
  /** Words in today's sitting — the same number every day, and zero once it is worked. */
  count: number;
  /** Today's sitting is behind us; show the card spent rather than dropping it. */
  cleared: boolean;
  /** The hour the next sitting opens, already written out ("6 am"). */
  opensAt: string;
}

export interface HomeDrillStat {
  enabled: boolean;
  visible: boolean;
  label: string;
}

interface HomeScreenOptions {
  app: HTMLElement;
  greeting: string;
  summary: string;
  streak: number;
  lexiconCount: number;
  drill: HomeDrillStat;
  session: HomeSession;
  sealedCount: number;
  gateCount: number;
  docket: HomeDocketCard;
  forgeCount: number;
  gates: readonly HomeGateCard[];
  bar: HomeBarCard;
  sealedOpen: boolean;
  onSealedOpenChange(open: boolean): void;
  onGate(index: number): void;
  onDocket(): void;
  onBar(): void;
  onSettings(): void;
  onLexicon(): void;
  onForge(): void;
  onDrill(): void;
}

export function renderHome(options: HomeScreenOptions): void {
  const sealedGates = options.gates.filter((gate) => gate.sealed);
  const openGates = options.gates.filter((gate) => !gate.sealed);
  let cards = "";
  if (sealedGates.length) {
    cards += `<div class="sealed-group">
      <button class="lvl-card sealed sealed-toggle${options.sealedOpen ? " open" : ""}" id="sealed-toggle" aria-expanded="${options.sealedOpen}">
        <div class="lvl-num">✦</div>
        <div class="lvl-body"><h3>Sealed gates</h3></div>
        <span class="lvl-seal done">${sealedGates.length} sealed <span class="chev">▸</span></span></button>
      <div class="sealed-list" id="sealed-list"${options.sealedOpen ? "" : " hidden"}>${sealedGates.map(renderGateCard).join("")}</div>
    </div>`;
  }
  cards += openGates.map(renderGateCard).join("");
  cards += `<button class="lvl-card bar-card" ${options.bar.enabled ? "" : "disabled"} id="bar-btn">
    <div class="lvl-num" style="color:var(--gild)">☙</div>
    <div class="lvl-body"><h3>The Bar</h3><p>Fifty items: thirty produced from memory, five confusable pairs, and fifteen words you have never seen — read from their roots alone. ${options.bar.passScore} to pass; fail and a different form opens after eight hours.</p></div>${renderStatus(options.bar.status)}</button>`;
  const docketHtml = options.docket.count > 0
    ? `<button class="lvl-card" style="border-left-color:var(--ox-bright);padding:10px 16px" id="docket-btn">
      <div class="lvl-num" style="color:var(--ox-bright);font-size:18px;min-width:42px">⚖</div>
      <div class="lvl-body"><h3 style="font-size:16px">The Review Docket</h3></div>
      <span class="lvl-seal" style="color:var(--ox)">${options.docket.count} to review</span></button>`
    : options.docket.cleared
    ? `<button class="lvl-card" style="border-left-color:var(--ox-bright);padding:10px 16px" disabled id="docket-done">
      <div class="lvl-num" style="color:var(--ox-bright);font-size:18px;min-width:42px">⚖</div>
      <div class="lvl-body"><h3 style="font-size:16px">The Review Docket</h3>
      <p>Next sitting at ${options.docket.opensAt}</p></div>
      <span class="lvl-seal done">Cleared ✦</span></button>`
    : "";
  const forgeHtml = options.forgeCount > 0
    ? `<button class="lvl-card" id="forge-btn">
      <div class="lvl-num">⚒</div>
      <div class="lvl-body"><h3>The Forge</h3>
      <p>${options.forgeCount} ${options.forgeCount === 1 ? "word wants" : "words want"} reworking</p></div>
      <span class="lvl-seal" style="color:var(--ox)">Open</span></button>`
    : "";
  const drillHtml = `<button class="stat" id="drill-btn" ${options.drill.enabled ? "" : "disabled"} style="font-family:var(--ui);cursor:${options.drill.enabled ? "pointer" : "default"};${options.drill.visible ? "" : "opacity:.55;"}">
    <div class="stat-n" style="color:var(--gild)">⌖</div><div class="stat-l">${options.drill.label}</div></button>`;
  options.app.innerHTML = `<section class="dash">
    <div class="dash-greet"><div class="dash-hello">${options.greeting}.</div>
      <div class="dash-sub">${options.summary}</div></div>
    <button class="session" id="cta" ${options.session.onOpen ? "" : "disabled"}>
      <div class="session-top"><span class="session-kicker">${options.session.kicker}</span><span class="session-arrow">→</span></div>
      <div class="session-title">${options.session.title}</div>
      <div class="session-meta">${options.session.meta}</div>
      <div class="session-bar"><i style="width:${options.session.progressPercent}%"></i></div>
    </button>
    <div class="stats">
      <div class="stat"><div class="stat-n">${options.streak}</div><div class="stat-l">Day streak</div></div>
      <button class="stat" id="lex-stat"${options.lexiconCount ? "" : " disabled"} style="font-family:var(--ui);cursor:${options.lexiconCount ? "pointer" : "default"}"><div class="stat-n">${options.lexiconCount}</div><div class="stat-l">Lexicon</div></button>
      ${drillHtml}
    </div></section>
    <section class="index">
      <div class="index-head"><span>The Gates</span><span>${options.sealedCount} / ${options.gateCount} sealed</span></div>
      ${docketHtml}${forgeHtml}${cards}
      <button class="restore-link" id="settings-link">⚙ Settings &amp; subscription</button>
    </section>`;

  options.app.querySelectorAll<HTMLButtonElement>(".lvl-card[data-lvl]:not(:disabled)")
    .forEach((button) => {
      button.onclick = () => {
        const index = Number(button.dataset.lvl);
        if (Number.isInteger(index)) options.onGate(index);
      };
    });

  const sealedToggle = options.app.querySelector<HTMLButtonElement>("#sealed-toggle");
  const sealedList = options.app.querySelector<HTMLElement>("#sealed-list");
  if (sealedToggle && sealedList) {
    sealedToggle.onclick = () => {
      const open = sealedList.hasAttribute("hidden");
      if (open) sealedList.removeAttribute("hidden");
      else sealedList.setAttribute("hidden", "");
      sealedToggle.classList.toggle("open", open);
      sealedToggle.setAttribute("aria-expanded", String(open));
      options.onSealedOpenChange(open);
    };
  }

  const docket = options.app.querySelector<HTMLButtonElement>("#docket-btn");
  if (docket && !docket.disabled) docket.onclick = options.onDocket;
  const bar = options.app.querySelector<HTMLButtonElement>("#bar-btn");
  if (bar && !bar.disabled) bar.onclick = options.onBar;
  const forge = options.app.querySelector<HTMLButtonElement>("#forge-btn");
  if (forge) forge.onclick = options.onForge;
  const drill = options.app.querySelector<HTMLButtonElement>("#drill-btn");
  if (drill && !drill.disabled) drill.onclick = options.onDrill;
  const lexicon = options.app.querySelector<HTMLButtonElement>("#lex-stat");
  if (lexicon && options.lexiconCount) lexicon.onclick = options.onLexicon;
  const settings = options.app.querySelector<HTMLButtonElement>("#settings-link");
  if (!settings) throw new Error("Rootstock home settings control did not render");
  settings.onclick = options.onSettings;
  const session = options.app.querySelector<HTMLButtonElement>("#cta");
  if (session && options.session.onOpen) session.onclick = options.session.onOpen;
}

function renderGateCard(gate: HomeGateCard): string {
  return `<button class="lvl-card${gate.sealed ? " sealed" : ""}${gate.current ? " current" : ""}" ${gate.enabled ? "" : "disabled"} data-lvl="${gate.index}">
    <div class="lvl-num">${gate.roman}</div>
    <div class="lvl-body"><h3>${gate.title}</h3><p>${gate.theme}</p></div>${renderStatus(gate.status)}</button>`;
}

function renderStatus(status: HomeCardStatus): string {
  if (status.kind === "stamp") return '<span class="stamp">Sealed</span>';
  const detail = status.detail ? `<br>${status.detail}` : "";
  return `<span class="lvl-seal${status.className ? ` ${status.className}` : ""}">${status.text}${detail}</span>`;
}
