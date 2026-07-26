import type { SubscriptionPlan } from "./entitlement-controller";

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing Rootstock UI element: ${selector}`);
  return element;
}

interface OnboardingOptions {
  app: HTMLElement;
  step: number;
  gateCount: number;
  onNext(step: number): void;
  onDone(): void;
  onPlans(): void;
}

const ONBOARDING_SLIDES = [
  {
    art: "R",
    title: "Words, by their roots.",
    body: "Rootstock teaches English through the Latin and Greek pieces beneath it. Learn a root once, and a dozen words open at a stroke."
  },
  {
    art: "✎",
    title: "A method, not a word list.",
    steps: [
      ["I", "Study the roots", "Meet the handful of pieces a gate is built from."],
      ["II", "Prove them", "Assemble each word’s meaning from its parts."],
      ["III", "Sleep on it", "A gate tempers overnight before its final trial."],
      ["IV", "Seal & review", "Sealed words return on a spaced schedule, so they stay."]
    ]
  },
  {
    art: "✦",
    title: "The first three gates are free.",
    body: ""
  }
] as const;

export function renderOnboarding(options: OnboardingOptions): void {
  const step = Math.max(0, Math.min(options.step, ONBOARDING_SLIDES.length - 1));
  const slide = ONBOARDING_SLIDES[step]!;
  const last = step === ONBOARDING_SLIDES.length - 1;
  const body = last
    ? `Walk Gates I–III at no cost. A subscription opens all ${options.gateCount} gates, the Review Docket at full strength, the Bar, and the Drill Hall.`
    : "body" in slide ? slide.body : "";
  const dots = ONBOARDING_SLIDES.map((_, index) =>
    `<i class="${index === step ? "on" : ""}"></i>`
  ).join("");
  const steps = "steps" in slide
    ? `<div class="ob-steps">${slide.steps.map(([number, title, detail]) =>
      `<div class="ob-step"><span class="n">${number}</span><div><b>${title}</b><div class="d">${detail}</div></div></div>`
    ).join("")}</div>`
    : "";

  options.app.innerHTML = `<section class="ob panel">
    <div class="ob-body">
      <div class="ob-art"><span>${slide.art}</span></div>
      <h2>${slide.title}</h2>
      ${body ? `<p>${body}</p>` : ""}${steps}
    </div>
    <div class="ob-dots">${dots}</div>
    <div class="ob-foot">
      <button class="btn" id="ob-next">${last ? "Begin — open Gate I" : "Continue"}</button>
      ${last
        ? '<button class="restore-link" id="ob-plans">See plans &amp; pricing</button>'
        : '<button class="restore-link" id="ob-skip">Skip intro</button>'}
    </div></section>`;

  required<HTMLButtonElement>(options.app, "#ob-next").onclick = () => {
    if (last) options.onDone();
    else options.onNext(step + 1);
  };
  const skip = options.app.querySelector<HTMLButtonElement>("#ob-skip");
  if (skip) skip.onclick = options.onDone;
  const plans = options.app.querySelector<HTMLButtonElement>("#ob-plans");
  if (plans) plans.onclick = options.onPlans;
}

interface PaywallOptions {
  app: HTMLElement;
  contextLabel: string;
  gateCount: number;
  trialDays: number;
  prices: Record<SubscriptionPlan, string>;
  onBack(): void;
  onPurchase(plan: SubscriptionPlan): void;
  onRestore(): void;
  onTerms(): void;
  onPrivacy(): void;
}

function monthlyEquivalent(yearly: string): string {
  const amount = Number.parseFloat(yearly.replace(/[^0-9.]/g, ""));
  if (!amount) return "";
  const currency = yearly.match(/^[^0-9]+/)?.[0] ?? "$";
  return `${currency}${(amount / 12).toFixed(2)}/mo`;
}

export function renderPaywall(options: PaywallOptions): void {
  let selected: SubscriptionPlan = "annual";
  options.app.innerHTML = `<section class="pw panel">
    <button class="back" id="pw-back">← Not now</button>
    <div class="pw-seal">✦</div>
    <div class="pw-ctx">${options.contextLabel}</div>
    <h2>Open every gate.</h2>
    <ul class="pw-bens">
      <li>All ${options.gateCount} gates — from Personalities to the advanced stock</li>
      <li>The Review Docket at full strength — spaced recall that makes words stay</li>
      <li>The Bar — the fifty-item examination that admits you</li>
      <li>The Drill Hall — endless adaptive drilling, tuned to your caliber</li>
      <li>Every gate added in the future, included</li>
    </ul>
    <div class="pw-plans">
      <button class="pw-plan sel" data-plan="annual">
        <span class="pw-badge">Best value · save 33%</span>
        <span class="pw-radio"></span>
        <span class="pw-pl"><b>Annual</b><span class="sub">${monthlyEquivalent(options.prices.annual)} · billed yearly</span></span>
        <span class="pw-price">${options.prices.annual}<span class="per">per year</span></span>
      </button>
      <button class="pw-plan" data-plan="monthly">
        <span class="pw-radio"></span>
        <span class="pw-pl"><b>Monthly</b><span class="sub">Flexible — cancel anytime</span></span>
        <span class="pw-price">${options.prices.monthly}<span class="per">per month</span></span>
      </button>
    </div>
    <button class="btn pw-cta" id="pw-go">Start ${options.trialDays}-day free trial</button>
    <div class="pw-trial" id="pw-trial"></div>
    <div class="pw-links">
      <button id="pw-restore">Restore purchases</button>
      <button id="pw-terms">Terms of Use</button>
      <button id="pw-privacy">Privacy</button>
    </div>
    <p class="pw-legal">Payment is charged to your Apple ID at confirmation of purchase. The subscription renews automatically unless cancelled at least 24 hours before the end of the current period, and your account is charged for renewal within 24 hours before the period ends. Manage or cancel in your App Store account settings. Any unused portion of a free trial is forfeited when a subscription is purchased.</p>
  </section>`;

  const trial = required<HTMLElement>(options.app, "#pw-trial");
  const select = (plan: SubscriptionPlan): void => {
    selected = plan;
    options.app.querySelectorAll<HTMLButtonElement>(".pw-plan").forEach((button) => {
      button.classList.toggle("sel", button.dataset.plan === plan);
    });
    const price = plan === "annual"
      ? `${options.prices.annual}/year`
      : `${options.prices.monthly}/month`;
    trial.textContent = `${options.trialDays} days free, then ${price}. Cancel anytime.`;
  };

  options.app.querySelectorAll<HTMLButtonElement>(".pw-plan").forEach((button) => {
    button.onclick = () => select(button.dataset.plan === "monthly" ? "monthly" : "annual");
  });
  required<HTMLButtonElement>(options.app, "#pw-go").onclick = () => options.onPurchase(selected);
  required<HTMLButtonElement>(options.app, "#pw-back").onclick = options.onBack;
  required<HTMLButtonElement>(options.app, "#pw-restore").onclick = options.onRestore;
  required<HTMLButtonElement>(options.app, "#pw-terms").onclick = options.onTerms;
  required<HTMLButtonElement>(options.app, "#pw-privacy").onclick = options.onPrivacy;
  select("annual");
}
