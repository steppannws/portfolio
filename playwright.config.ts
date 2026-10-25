import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/portfolio/',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/portfolio/',
    reuseExistingServer: !process.env.CI,
  },
});
