import { describe, expect, it } from "vitest";
import { CONFUSABLES, DRILL_POOL, INFER_POOL, LEVELS } from "../src/content";
import { avoidRepeat, requeueMiss, roman, shuffle } from "../src/domain/collections";
import { ContentCatalog } from "../src/domain/catalog";
import { deserializeQuizItem, serializeQuizItem } from "../src/domain/bookmarks";
import {
  confusableMissWeight,
  gateIndexForForm,
  pickConfusables
} from "../src/domain/confusables";
import {
  forgeModes,
  pickForgeModes,
  reangleForgeItem,
  weakWords
} from "../src/domain/forge";
import {
  caliber,
  chooseDrillMode,
  drillFoils,
  literalReading,
  maskEtymology,
  sharedPrefixLength,
  sigmoid,
  updateAbility
} from "../src/domain/drill";
import { isEntitlementActive } from "../src/domain/entitlement";
import { selectLexiconEntries } from "../src/domain/lexicon";
import {
  defaultProgress,
  deserializeProgress,
  normalizeProgress,
  serializeProgress
} from "../src/domain/persistence";
import { canAccessGate, TEMPER_MIN_MS, temperUnlock } from "../src/domain/progression";
import { normalizeRoot, rootForms, rootMatches, splitRootEntry } from "../src/domain/roots";
import {
  DAY_MS,
  DOCKET_SESSION_CAP,
  docketBlocks,
  docketSummary,
  fuzzInterval,
  selectDocketSitting,
  initialReview,
  REVIEW_FUZZ_MIN,
  REVIEW_FUZZ_RANGE,
  REVIEW_INTERVALS,
  scheduleReview
} from "../src/domain/scheduling";
import { buildBarItems, buildTrialOneItems, selectInference } from "../src/domain/sessions";
import { COGNATES, DEPTH, ETYM, ROOT_DEEP } from "../src/content";

const zeroRandom = { next: () => 0 };
const catalog = new ContentCatalog(LEVELS, DRILL_POOL, DEPTH, ROOT_DEEP, ETYM, COGNATES);

describe("progression", () => {
  it("unlocks at the later of next 4 AM and the eight-hour floor", () => {
    const trial = new Date(2026, 6, 23, 21, 30).getTime();
    const unlocked = temperUnlock(trial);
    expect(unlocked).toBeGreaterThanOrEqual(trial + TEMPER_MIN_MS);
    expect(new Date(unlocked).getHours()).toBe(5);
  });

  it("preserves free, entitled, and sealed gate access", () => {
    expect(canAccessGate(2, 3, false, false)).toBe(true);
    expect(canAccessGate(3, 3, false, false)).toBe(false);
    expect(canAccessGate(3, 3, true, false)).toBe(true);
    expect(canAccessGate(3, 3, false, true)).toBe(true);
  });
});

describe("entitlement", () => {
  it("treats native StoreKit status as authoritative", () => {
    expect(isEntitlementActive({ source: "native", active: true }, 100)).toBe(true);
    expect(isEntitlementActive({ source: "native", active: false, expiresAt: 1_000 }, 100)).toBe(false);
  });

  it("expires browser-preview trials using the injected clock", () => {
    expect(isEntitlementActive({ source: "dev", active: true, expiresAt: 101 }, 100)).toBe(true);
    expect(isEntitlementActive({ source: "dev", active: true, expiresAt: 99 }, 100)).toBe(false);
    expect(isEntitlementActive({ source: "dev", active: true, expiresAt: null }, 100)).toBe(true);
  });
});

