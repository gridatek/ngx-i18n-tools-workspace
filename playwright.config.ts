import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for testing the ngx-i18n-tools demo app
 * Tests the app in multiple languages to verify i18n functionality
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium-en',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en-US',
      },
    },
    {
      name: 'chromium-es',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'es-ES',
      },
    },
    {
      name: 'chromium-fr',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'fr-FR',
      },
    },
    {
      name: 'chromium-de',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'de-DE',
      },
    },
  ],

  webServer: {
    command: 'npm run serve:demo',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
