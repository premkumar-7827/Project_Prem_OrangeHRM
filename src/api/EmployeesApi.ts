import type { APIRequestContext } from '@playwright/test';

export interface EmployeeRecord {
    empNumber: number;
    employeeId: string;
    firstName: string;
    lastName: string;
}

interface EmployeeSearchResponse {
    data: EmployeeRecord[];
    meta?: { total?: number };
}

export class EmployeesApi {
    constructor(private readonly request: APIRequestContext) { }

    async findByEmployeeId(employeeId: string): Promise<EmployeeRecord | undefined> {
        const response = await this.request.get('/web/index.php/api/v2/pim/employees', {
            params: { limit: '50', offset: '0', nameOrId: employeeId },
            headers: { Accept: 'application/json' },
        });
        if (!response.ok()) {
            throw new Error(`Employee search API failed (${response.status()}): ${await response.text()}`);
        }
        const payload = (await response.json()) as EmployeeSearchResponse;
        return payload.data?.find((employee) => employee.employeeId === employeeId);
    }

    async deleteByEmployeeNumber(empNumber: number): Promise<void> {
        const response = await this.request.delete('/web/index.php/api/v2/pim/employees', {
            data: { ids: [empNumber] },
            headers: { Accept: 'application/json' },
        });
        if (!response.ok()) {
            throw new Error(`Employee cleanup API failed (${response.status()}): ${await response.text()}`);
        }
    }
}