describe("Leitner scheduling", () => {
  it("advances, caps, and resets review boxes from an injected clock value", () => {
    const now = 1_000;
    const flat = { next: () => 0.5 };
    const rung = (box: number) => now + REVIEW_INTERVALS[box]!;
    expect(initialReview(now, flat)).toEqual({ box: 0, due: rung(0) });
    expect(scheduleReview({ box: 0, due: 0 }, true, now, flat))
      .toEqual({ box: 1, due: rung(1) });
    expect(scheduleReview({ box: 3, due: 0 }, true, now, flat).box).toBe(3);
    expect(scheduleReview({ box: 3, due: 0 }, false, now, flat))
      .toEqual({ box: 0, due: rung(0) });
  });

  it("fuzzes each interval so a gate's cohort fans out instead of clumping", () => {
    const now = 1_000;
    const base = REVIEW_INTERVALS[0]!;
    expect(fuzzInterval(base, { next: () => 0 })).toBe(Math.round(base * REVIEW_FUZZ_MIN));
    expect(fuzzInterval(base, { next: () => 1 }))
      .toBe(Math.round(base * (REVIEW_FUZZ_MIN + REVIEW_FUZZ_RANGE)));

    // Ten words enrolled by one sealed gate at the same instant must not share a due date.
    let step = 0;
    const spread = { next: () => (step++ % 10) / 10 };
    const dues = new Set(
      Array.from({ length: 10 }, () => initialReview(now, spread).due)
    );
    expect(dues.size).toBe(10);

    // The ladder must stay ordered: no fuzzed rung may overtake the one above it.
    REVIEW_INTERVALS.forEach((interval, box) => {
      const next = REVIEW_INTERVALS[box + 1];
      if (next === undefined) return;
      expect(fuzzInterval(interval, { next: () => 1 }))
        .toBeLessThan(fuzzInterval(next, { next: () => 0 }));
    });
  });

  it("serves one capped sitting, most overdue first", () => {
    const now = 100 * DAY_MS;
    // 30 words, staggered: "w0" is the most overdue, "w29" the freshest.
    const review = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [
        `w${index}`,
        { box: 0, due: now - (30 - index) * 1_000 }
      ])
    );

    expect(selectDocketSitting({}, now, zeroRandom)).toEqual([]);

    const sitting = selectDocketSitting(review, now, zeroRandom);
    expect(sitting).toHaveLength(DOCKET_SESSION_CAP);
    // The cap must take the oldest, not an arbitrary slice: the 10 freshest stay behind.
    const held = new Set(sitting);
    for (let index = 0; index < DOCKET_SESSION_CAP; index += 1) {
      expect(held.has(`w${index}`), `w${index} should be served`).toBe(true);
    }
    for (let index = DOCKET_SESSION_CAP; index < 30; index += 1) {
      expect(held.has(`w${index}`), `w${index} should be held back`).toBe(false);
    }

    // Under the cap, everything due is served; nothing not yet due ever is.
    const few = { a: { box: 0, due: now - 1 }, b: { box: 0, due: now - 2 }, later: { box: 0, due: now + 1 } };
    expect(selectDocketSitting(few, now, zeroRandom).sort()).toEqual(["a", "b"]);
  });

  it("summarizes the docket in one pass", () => {
    const now = 100 * DAY_MS;
    const review = {
      old: { box: 0, due: now - 5 * DAY_MS },
      recent: { box: 1, due: now - 1 },
      future: { box: 2, due: now + DAY_MS }
    };
    expect(docketSummary(review, now)).toEqual({ due: 2, oldestDue: now - 5 * DAY_MS });
    expect(docketSummary({}, now)).toEqual({ due: 0, oldestDue: null });
    expect(docketSummary({ future: review.future }, now)).toEqual({ due: 0, oldestDue: null });
  });

  it("bars progression only on a real docket backlog", () => {
    const now = 100 * DAY_MS;
    expect(docketBlocks(0, null, now)).toBe(false);
    expect(docketBlocks(DOCKET_SESSION_CAP, now - DAY_MS, now)).toBe(false);
    expect(docketBlocks(DOCKET_SESSION_CAP + 1, now - DAY_MS, now)).toBe(true);
    expect(docketBlocks(1, now - 7 * DAY_MS, now)).toBe(true);
    expect(docketBlocks(1, now - 6 * DAY_MS, now)).toBe(false);
  });
});

