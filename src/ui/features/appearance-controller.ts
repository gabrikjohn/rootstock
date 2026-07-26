import type { RandomSource, StorageAdapter } from "../../platform/contracts";
import type { Appearance } from "./settings-screen";

const APPEARANCES = new Set<Appearance>([
  "parchment",
  "classic",
  "plain",
  "odyssey",
  "dragon-codex"
]);

export function normalizeAppearance(value: unknown): Appearance {
  if (value === "vintage") return "classic";
  return typeof value === "string" && APPEARANCES.has(value as Appearance)
    ? value as Appearance
    : "parchment";
}

export function currentAppearance(): Appearance {
  return normalizeAppearance(document.documentElement.dataset.rsTheme);
}

export function previewFlag(name: "burnt" | "dev" | "etym"): boolean {
  return document.documentElement.getAttribute(`data-rs-${name}`) === "1";
}

export class AppearanceController {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private reducedMotion: MediaQueryList | null = null;

  constructor(
    private readonly random: RandomSource,
    private readonly storage: StorageAdapter
  ) {}

  apply(value: unknown, persist = false): Appearance {
    const appearance = normalizeAppearance(value);
    const root = document.documentElement;
    root.classList.toggle(
      "parchment",
      appearance === "parchment" || appearance === "dragon-codex"
    );
    root.classList.toggle("classic", appearance === "classic");
    root.classList.toggle("odyssey", appearance === "odyssey");
    root.classList.toggle("dragon-codex", appearance === "dragon-codex");
    root.dataset.rsTheme = appearance;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute(
      "content",
      {
        plain: "#f6f4ef",
        parchment: "#e9d9b0",
        classic: "#e9dfc8",
        odyssey: "#102331",
        "dragon-codex": "#24100f"
      }[appearance]
    );
    if (persist) {
      try {
        this.storage.setItem("rootstock_theme_v1", appearance);
      } catch {
        // Restricted previews may deny storage; the active theme still applies.
      }
    }
    window.dispatchEvent(new CustomEvent("rs-theme-change", { detail: { theme: appearance } }));
    this.syncAmbience();
    return appearance;
  }

  syncAmbience(): void {
    if (document.documentElement.classList.contains("odyssey") && !this.prefersReducedMotion()) {
      this.startAmbience();
    } else {
      this.stopAmbience();
    }
  }

  private prefersReducedMotion(): boolean {
    try {
      this.reducedMotion ??= window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;
      return this.reducedMotion?.matches === true;
    } catch {
      return false;
    }
  }

  private layer(): HTMLDivElement {
    let layer = document.querySelector<HTMLDivElement>("#odyssey-ambience");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "odyssey-ambience";
      layer.className = "odyssey-ambience";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
    }
    return layer;
  }

  private stopAmbience(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    document.querySelector("#odyssey-ambience")?.remove();
  }

  private emitEvent(): void {
    if (!document.documentElement.classList.contains("odyssey") || this.prefersReducedMotion()) {
      return;
    }
    const layer = this.layer();
    if (layer.children.length) return;
    const ship = this.random.next() < 0.62;
    const element = document.createElement("div");
    if (ship) {
      element.className = "ody-ship";
      element.style.setProperty("--ody-y", `${(18 + this.random.next() * 62).toFixed(1)}vh`);
      element.style.setProperty("--ody-dur", `${(25 + this.random.next() * 14).toFixed(1)}s`);
      const direction = this.random.next() < 0.5 ? -1 : 1;
      element.style.setProperty(
        "--ody-drift",
        `${(direction * (8 + this.random.next() * 18)).toFixed(1)}px`
      );
      element.innerHTML = '<span class="ody-sail main"></span><span class="ody-sail jib"></span>';
    } else {
      const side = this.random.next() < 0.5 ? "left" : "right";
      element.className = `ody-monster ${side}`;
      element.style.setProperty("--ody-y", `${(16 + this.random.next() * 68).toFixed(1)}vh`);
      element.style.setProperty("--ody-peek", side === "left" ? "38px" : "-38px");
    }
    element.addEventListener("animationend", () => element.remove(), { once: true });
    layer.appendChild(element);
  }

  private startAmbience(): void {
    if (this.timer || this.prefersReducedMotion()) return;
    this.layer();
    const tick = (): void => {
      this.timer = null;
      if (!document.documentElement.classList.contains("odyssey") || this.prefersReducedMotion()) {
        this.stopAmbience();
        return;
      }
      this.emitEvent();
      this.timer = setTimeout(tick, 20_000 + this.random.next() * 25_000);
    };
    this.timer = setTimeout(tick, 3_500 + this.random.next() * 5_000);
  }
}
