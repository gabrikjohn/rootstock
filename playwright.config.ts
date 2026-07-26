import { defineConfig, devices } from "@playwright/test";

const remoteBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}.png",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02
    }
  },
  use: {
    baseURL: remoteBaseUrl ?? "http://127.0.0.1:4173",
    trace: "on-first-retry",
    serviceWorkers: "allow"
  },
  projects: [
    {
      name: "functional-mobile",
      testMatch: /app\.spec\.ts/,
      use: { ...devices["iPhone 13"], browserName: "chromium" }
    },
    {
      name: "visual-compact",
      testMatch: /visual\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true
      }
    },
    {
      name: "visual-standard",
      testMatch: /visual\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true
      }
    },
    {
      name: "visual-wide",
      testMatch: /visual\.spec\.ts/,
      use: {
        browserName: "chromium",
        viewport: { width: 430, height: 932 },
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true
      }
    }
  ],
  ...(remoteBaseUrl ? {} : {
    webServer: {
      command: "node scripts/build.mjs --serve",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI
    }
  })
});
