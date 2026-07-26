import type { ProgressV2 } from "../types/state";

export const PROGRESS_KEY = "rootstock_v2";
export const PROGRESS_BACKUP_KEY = "rootstock_v2_bak";
export const THEME_KEY = "rootstock_theme_v1";

export function defaultProgress(): ProgressV2 {
  return {
    gates: {},
    bar: { passed: false, lockedUntil: 0 },
    review: {},
    prompted: {},
    seenInfer: {},
    seenPair: {},
    predict: true,
    appearance: "parchment",
    ledger: {},
    mark: null,
    drill: { theta: 0, n: 0, seen: {}, roots: {} }
  };
}

export function normalizeProgress(input: unknown): ProgressV2 {
  const fallback = defaultProgress();
  if (!input || typeof input !== "object") return fallback;
  const value = input as Partial<ProgressV2>;
  return {
    ...fallback,
    ...value,
    gates: value.gates ?? {},
    bar: value.bar ?? fallback.bar,
    review: value.review ?? {},
    prompted: value.prompted ?? {},
    seenInfer: value.seenInfer ?? {},
    seenPair: value.seenPair ?? {},
    predict: value.predict !== false,
    appearance: value.appearance || "parchment",
    ledger: value.ledger ?? {},
    mark: value.mark ?? null,
    drill: {
      theta: value.drill?.theta ?? 0,
      n: value.drill?.n ?? 0,
      seen: value.drill?.seen ?? {},
      roots: value.drill?.roots ?? {}
    }
  };
}

function utf8ToBase64(value: string): string {
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(value)));
  }
  return Buffer.from(value, "utf8").toString("base64");
}

function base64ToUtf8(value: string): string {
  if (typeof atob === "function") {
    return decodeURIComponent(escape(atob(value)));
  }
  return Buffer.from(value, "base64").toString("utf8");
}

export function serializeProgress(progress: ProgressV2): string {
  const payload = {
    v: 2,
    gates: progress.gates,
    bar: progress.bar,
    review: progress.review,
    prompted: progress.prompted,
    seenInfer: progress.seenInfer,
    predict: progress.predict,
    ledger: progress.ledger,
    drill: progress.drill
  };
  const json = JSON.stringify(payload);
  try {
    return utf8ToBase64(json);
  } catch {
    return json;
  }
}

export function deserializeProgress(value: string): ProgressV2 | null {
  const input = value.trim();
  if (!input) return null;
  let json = input;
  try {
    json = base64ToUtf8(input);
  } catch {
    // Raw JSON backup codes remain supported.
  }
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || !("gates" in parsed)) return null;
    return normalizeProgress(parsed);
  } catch {
    return null;
  }
}
