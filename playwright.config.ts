import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : 1,
    timeout: 60_000,
    expect: { timeout: 8_000 },
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
    ],
    use: {
        baseURL: env.baseUrl,
        // headless: env.headless,
        headless: false,
        actionTimeout: 10_000,
        navigationTimeout: 30_000,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
        ...devices['Desktop Chrome'],
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], headless: env.headless } },
    ],
});