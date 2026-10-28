import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /(qualifier|origin-guard)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3012' },
    },
    {
      // The qualifier flag is off by default, so its flow runs on the flag-on server.
      name: 'qualifier',
      testMatch: /qualifier\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3013' },
    },
    {
      // The origin guard is off by default; this server boots with a secret to prove it still lets the
      // app's own internal fetches through.
      name: 'origin-guard',
      testMatch: /origin-guard\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3014' },
    },
  ],
  webServer: {
    command: 'npm run build && node e2e/support/serve.mjs',
    url: 'http://localhost:3012',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