describe("collections", () => {
  it("uses injected randomness", () => {
    const random = { next: () => 0 };
    expect(shuffle([1, 2, 3], random)).toEqual([2, 3, 1]);
  });

  it("avoids an immediate repeat when another item exists", () => {
    const queue = ["same", "same", "other"];
    avoidRepeat(queue, "same", (value) => value);
    expect(queue).toEqual(["other", "same", "same"]);
  });

  it("spaces missed items and penalty repetitions", () => {
    const queue = ["a", "b", "c", "d", "e", "f"];
    requeueMiss(queue, "miss", "penalty");
    expect(Math.abs(queue.indexOf("miss") - queue.indexOf("penalty"))).toBeGreaterThan(1);
  });

  it("formats gate numerals", () => {
    expect(roman(24)).toBe("XXIV");
  });
});

describe("root utilities", () => {
  it("splits compound roots without splitting slash variants", () => {
    expect(splitRootEntry({ root: "aequus + vox", lang: "Latin", gloss: "equal + voice" }))
      .toEqual([
        { root: "aequus", lang: "Latin", gloss: "equal", compoundOf: "aequus + vox" },
        { root: "vox", lang: "Latin", gloss: "voice", compoundOf: "aequus + vox" }
      ]);
    expect(rootForms({ root: "verto / versus" })).toEqual(["verto", "versus"]);
  });

  it("normalizes accents and punctuation for matching", () => {
    expect(normalizeRoot("léger")).toBe("leger");
    expect(rootMatches("versus", { root: "verto / versus" })).toBe(true);
  });
});

describe("adaptive drill", () => {
  it("raises ability after a correct answer and lowers it after a miss", () => {
    expect(updateAbility(0, 0, 0, true).theta).toBeGreaterThan(0);
    expect(updateAbility(0, 0, 0, false).theta).toBeLessThan(0);
    expect(sigmoid(0)).toBe(0.5);
    expect(caliber(0)).toBe(50);
  });

  it("clamps ability to the existing engine bounds", () => {
    expect(updateAbility(3.5, 0, -10, true).theta).toBeLessThanOrEqual(3.5);
    expect(updateAbility(-3.5, 0, 10, false).theta).toBeGreaterThanOrEqual(-3.5);
  });
});

describe("session construction", () => {
  it("requires the enabling gate to be sealed and prefers unseen inference words", () => {
    const candidate = INFER_POOL[0]!;
    const enablingGate = LEVELS[candidate.req]!;
    const progress = { [String(enablingGate.id)]: { sealed: true } };
    const selected = selectInference(
      [candidate],
      LEVELS,
      progress,
      {},
      candidate.req,
      1,
      zeroRandom
    );
    expect(selected).toEqual([candidate]);
    expect(selectInference(
      [candidate],
      LEVELS,
      {},
      {},
      candidate.req,
      1,
      zeroRandom
    )).toEqual([]);
  });

  it("builds the stable Trial I modality mix", () => {
    const gate = LEVELS[0]!;
    const items = buildTrialOneItems(gate, 0, () => ["a", "b", "c", "d"]);
    expect(items.filter((item) => item.m === "REC")).toHaveLength(gate.words.length);
    expect(items.filter((item) => item.m === "REV")).toHaveLength(gate.words.length);
    expect(items.filter((item) => item.m === "VIG")).toHaveLength(gate.words.length);
    expect(items.filter((item) => item.m === "ROOTS")).toHaveLength(gate.quizRoots!.length);
  });

  it("samples the Bar as 35 production, 5 pairs, and 10 inference tasks", () => {
    const words = Array.from({ length: 60 }, (_, index) => ({ gi: 0, wi: index }));
    const pairs = CONFUSABLES.slice(0, 5);
    const inference = INFER_POOL.slice(0, 10);
    const items = buildBarItems(words, pairs, inference, zeroRandom);
    expect(items).toHaveLength(50);
    expect(items.filter((item) => item.m === "PROD" || item.m === "VIGT")).toHaveLength(35);
    expect(items.filter((item) => item.m === "PAIR")).toHaveLength(5);
    expect(items.filter((item) => item.m === "INFER")).toHaveLength(5);
    expect(items.filter((item) => item.m === "COMPOSE")).toHaveLength(5);
  });
});

