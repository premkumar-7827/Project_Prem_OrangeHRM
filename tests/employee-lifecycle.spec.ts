import { expect, request, test } from '@playwright/test';
import { EmployeesApi } from '../src/api/EmployeesApi';
import { env } from '../src/config/env';
import { LoginPage } from '../src/pages/LoginPage';
import { PimPage } from '../src/pages/PimPage';
import { newEmployeeData } from '../src/utils/employeeData';

test('admin completes employee create, read, update, and delete @regression @e2e', async ({ page }) => {
    const employee = newEmployeeData();
    const login = new LoginPage(page);
    const pim = new PimPage(page);

    await login.open();
    await login.login(env.username, env.password);
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
    await pim.openEmployeeList();
    await pim.createEmployee(employee);

    const apiContext = await request.newContext({
        baseURL: env.baseUrl,
        storageState: await page.context().storageState(),
    });
    const employeesApi = new EmployeesApi(apiContext);

    try {
        const created = await employeesApi.findByEmployeeId(employee.employeeId);
        expect(created).toMatchObject({
            employeeId: employee.employeeId,
            firstName: employee.firstName,
            lastName: employee.lastName,
        });

        const updatedFirstName = `${employee.firstName}Updated`;
        await pim.updateFirstName(employee.employeeId, employee.firstName, updatedFirstName);
        await expect.poll(async () => (await employeesApi.findByEmployeeId(employee.employeeId))?.firstName)
            .toBe(updatedFirstName);

        await pim.deleteEmployee(employee.employeeId);
        await expect.poll(async () => employeesApi.findByEmployeeId(employee.employeeId)).toBeUndefined();
    } finally {
        const remainingEmployee = await employeesApi.findByEmployeeId(employee.employeeId).catch(() => undefined);
        if (remainingEmployee) {
            await employeesApi.deleteByEmployeeNumber(remainingEmployee.empNumber).catch((error: unknown) => {
                console.warn(`Best-effort employee cleanup failed: ${String(error)}`);
            });
        }
        await apiContext.dispose();
    }
});

test('anonymous users are redirected from employee management @smoke @auth', async ({ page }) => {
    await page.goto('/web/index.php/pim/viewEmployeeList');
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});