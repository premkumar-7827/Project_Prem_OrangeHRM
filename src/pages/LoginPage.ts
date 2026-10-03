import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
    readonly username: Locator;
    readonly password: Locator;
    readonly submitButton: Locator;

    constructor(private readonly page: Page) {
        this.username = page.getByRole('textbox', { name: 'Username' });
        this.password = page.getByRole('textbox', { name: 'Password' });
        this.submitButton = page.getByRole('button', { name: 'Login' });
    }

    async open(): Promise<void> {
        await this.page.goto('/web/index.php/auth/login');
        await expect(this.submitButton).toBeVisible();
    }

    async login(username: string, password: string): Promise<void> {
        await this.username.fill(username);
        await this.password.fill(password);
        await this.submitButton.click();
        await expect(this.page).toHaveURL(/\/dashboard\/index/);
    }
}