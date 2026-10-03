import { expect, test } from '@playwright/test';
import { env } from '../src/config/env';
import { LoginPage } from '../src/pages/LoginPage';

test('ESS user cannot see administrator navigation @regression @auth', async ({ page }) => {
    test.skip(!env.essUsername || !env.essPassword, 'Set ESS_USERNAME and ESS_PASSWORD for role-differential coverage.');

    const login = new LoginPage(page);
    await login.open();
    await login.login(env.essUsername!, env.essPassword!);
    await expect(page.getByRole('link', { name: 'My Info' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PIM' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
});