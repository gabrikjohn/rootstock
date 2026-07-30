import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { LEVELS } from "../../src/content";
import { AUDIO_MANIFEST } from "../../src/content/audio-manifest";

const progress = JSON.parse(
  readFileSync(new URL("../fixtures/progress-v2.json", import.meta.url), "utf8")
);

const freshProgress = {
  ...structuredClone(progress),
  gates: {},
  review: {},
  predict: false,
  mark: null
};

const lockedProgress = {
  ...structuredClone(freshProgress),
  gates: Object.fromEntries(LEVELS.slice(0, 3).map((gate) => [
    String(gate.id),
    { t1: 1, sealed: true }
  ]))
};

const admittedProgress = {
  ...structuredClone(freshProgress),
  gates: Object.fromEntries(LEVELS.map((gate) => [
    String(gate.id),
    { t1: 1, sealed: true }
  ])),
  bar: { passed: true, lockedUntil: 0, passedAt: 1 }
};

async function answerChoiceAndWait(page: import("@playwright/test").Page) {
  const correct = page.locator('.choice[data-ok="true"]');
  const before = await page.locator(".queue-meta span").first().textContent();
  await correct.click();
  await expect.poll(async () => {
    if (await page.getByText("Trial I is passed.").isVisible()) return "done";
    if (await page.getByText("Gate Sealed").isVisible()) return "done";
    if (await page.locator(".queue-meta span").count() === 0) return "advanced";
    return page.locator(".queue-meta span").first().textContent();
  }).not.toBe(before);
}

test("first run onboarding reaches the gates and persists", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Words, by their roots." })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: /Begin/ }).click();
  await expect(page.locator(".dash")).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("rootstock_v2") ?? "{}").onboarded))
    .toBe(true);
});

test("loads historical v2 progress and changes themes", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
  }, progress);
  await page.goto("/?theme=dragon-codex");
  await expect(page.locator("html")).toHaveAttribute("data-rs-theme", "dragon-codex");
  await expect(page.locator(".dash")).toBeVisible();
  await page.locator("#cog").click();
  await page.getByRole("radio", { name: /Plain/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-rs-theme", "plain");
  expect(await page.evaluate(() => localStorage.getItem("rootstock_theme_v1"))).toBe("plain");
});

test("loads fonts, theme art, and pronunciation audio only from the app origin", async ({ page }) => {
  const requests: Array<{ type: string; url: string }> = [];
  page.on("request", (request) => {
    const url = request.url();
    if (request.resourceType() === "font"
      || request.resourceType() === "media"
      || url.includes("/assets/themes/")) {
      requests.push({ type: request.resourceType(), url });
    }
  });
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
  }, progress);
  await page.goto("/?theme=dragon-codex");
  await page.evaluate(() => document.fonts.ready);
  await page.locator("#cta").click();
  await expect(page.locator(".root-row").first()).toBeVisible();
  await page.locator(".say").first().click();

  await expect.poll(() => requests.some(({ url }) => url.includes("/audio/"))).toBe(true);
  const origin = new URL(page.url()).origin;
  expect(requests.filter(({ url }) => new URL(url).origin !== origin)).toEqual([]);
  expect(requests.some(({ type }) => type === "font")).toBe(true);
  expect(requests.some(({ url }) => url.includes("/assets/themes/"))).toBe(true);
});

test("preserves the native entitlement bridge contract", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
    (window as Window & { bridgeMessages?: unknown[] }).bridgeMessages = [];
    window.webkit = {
      messageHandlers: {
        rootstock: {
          postMessage(message: unknown) {
            (window as Window & { bridgeMessages?: unknown[] }).bridgeMessages?.push(message);
          }
        }
      }
    };
  }, progress);
  await page.goto("/");
  await expect.poll(() => page.evaluate(() =>
    (window as Window & { bridgeMessages?: Array<{ action?: string }> }).bridgeMessages?.[0]?.action
  )).toBe("status");
  await page.evaluate(() => window.RS_setEntitlement?.({ active: true, plan: "annual" }));
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("rootstock_sub") ?? "{}").plan))
    .toBe("annual");
});