describe("lexicon selection", () => {
  it("includes sealed gate words and only encountered inference and drill stock", () => {
    const progress = defaultProgress();
    progress.gates[String(LEVELS[0]!.id)] = { sealed: true };
    progress.seenInfer[INFER_POOL[0]!.word] = true;
    progress.drill.seen[DRILL_POOL[0]!.word] = { r: 1, w: 0 };
    const entries = selectLexiconEntries(LEVELS, INFER_POOL, DRILL_POOL, progress);
    expect(entries.filter((entry) => entry.kind === "gate")).toHaveLength(LEVELS[0]!.words.length);
    expect(entries.some((entry) => entry.key === INFER_POOL[0]!.word)).toBe(true);
    expect(entries.some((entry) => entry.key === DRILL_POOL[0]!.word)).toBe(true);
  });
});

describe("runtime content catalog", () => {
  it("finds gate words and authored root families without relying on globals", () => {
    expect(catalog.locateWord("egoist")).toEqual({ gi: 0, wi: 0 });
    const root = LEVELS.flatMap((gate) => gate.quizRoots)
      .find((candidate) => candidate.root === "graphein");
    expect(root).toBeTruthy();
    expect(catalog.rootFamily(root!, 8).map((entry) => entry.word))
      .toEqual(expect.arrayContaining(["graphologist", "orthography"]));
  });

  it("uses typed depth and etymology fallbacks", () => {
    const word = LEVELS[0]!.words[0]!;
    const depth = DEPTH as Readonly<Record<string, { v: string; e: string }>>;
    expect(catalog.vignette(word)).toBe(depth[word.word]?.v ?? "");
    expect(catalog.wordEtymology(word)).toBe(depth[word.word]?.e ?? word.ety ?? "");
  });
});

describe("confusable scheduling", () => {
  it("maps inflected forms to the longest taught headword", () => {
    expect(gateIndexForForm(LEVELS, "vacillated")).toBe(
      LEVELS.findIndex((gate) => gate.words.some((word) => word.word === "vacillate"))
    );
  });

  it("weights misses and resets a completed fresh cycle", () => {
    const pair = CONFUSABLES.find((candidate) =>
      gateIndexForForm(LEVELS, candidate.a) >= 0
      && gateIndexForForm(LEVELS, candidate.b) >= 0
    )!;
    const firstGate = gateIndexForForm(LEVELS, pair.a);
    const firstWord = LEVELS[firstGate]!.words.findIndex((word) =>
      pair.a.toLowerCase().startsWith(word.word.toLowerCase().replace(/e$/, ""))
    );
    expect(confusableMissWeight(pair, LEVELS, {
      [`${firstGate}-${firstWord}`]: { r: 0, w: 3 }
    })).toBeGreaterThanOrEqual(3);

    const seen = Object.fromEntries(CONFUSABLES.map((_, index) => [String(index), true]));
    let reset = false;
    expect(pickConfusables({
      pairs: CONFUSABLES,
      gates: LEVELS,
      ledger: {},
      seen,
      maxGateIndex: LEVELS.length - 1,
      count: 1,
      random: zeroRandom,
      onCycleReset: () => {
        reset = true;
      }
    })).toHaveLength(1);
    expect(reset).toBe(true);
  });
});

