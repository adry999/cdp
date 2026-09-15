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
      testIgnore: /qualifier\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3012' },
    },
    {
      // The qualifier flag is off by default, so its flow runs on the flag-on server.
      name: 'qualifier',
      testMatch: /qualifier\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3013' },
    },
  ],
  webServer: {
    command: 'npm run build && node e2e/support/serve.mjs',
    url: 'http://localhost:3012',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
