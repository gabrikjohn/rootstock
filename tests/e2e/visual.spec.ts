import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

const progress = JSON.parse(
  readFileSync(new URL("../fixtures/progress-v2.json", import.meta.url), "utf8")
);

async function expectViewportFit(page: import("@playwright/test").Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
}

test("onboarding visual baseline", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Words, by their roots." })).toBeVisible();
  await expectViewportFit(page);
  await expect(page).toHaveScreenshot("onboarding.png", {
    animations: "disabled",
    fullPage: true
  });
});

test("home visual baseline", async ({ page }) => {
  await page.addInitScript((fixture) => {
    localStorage.setItem("rootstock_v2", JSON.stringify(fixture));
  }, progress);
  await page.goto("/");
  await expect(page.locator(".dash")).toBeVisible();
  await expectViewportFit(page);
  await expect(page).toHaveScreenshot("home.png", {
    animations: "disabled",
    fullPage: true,
    mask: [page.locator(".dash-hello")],
    maskColor: "#ead9a8"
  });
});