test("gates paid content and preserves purchase, restore, and legal native actions", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
    (window as Window & { bridgeMessages?: unknown[] }).bridgeMessages = [];
    window.webkit = {
      messageHandlers: {
        rootstock: {
          postMessage(message: unknown) {
            (window as Window & { bridgeMessages?: unknown[] }).bridgeMessages?.push(message);
          }
        }
      }
    };
  }, lockedProgress);
  await page.goto("/");
  await expect(page.locator(".session-kicker")).toHaveText("Members ✦");
  await page.locator("#cta").click();
  await expect(page.getByRole("heading", { name: "Open every gate." })).toBeVisible();

  await page.locator("#pw-go").click();
  await expect.poll(() => page.evaluate(() =>
    (window as Window & { bridgeMessages?: Array<{ action?: string }> }).bridgeMessages
      ?.find((message) => message.action === "purchase")
  )).toMatchObject({
    action: "purchase",
    plan: "annual",
    productId: "com.rootstock.full.annual"
  });

  await page.locator("#pw-restore").click();
  await page.locator("#pw-terms").click();
  await expect.poll(() => page.evaluate(() =>
    (window as Window & { bridgeMessages?: Array<{ action?: string; url?: string }> }).bridgeMessages
  )).toEqual(expect.arrayContaining([
    expect.objectContaining({ action: "status" }),
    expect.objectContaining({ action: "restore" }),
    expect.objectContaining({ action: "openURL", url: "legal/terms.html" })
  ]));

  await page.evaluate(() => window.RS_setEntitlement?.({
    active: true,
    plan: "annual",
    priceAnnual: "$44.99"
  }));
  await page.locator("#pw-back").click();
  await expect(page.locator(".session-kicker")).toHaveText("Next Gate");
});

test("preserves preview parameters and theme-message behavior", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
  }, lockedProgress);
  await page.goto("/?theme=odyssey&etym=0&burnt=1&dev=1");
  await expect(page.locator("html")).toHaveAttribute("data-rs-theme", "odyssey");
  expect(await page.evaluate(() => ({
    etymology: document.documentElement.dataset.rsEtym === "1",
    burnt: document.documentElement.dataset.rsBurnt === "1",
    override: document.documentElement.dataset.rsThemeOverride,
    subscription: JSON.parse(localStorage.getItem("rootstock_sub") ?? "{}")
  }))).toMatchObject({
    etymology: false,
    burnt: true,
    override: "odyssey",
    subscription: { source: "dev", active: true, plan: "annual" }
  });
  await expect(page.locator(".session-kicker")).toHaveText("Next Gate");
  await page.evaluate(() => window.postMessage({ rsTheme: "plain" }, "*"));
  await expect(page.locator("html")).toHaveAttribute("data-rs-theme", "plain");
});

test("round-trips progress through the backup and restore UI", async ({ page }) => {
  await page.addInitScript((fixture) => {
    if (!localStorage.getItem("rootstock_v2")) {
      localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
    }
  }, progress);
  await page.goto("/");
  await page.locator("#cog").click();
  await page.locator("#s-backup").click();
  const backup = await page.locator("#code").inputValue();
  expect(backup.length).toBeGreaterThan(100);
  await page.locator("#cancel").click();

  await page.evaluate((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
  }, freshProgress);
  await page.reload();
  await page.locator("#cog").click();
  await page.locator("#s-restorecode").click();
  await page.locator("#code").fill(backup);
  await page.locator("#do").click();
  await expect(page.locator(".dash")).toBeVisible();
  expect(await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rootstock_v2") ?? "{}").gates["1"].sealed
  )).toBe(true);
});

test("serves a due review and advances its Leitner box", async ({ page }) => {
  const dueProgress = {
    ...structuredClone(progress),
    review: { "0-0": { box: 0, due: 1 } },
    predict: false
  };
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
  }, dueProgress);
  await page.goto("/");
  await expect(page.locator(".session-kicker")).toHaveText("Review");
  await page.locator("#cta").click();
  await answerChoiceAndWait(page);
  await expect(page.getByText("Docket Cleared")).toBeVisible();
  expect(await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rootstock_v2") ?? "{}").review["0-0"].box
  )).toBe(1);
});

test("nudges on a small docket but only bars progression on a backlog", async ({ page }) => {
  const dueReview = (count: number) => {
    const due = Date.now() - 60 * 60 * 1000;
    const review: Record<string, { box: number; due: number }> = {};
    for (let index = 0; index < count; index += 1) {
      review[`${Math.floor(index / 10)}-${index % 10}`] = { box: 0, due };
    }
    return review;
  };

  // Seeded once; the reload below re-runs this script, so later edits must survive it.
  await page.addInitScript((fixture) => {
    if (!localStorage.getItem("rootstock_v2")) {
      localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
    }
    localStorage.setItem("rootstock_sub", JSON.stringify({
      source: "dev",
      active: true,
      plan: "annual",
      expiresAt: null
    }));
  }, { ...admittedProgress, review: dueReview(3) });

  // A handful of fresh due words: the home card asks, the Drill Hall stays open.
  await page.goto("/");
  await expect(page.locator(".session-title")).toHaveText("The Review Docket");
  await expect(page.locator("#drill-btn")).toBeEnabled();
  await expect(page.locator("#drill-btn")).toContainText("Drill");

  // Past a sitting's worth, the docket bars the way again.
  await page.evaluate((review) => {
    const saved = JSON.parse(localStorage.getItem("rootstock_v2") ?? "{}");
    localStorage.setItem("rootstock_v2", JSON.stringify({ ...saved, review }));
  }, dueReview(25));
  await page.reload();
  await expect(page.locator("#drill-btn")).toBeDisabled();
  await expect(page.locator("#drill-btn")).toContainText("Docket first");
});

