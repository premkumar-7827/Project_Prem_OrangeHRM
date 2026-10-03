export interface EmployeeData {
    firstName: string;
    lastName: string;
    employeeId: string;
}

export function newEmployeeData(): EmployeeData {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 10_000)}`.slice(-10);
    return {
        firstName: `QA${suffix.slice(0, 4)}`,
        lastName: `Automation${suffix.slice(4, 8)}`,
        employeeId: `T${suffix}`,
    };
}