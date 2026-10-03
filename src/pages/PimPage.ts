import { expect, type Locator, type Page } from '@playwright/test';
import type { EmployeeData } from '../utils/employeeData';

export class PimPage {
    readonly page: Page;
    readonly employeeIdInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.employeeIdInput = page.getByRole('textbox', { name: 'Employee Id' });
    }

    async openEmployeeList(): Promise<void> {
        await this.page.getByRole('link', { name: 'PIM' }).click();
        await expect(this.page.getByRole('heading', { name: 'Employee Information' })).toBeVisible();
    }

    async createEmployee(employee: EmployeeData): Promise<void> {
        await this.page.getByRole('button', { name: 'Add' }).click();
        await expect(this.page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
        await this.page.getByRole('textbox', { name: 'First Name' }).fill(employee.firstName);
        await this.page.getByRole('textbox', { name: 'Last Name' }).fill(employee.lastName);
        await this.page.getByRole('textbox', { name: 'Employee Id' }).fill(employee.employeeId);
        await this.page.getByRole('button', { name: 'Save' }).click();
        await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
    }

    async searchByEmployeeId(employeeId: string): Promise<Locator> {
        await this.openEmployeeList();
        await this.employeeIdInput.fill(employeeId);
        await this.page.getByRole('button', { name: 'Search' }).click();
        const row = this.page.getByRole('row').filter({ hasText: employeeId });
        await expect(row).toBeVisible();
        return row;
    }

    async openEmployee(employeeId: string, firstName: string): Promise<void> {
        const row = await this.searchByEmployeeId(employeeId);
        await row.getByText(firstName, { exact: true }).click();
        await expect(this.page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
    }

    async updateFirstName(employeeId: string, oldFirstName: string, newFirstName: string): Promise<void> {
        await this.openEmployee(employeeId, oldFirstName);
        await this.page.getByRole('textbox', { name: 'First Name' }).fill(newFirstName);
        await this.page.getByRole('button', { name: 'Save' }).first().click();
        await expect(this.page.getByRole('textbox', { name: 'First Name' })).toHaveValue(newFirstName);
    }

    async deleteEmployee(employeeId: string): Promise<void> {
        const row = await this.searchByEmployeeId(employeeId);
        await row.getByRole('checkbox').check();
        await this.page.getByRole('button', { name: 'Delete' }).click();
        await this.page.getByRole('button', { name: 'Yes, Delete' }).click();
        await expect(this.page.getByText('Successfully Deleted')).toBeVisible();
    }
}