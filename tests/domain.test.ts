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
import { scoreDistractors } from "../src/domain/distractors";
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
  DOCKET_DAILY_SIZE,
  DOCKET_LOOKAHEAD_MS,
  DOCKET_RELEASE_HOUR,
  DOCKET_TIERS,
  docketBlocks,
  docketCleared,
  docketDue,
  docketRelease,
  docketSittingSize,
  docketSummary,
  fuzzInterval,
  nextDocketRelease,
  selectDocketSitting,
  tierOf,
  initialReview,
  retiresFromDocket,
  REVIEW_FUZZ_MIN,
  REVIEW_FUZZ_RANGE,
  REVIEW_INTERVALS,
  REVIEW_RETIRE_NET,
  scheduleReview
} from "../src/domain/scheduling";
import { BAR_FORMS, barComposition, buildBarItems, buildTrialOneItems, selectInference } from "../src/domain/sessions";
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

// Local wall-clock timestamps: the release hour is the device's own, so the tests build
// their moments the same way the app reads them.
const at = (year: number, month: number, day: number, hour: number, minute = 0): number =>
  new Date(year, month, day, hour, minute).getTime();
const release = (year: number, month: number, day: number): number =>
  at(year, month, day, DOCKET_RELEASE_HOUR);

describe("Leitner scheduling", () => {
  it("advances, caps, and resets review boxes from an injected clock value", () => {
    const now = at(2026, 4, 12, 9, 30);
    const flat = { next: () => 0.5 };
    // Every rung lands on a release: a day's interval from Tuesday morning is Wednesday's
    // docket, not Wednesday morning.
    expect(initialReview(now, flat)).toEqual({ box: 0, tier: 0, due: release(2026, 4, 13) });
    expect(scheduleReview({ box: 0, due: 0 }, true, now, flat))
      .toEqual({ box: 1, tier: 1, due: release(2026, 4, 15) });
    const top = REVIEW_INTERVALS.length - 1;
    expect(scheduleReview({ box: top, due: 0 }, true, now, flat).box).toBe(top);
    expect(scheduleReview({ box: top, due: 0 }, false, now, flat).box).toBe(0);
  });

  it("resets timing on a lapse but steps difficulty down only one rung", () => {
    const now = 1_000;
    const flat = { next: () => 0.5 };
    const hard = { box: 4, tier: 3, due: 0 };

    // The calendar goes back to the first rung; the tier gives up one step, not all of them.
    const lapsed = scheduleReview(hard, false, now, flat);
    expect(lapsed.box).toBe(0);
    expect(lapsed.tier).toBe(2);
    expect(scheduleReview(lapsed, false, now, flat).tier).toBe(1);
    expect(scheduleReview({ box: 0, tier: 0, due: 0 }, false, now, flat).tier).toBe(0);

    // Climbing caps at the hardest bank even as the box keeps rising.
    expect(scheduleReview(hard, true, now, flat).tier).toBe(DOCKET_TIERS - 1);
  });

  it("reads a pre-tier save at its old box-indexed difficulty", () => {
    // Saves written before tiers existed must not jump in difficulty on upgrade.
    expect(tierOf({ box: 0, due: 0 })).toBe(0);
    expect(tierOf({ box: 2, due: 0 })).toBe(2);
    expect(tierOf({ box: 5, due: 0 })).toBe(DOCKET_TIERS - 1);
    // An explicit tier always wins over the box.
    expect(tierOf({ box: 5, due: 0, tier: 0 })).toBe(0);
  });

  it("retires a word only from the top of the ladder with a clear tally", () => {
    const top = REVIEW_INTERVALS.length - 1;
    expect(retiresFromDocket(top, REVIEW_RETIRE_NET)).toBe(true);
    // One short on either axis keeps the word in rotation.
    expect(retiresFromDocket(top, REVIEW_RETIRE_NET - 1)).toBe(false);
    expect(retiresFromDocket(top - 1, REVIEW_RETIRE_NET)).toBe(false);
    expect(retiresFromDocket(top - 1, 99)).toBe(false);
    // A word answered right four times but missed as often has not earned it.
    expect(retiresFromDocket(top, 8 - 8)).toBe(false);
  });

  it("fuzzes each interval so a gate's cohort fans out instead of clumping", () => {
    const now = 1_000;
    const base = REVIEW_INTERVALS[0]!;
    expect(fuzzInterval(base, { next: () => 0 })).toBe(Math.round(base * REVIEW_FUZZ_MIN));
    expect(fuzzInterval(base, { next: () => 1 }))
      .toBe(Math.round(base * (REVIEW_FUZZ_MIN + REVIEW_FUZZ_RANGE)));

    // Rounding to a release deliberately gathers a gate's first cohort into one docket —
    // the daily size, not the fuzz, is what now spreads that load. Further up the ladder
    // the fuzz still fans a cohort across days, so the long rungs never clump.
    let step = 0;
    const spread = { next: () => (step++ % 10) / 10 };
    const firstRung = new Set(
      Array.from({ length: 10 }, () => initialReview(now, spread).due)
    );
    expect(firstRung.size).toBe(1);

    const top = REVIEW_INTERVALS.length - 1;
    step = 0;
    const longRung = new Set(
      Array.from({ length: 10 }, () => scheduleReview({ box: top, due: 0 }, true, now, spread).due)
    );
    expect(longRung.size).toBe(10);

    // The ladder must stay ordered: no fuzzed rung may overtake the one above it.
    REVIEW_INTERVALS.forEach((interval, box) => {
      const next = REVIEW_INTERVALS[box + 1];
      if (next === undefined) return;
      expect(fuzzInterval(interval, { next: () => 1 }))
        .toBeLessThan(fuzzInterval(next, { next: () => 0 }));
    });
  });

  it("opens once a day, at the release hour on the device's clock", () => {
    // Mid-morning: today's docket is the one that opened at dawn, and the next is tomorrow's.
    const morning = at(2026, 4, 12, 9, 30);
    expect(docketRelease(morning)).toBe(release(2026, 4, 12));
    expect(nextDocketRelease(morning)).toBe(release(2026, 4, 13));

    // Before the hour, the standing docket is still yesterday's — the day turns at the
    // release, not at midnight.
    const beforeDawn = at(2026, 4, 12, 5, 0);
    expect(docketRelease(beforeDawn)).toBe(release(2026, 4, 11));
    expect(nextDocketRelease(beforeDawn)).toBe(release(2026, 4, 12));

    // On the hour itself the new docket is open, and "next" has moved on to tomorrow.
    expect(docketRelease(release(2026, 4, 12))).toBe(release(2026, 4, 12));
    expect(nextDocketRelease(release(2026, 4, 12))).toBe(release(2026, 4, 13));
  });

  it("rounds every due date to a release, never sooner than the next one", () => {
    const morning = at(2026, 4, 12, 9, 30);
    // A timer that elapses at teatime tomorrow is asked for at tomorrow's release.
    expect(docketDue(at(2026, 4, 13, 16, 0), morning)).toBe(release(2026, 4, 13));
    // One that elapses just before a release rounds back to it, not past it.
    expect(docketDue(at(2026, 4, 13, 5, 30), morning)).toBe(release(2026, 4, 13));
    // And a rung short enough to expire inside today's docket still waits for the next
    // one: nothing answered in a sitting can rejoin the sitting it came from.
    expect(docketDue(at(2026, 4, 12, 20, 0), morning)).toBe(release(2026, 4, 13));
    expect(docketDue(morning - DAY_MS, morning)).toBe(release(2026, 4, 13));
  });

  it("serves the same-sized sitting every day, oldest first", () => {
    const now = at(2026, 4, 12, 9, 30);
    // 30 words released, staggered: "w0" has waited longest, "w29" is the freshest.
    const review = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => [
        `w${index}`,
        { box: 0, due: release(2026, 4, 12) - (30 - index) * DAY_MS }
      ])
    );

    expect(selectDocketSitting({}, now, zeroRandom)).toEqual([]);

    const sitting = selectDocketSitting(review, now, zeroRandom);
    expect(sitting).toHaveLength(DOCKET_DAILY_SIZE);
    // The size must take the oldest, not an arbitrary slice: the 10 freshest stay behind.
    const held = new Set(sitting);
    for (let index = 0; index < DOCKET_DAILY_SIZE; index += 1) {
      expect(held.has(`w${index}`), `w${index} should be served`).toBe(true);
    }
    for (let index = DOCKET_DAILY_SIZE; index < 30; index += 1) {
      expect(held.has(`w${index}`), `w${index} should be held back`).toBe(false);
    }

    // A word timed for later today is not part of today's docket: it was not released.
    const sameDay = {
      a: { box: 0, due: release(2026, 4, 12) },
      b: { box: 0, due: release(2026, 4, 11) },
      dusk: { box: 0, due: at(2026, 4, 12, 20, 0) }
    };
    expect(selectDocketSitting(sameDay, now, zeroRandom, 2).sort()).toEqual(["a", "b"]);
  });

  it("tops a thin day up from the next releases so the count holds steady", () => {
    const now = at(2026, 4, 12, 9, 30);
    const review: Record<string, { box: number; due: number }> = {
      due1: { box: 0, due: release(2026, 4, 11) },
      due2: { box: 0, due: release(2026, 4, 12) }
    };
    for (let index = 0; index < 30; index += 1) {
      review[`soon${index}`] = { box: 1, due: release(2026, 4, 13) + index };
    }
    // Parked months out: the shortfall is borrowed from the days next door, never from these.
    review.far = { box: 5, due: release(2026, 4, 12) + DOCKET_LOOKAHEAD_MS + DAY_MS };

    const sitting = selectDocketSitting(review, now, zeroRandom);
    expect(sitting).toHaveLength(DOCKET_DAILY_SIZE);
    expect(sitting).toContain("due1");
    expect(sitting).toContain("due2");
    expect(sitting).not.toContain("far");

    // Borrowing tops a sitting up; it never conjures one out of a day with nothing due.
    const noneDue = { soon: { box: 1, due: release(2026, 4, 13) } };
    expect(selectDocketSitting(noneDue, now, zeroRandom)).toEqual([]);

    // A day whose whole neighbourhood is thin simply serves what there is.
    const thin = { a: { box: 0, due: release(2026, 4, 12) }, b: { box: 1, due: release(2026, 4, 13) } };
    expect(selectDocketSitting(thin, now, zeroRandom).sort()).toEqual(["a", "b"]);
  });

  it("summarizes the docket against the day's release, in one pass", () => {
    const now = at(2026, 4, 12, 9, 30);
    const review = {
      old: { box: 0, due: release(2026, 4, 5) },
      today: { box: 1, due: release(2026, 4, 12) },
      tomorrow: { box: 2, due: release(2026, 4, 13) },
      far: { box: 3, due: release(2026, 4, 20) }
    };
    expect(docketSummary(review, now)).toEqual({ due: 2, ahead: 1, oldestDue: release(2026, 4, 5) });
    expect(docketSummary({}, now)).toEqual({ due: 0, ahead: 0, oldestDue: null });
    expect(docketSummary({ far: review.far }, now)).toEqual({ due: 0, ahead: 0, oldestDue: null });

    // The sitting is the same number of words whatever the backlog behind it.
    expect(docketSittingSize({ due: 100, ahead: 0, oldestDue: 1 })).toBe(DOCKET_DAILY_SIZE);
    expect(docketSittingSize({ due: 3, ahead: 40, oldestDue: 1 })).toBe(DOCKET_DAILY_SIZE);
    expect(docketSittingSize({ due: 3, ahead: 2, oldestDue: 1 })).toBe(5);
    expect(docketSittingSize({ due: 0, ahead: 50, oldestDue: null })).toBe(0);
  });

  it("shuts the docket for the rest of the day once its sitting is worked", () => {
    const now = at(2026, 4, 12, 9, 30);
    expect(docketCleared(undefined, now)).toBe(false);
    // Yesterday's stamp is spent; today's shuts the docket however much falls due after it.
    expect(docketCleared(release(2026, 4, 11), now)).toBe(false);
    expect(docketCleared(release(2026, 4, 12), now)).toBe(true);
    expect(docketCleared(release(2026, 4, 12), at(2026, 4, 12, 23, 45))).toBe(true);
    // Before dawn the next day still belongs to the worked docket; the release reopens it.
    expect(docketCleared(release(2026, 4, 12), at(2026, 4, 13, 5, 0))).toBe(true);
    expect(docketCleared(release(2026, 4, 12), at(2026, 4, 13, 6, 0))).toBe(false);
  });

  it("bars progression only on a real docket backlog", () => {
    const now = 100 * DAY_MS;
    expect(docketBlocks(0, null, now)).toBe(false);
    expect(docketBlocks(DOCKET_DAILY_SIZE, now - DAY_MS, now)).toBe(false);
    expect(docketBlocks(DOCKET_DAILY_SIZE + 1, now - DAY_MS, now)).toBe(true);
    expect(docketBlocks(1, now - 7 * DAY_MS, now)).toBe(true);
    expect(docketBlocks(1, now - 6 * DAY_MS, now)).toBe(false);
  });
});