test("caps a docket sitting and leaves the remainder for the next one", async ({ page }) => {
  test.setTimeout(60_000);
  const due = Date.now() - 60 * 60 * 1000;
  const review: Record<string, { box: number; due: number }> = {};
  for (let index = 0; index < 25; index += 1) {
    review[`${Math.floor(index / 10)}-${index % 10}`] = { box: 0, due: due - index };
  }
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
    localStorage.setItem("rootstock_sub", JSON.stringify({
      source: "dev",
      active: true,
      plan: "annual",
      expiresAt: null
    }));
  }, { ...admittedProgress, review });

  await page.goto("/");
  // 25 due is over the cap, so the CTA promises a sitting rather than the whole backlog.
  await expect(page.locator(".session-meta")).toHaveText("20 of 25 this sitting");
  await page.locator("#cta").click();
  await expect(page.locator(".queue-meta span").first()).toHaveText("20 in queue");

  for (let index = 0; index < 20; index += 1) await answerChoiceAndWait(page);

  await expect(page.getByText("Sitting Cleared")).toBeVisible();
  await expect(page.getByText(/5 words still due/)).toBeVisible();
  await page.locator("#h2").click();

  // 25 → 5 remaining drops back under the blocking threshold, so the way forward reopens.
  await expect(page.locator("#drill-btn")).toBeEnabled();
  await expect(page.locator("#cta")).toContainText("5 words ready for recall");
  await page.locator("#cta").click();
  await expect(page.locator(".queue-meta span").first()).toHaveText("5 in queue");
});

test("retires a word that has climbed the whole ladder", async ({ page }) => {
  const word = LEVELS[0]!.words[0]!;
  const top = 5;
  await page.addInitScript(({ fixture, top }) => {
    localStorage.setItem("rootstock_v2", JSON.stringify({
      ...fixture,
      // Top of the ladder, and well clear on the tally: this answer should be its last.
      review: { "0-0": { box: top, due: 1 } },
      ledger: { "0-0": { r: 6, w: 0 } }
    }));
  }, { fixture: admittedProgress, top });

  await page.goto("/");
  await page.locator("#cta").click();
  // The top tier is a bank — assembly or typed production — so answer whichever came up.
  const typed = page.locator("#ans");
  if (await typed.count()) {
    await typed.fill(word.word);
    await page.locator("#sub").click();
  } else {
    for (const [segment] of word.parts) {
      await page.locator(`.chip[data-seg="${segment}"]`).first().click();
    }
  }

  await expect(page.getByText("Docket Cleared")).toBeVisible();
  await expect(page.getByText(/left the Docket for good/)).toBeVisible();
  expect(await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rootstock_v2") ?? "{}").review["0-0"]
  )).toBeUndefined();
});

test("a lapse resets the calendar but drops difficulty only one rung", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify({
      ...fixture,
      // Tier 2 is the typed bank, so every mode in it is answered the same way.
      review: { "0-0": { box: 3, tier: 2, due: 1 } }
    }));
  }, admittedProgress);

  await page.goto("/");
  await page.locator("#cta").click();
  await page.locator("#ans").fill("notthewordatall");
  await page.locator("#sub").click();
  await expect(page.locator(".verdict")).toBeVisible();

  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rootstock_v2") ?? "{}").review["0-0"]
  );
  expect(after.box).toBe(0);
  expect(after.tier).toBe(1);
});

test("withholds the letter cue where production is the test", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify({
      ...fixture,
      // Tier 2 is the typed bank: PROD, CLOZE and VIGT all used to leak "p·······".
      review: { "0-0": { box: 3, tier: 2, due: 1 } }
    }));
  }, admittedProgress);

  await page.goto("/");
  await page.locator("#cta").click();
  await expect(page.locator("#ans")).toBeVisible();
  await expect(page.locator(".cue")).toHaveCount(0);
});

