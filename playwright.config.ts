import { defineConfig, devices } from '@playwright/test'

const core = [
  'visitor.e2e.spec.ts',
  'cms.e2e.spec.ts',
  'relationships.e2e.spec.ts',
  'security.e2e.spec.ts',
  'form.e2e.spec.ts',
  'server-rendering.e2e.spec.ts',
  'seo.e2e.spec.ts',
  'accessibility.e2e.spec.ts',
  'readiness.e2e.spec.ts',
]

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: !!process.env.CI,
  globalSetup: './tests/support/check-environment.ts',
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ...(process.env.CI ? [['./tests/support/required-tests-reporter.ts'] as const] : []),
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    navigationTimeout: process.env.DEV_HMR_TEST === 'true' ? 120000 : 30000,
  },
  projects: [
    {
      name: 'core',
      testMatch: core,
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    {
      name: 'audit',
      testIgnore: [...core, 'development.e2e.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'development',
      testMatch: 'development.e2e.spec.ts',
      timeout: 120000,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer:
    process.env.PLAYWRIGHT_EXTERNAL_SERVER === 'true'
      ? undefined
      : {
          timeout: 180000,
          command:
            process.env.PLAYWRIGHT_SERVER_COMMAND || (process.env.CI ? 'pnpm start' : 'pnpm dev'),
          reuseExistingServer: !process.env.CI,
          url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        },
})