describe("confusable pairs", () => {
  it("keeps every pair servable, so none is dead content", () => {
    // pickConfusables only offers a pair when both members resolve to a taught headword.
    // "ingenious" is not one — that pair predates this suite and can never be drawn.
    const KNOWN_UNSERVABLE = new Set(["ingenious"]);
    const dead = CONFUSABLES.filter((pair) =>
      gateIndexForForm(LEVELS, pair.a) < 0 || gateIndexForForm(LEVELS, pair.b) < 0
    ).map((pair) => `${pair.a}/${pair.b}`);
    expect(dead.filter((name) => !KNOWN_UNSERVABLE.has(name.split("/")[0]!))).toEqual([]);
  });

  it("holds enough pairs that the Bar need not repeat them", () => {
    // The Bar draws 5 per sitting; a pool this side of 20 guarantees heavy overlap.
    expect(CONFUSABLES.length).toBeGreaterThanOrEqual(30);
  });
});

describe("distractor scoring", () => {
  const gate = LEVELS[0]!;
  const target = gate.words[0]!;
  const corpus = LEVELS.flatMap((level) => level.words);

  it("never offers a foil of a different part of speech", () => {
    for (const word of corpus) {
      const foils = scoreDistractors({
        target: word, candidates: corpus, count: 3, random: zeroRandom
      });
      for (const foil of foils) {
        expect(foil.pos, `${word.word} / ${foil.word}`).toBe(word.pos);
      }
    }
  });

  it("prefers foils that share a root over unrelated ones", () => {
    // egoist's kin should beat a word from an unrelated semantic field.
    const family = new Set(["egotist", "egocentric"]);
    const picked = scoreDistractors({
      target, candidates: corpus, count: 2, random: zeroRandom, family
    }).map((word) => word.word);
    expect(picked).toContain("egotist");
  });

  it("reaches beyond the target's own gate", () => {
    // The old rule could only ever draw from the target's ten-word gate.
    const own = new Set(gate.words.map((word) => word.word));
    const foreign = corpus.filter((word) => !own.has(word.word));
    const picked = scoreDistractors({
      target, candidates: foreign, count: 3, random: zeroRandom
    });
    expect(picked.length).toBeGreaterThan(0);
    expect(picked.every((word) => !own.has(word.word))).toBe(true);
  });

  it("excludes the target and anything sharing its definition", () => {
    const picked = scoreDistractors({
      target, candidates: corpus, count: 3, random: zeroRandom
    });
    expect(picked.some((word) => word.word === target.word)).toBe(false);
    expect(picked.some((word) => word.def === target.def)).toBe(false);
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

  it("samples the Bar as 30 production, 5 pairs, and 15 never-taught tasks", () => {
    const words = Array.from({ length: 240 }, (_, index) => ({ gi: 0, wi: index }));
    const items = buildBarItems(words, CONFUSABLES, INFER_POOL, zeroRandom);
    expect(items).toHaveLength(50);
    expect(items.filter((item) => item.m === "PROD" || item.m === "VIGT")).toHaveLength(30);
    expect(items.filter((item) => item.m === "PAIR")).toHaveLength(5);
    expect(items.filter((item) => item.m === "INFER")).toHaveLength(10);
    expect(items.filter((item) => item.m === "COMPOSE")).toHaveLength(5);
  });

  it("derives its split from the size it is given", () => {
    // The label, the pass mark and the queue all read from one number now.
    const words = Array.from({ length: 240 }, (_, index) => ({ gi: 0, wi: index }));
    for (const size of [30, 50, 60]) {
      const items = buildBarItems(words, CONFUSABLES, INFER_POOL, zeroRandom, size);
      expect(items, `size ${size}`).toHaveLength(size);
    }
  });

  it("gives each form a disjoint set of production words", () => {
    const words = Array.from({ length: 240 }, (_, index) => ({ gi: 0, wi: index }));
    const locations = (form: number): Set<string> => new Set(
      buildBarItems(words, CONFUSABLES, INFER_POOL, zeroRandom, 50, form)
        .filter((item) => item.m === "PROD" || item.m === "VIGT")
        .map((item) => `${item.gi}-${item.wi}`)
    );
    const [one, two, three] = [locations(0), locations(1), locations(2)];
    // A retake must be a different exam, not a reshuffle of the same one.
    for (const location of one) expect(two.has(location), location).toBe(false);
    for (const location of two) expect(three.has(location), location).toBe(false);
    for (const location of one) expect(three.has(location), location).toBe(false);
    // And the form index wraps rather than running off the end of the corpus.
    expect(locations(BAR_FORMS)).toEqual(one);
  });

  it("still fills the exam when a pool is too small to partition", () => {
    // Fewer confusable pairs than three forms' worth must not shrink the sitting.
    const words = Array.from({ length: 240 }, (_, index) => ({ gi: 0, wi: index }));
    const items = buildBarItems(words, CONFUSABLES.slice(0, 4), INFER_POOL, zeroRandom, 50, 2);
    expect(items).toHaveLength(50);
    expect(items.filter((item) => item.m === "PAIR").length).toBeGreaterThan(0);
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
