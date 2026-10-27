import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium-mobile', use: { ...devices['Pixel 7'],
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {} } }],
  webServer: [
    { command: 'node scripts/serve.mjs dist', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },
    { command: 'node scripts/serve.mjs dist', env: { PORT: '4174', PREVIEW_BASE_PATH: '/brew-asia-test/' }, url: 'http://127.0.0.1:4174/brew-asia-test/', reuseExistingServer: !process.env.CI },
  ],
});