describe("same-sitting bookmark compatibility", () => {
  it("round-trips intentional item identity without retaining generated options", () => {
    const root = LEVELS[0]!.quizRoots[0]!;
    const serialized = serializeQuizItem(
      { m: "ROOTS", root, opts: ["one", "two", "three", "four"] },
      CONFUSABLES
    );
    expect(serialized).toEqual({ m: "ROOTS", rr: root.root });
    expect(deserializeQuizItem({
      value: serialized,
      gateIndex: 0,
      gates: LEVELS,
      confusables: CONFUSABLES,
      inference: INFER_POOL,
      rootOptions: () => ["one", "two", "three", "four"]
    })).toMatchObject({ m: "ROOTS", root, opts: ["one", "two", "three", "four"] });
  });

  it("reads the historical BLANK mode and rejects incomplete old root marks", () => {
    expect(deserializeQuizItem({
      value: { m: "BLANK", gi: 0, wi: 0 },
      gateIndex: 0,
      gates: LEVELS,
      confusables: CONFUSABLES,
      inference: INFER_POOL,
      rootOptions: () => []
    })).toMatchObject({ m: "VIG", gi: 0, wi: 0 });
    expect(deserializeQuizItem({
      value: { m: "ROOTT" },
      gateIndex: 0,
      gates: LEVELS,
      confusables: CONFUSABLES,
      inference: INFER_POOL,
      rootOptions: () => []
    })).toBeNull();
  });
});

describe("Forge selection", () => {
  it("offers supported angles and reangles a missed item", () => {
    const word = LEVELS[0]!.words[0]!;
    const modes = forgeModes(word, true);
    expect(modes).toEqual(expect.arrayContaining(["REC", "REV", "PROD", "VIG", "VIGT", "CLOZE", "COMPOSE", "LITT"]));
    expect(pickForgeModes(word, true, 2, zeroRandom)).toHaveLength(2);
    expect(reangleForgeItem({ m: "REC", gi: 0, wi: 0 }, word, true, zeroRandom).m)
      .not.toBe("REC");
  });

  it("keeps a weak word until rights exceed three per miss", () => {
    const entry = { w: LEVELS[0]!.words[0]!, gi: 0, wi: 0 };
    expect(weakWords([entry], { "0-0": { r: 3, w: 1 } })).toEqual([entry]);
    expect(weakWords([entry], { "0-0": { r: 4, w: 1 } })).toEqual([]);
  });
});

describe("adaptive drill helpers", () => {
  it("rotates supported modalities and retires the immediately previous angle", () => {
    const word = DRILL_POOL[0]!;
    expect(chooseDrillMode(word, undefined, zeroRandom)).toBe("REC");
    const next = chooseDrillMode(word, { r: 1, w: 0, m: ["DSENT"] }, zeroRandom);
    expect(next).not.toBe("DSENT");
  });

  it("builds literal readings, masks etymology, and selects distinct foils", () => {
    const word = DRILL_POOL[0]!;
    expect(literalReading(word)).toContain("“");
    expect(maskEtymology(`${word.word} came from older stock`, word.word))
      .not.toContain(word.word);
    expect(sharedPrefixLength("vacillate", "vacillation")).toBeGreaterThan(4);
    const foils = drillFoils(word, 3, DRILL_POOL, zeroRandom);
    expect(foils).toHaveLength(3);
    expect(new Set(foils).size).toBe(3);
    expect(foils).not.toContain(word.word);
  });
});

describe("progress compatibility", () => {
  it("round-trips the v2 backup-code format", () => {
    const progress = defaultProgress();
    progress.gates["1"] = { t1: 123, sealed: true };
    progress.drill.theta = 0.75;
    const restored = deserializeProgress(serializeProgress(progress));
    expect(restored?.gates["1"]).toEqual({ t1: 123, sealed: true });
    expect(restored?.drill.theta).toBe(0.75);
  });

  it("accepts raw JSON and supplies historical defaults", () => {
    const restored = deserializeProgress(JSON.stringify({ v: 2, gates: { 1: { sealed: true } } }));
    expect(restored?.predict).toBe(true);
    expect(restored?.drill.roots).toEqual({});
    expect(normalizeProgress(null)).toEqual(defaultProgress());
  });
});