test("opens the root and word lexicons from sealed content", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
  }, progress);
  await page.goto("/");
  await page.locator("#lex-stat").click();
  await expect(page.locator(".stage-label")).toContainText("The Lexicon · Roots");
  await page.locator("#to-words").click();
  await page.locator("#lexq").fill("egoist");
  await expect(page.locator(".lex-row")).toHaveCount(1);
  await page.locator(".lex-row").click();
  await expect(page.locator(".headword")).toHaveText("egoist");
});

test("opens an adaptive Drill Hall focus for an admitted learner", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
    localStorage.setItem("rootstock_sub", JSON.stringify({
      source: "dev",
      active: true,
      plan: "annual",
      expiresAt: null
    }));
  }, admittedProgress);
  await page.goto("/");
  await expect(page.locator(".session-title")).toHaveText("The Drill Hall stands open");
  await page.locator("#cta").click();
  await expect(page.getByText("Words the gates never taught.")).toBeVisible();
  await page.locator("#go").click();
  await expect(page.getByText("Choose a focus")).toBeVisible();
  await page.locator('[data-focus="all"]').click();
  await expect(page.locator(".stage-label")).toContainText("The Drill Hall");
  await expect(page.locator(".queue-meta")).toContainText("Caliber");
});

test("completes both trials and seals an entire gate", async ({ page }) => {
  test.setTimeout(90_000);
  const gate = LEVELS[0]!;
  const wordByDefinition = new Map(gate.words.map((word) => [word.def, word.word]));
  const rootByGloss = new Map(gate.quizRoots!.map((root) => [root.gloss, root.root]));

  await page.addInitScript((fixture) => {
    if (!localStorage.getItem("rootstock_v2")) {
      localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
    }
  }, freshProgress);
  await page.goto("/");
  await page.locator("#cta").click();
  await page.locator("#go").click();

  while (await page.locator('.choice[data-ok="true"]').isVisible()) {
    await answerChoiceAndWait(page);
  }
  for (let index = 0; index < gate.words.length; index += 1) {
    const word = gate.words[index]!;
    await expect(page.locator(".headword")).toHaveText(word.word);
    await expect(page.locator(`.say[data-say="${word.word}"]`)).toBeVisible();
    await page.locator("#next").click();
  }
  while (!await page.getByText("Trial I is passed.").isVisible()) {
    await answerChoiceAndWait(page);
  }

  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("rootstock_v2") ?? "{}");
    saved.gates["1"].t1 = 1;
    localStorage.setItem("rootstock_v2", JSON.stringify(saved));
  });
  await page.reload();
  await page.locator("#cta").click();

  while (!await page.getByText("Gate Sealed").isVisible()) {
    const correct = page.locator('.choice[data-ok="true"]');
    if (await correct.isVisible()) {
      await answerChoiceAndWait(page);
      continue;
    }

    const input = page.locator("#ans");
    await expect(input).toBeVisible();
    const asksForRoot = (await page.locator(".q-ask").textContent())?.startsWith("Name the root");
    const prompt = (await page.locator(".q-def").textContent())?.replace(/[“”]/g, "").trim() ?? "";
    const answer = asksForRoot
      ? rootByGloss.get(prompt)?.split(/[\/,+]/)[0]?.trim()
      : wordByDefinition.get(prompt);
    expect(answer, `answer for prompt "${prompt}"`).toBeTruthy();
    const before = await page.locator(".queue-meta span").first().textContent();
    await input.fill(answer!);
    await page.locator("#sub").click();
    await expect.poll(async () => {
      if (await page.getByText("Gate Sealed").isVisible()) return "done";
      if (await page.locator(".queue-meta span").count() === 0) return "advanced";
      return page.locator(".queue-meta span").first().textContent();
    }).not.toBe(before);
  }

  expect(await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rootstock_v2") ?? "{}").gates["1"].sealed
  )).toBe(true);
});

test("restarts offline after the service worker activates", async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
  }, progress);
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true });
      });
    }
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".dash")).toBeVisible();
  const audioAsset = Object.values(AUDIO_MANIFEST)[0]!;
  expect(await page.evaluate(async (asset) => {
    const response = await fetch(`/${asset}`);
    return response.ok && (await response.arrayBuffer()).byteLength > 0;
  }, audioAsset)).toBe(true);
});

test("starts from the bundled file URL used by WKWebView", async ({ page }) => {
  const fileUrl = pathToFileURL(resolve("dist/index.html")).href;
  await page.goto(fileUrl);
  await expect(page.getByRole("heading", { name: "Words, by their roots." })).toBeVisible();
  await expect(page.locator("link[rel=stylesheet]")).toHaveAttribute("href", "./assets/app.css");
});
