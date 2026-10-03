import 'dotenv/config';

const asBoolean = (value: string | undefined, fallback: boolean): boolean => {
    if (value === undefined) return fallback;
    return ['1', 'true', 'yes'].includes(value.toLowerCase());
};

export const env = {
    baseUrl: (process.env.BASE_URL ?? 'https://opensource-demo.orangehrmlive.com').replace(/\/$/, ''),
    username: process.env.HRM_USERNAME ?? 'Admin',
    password: process.env.HRM_PASSWORD ?? 'admin123',
    essUsername: process.env.ESS_USERNAME,
    essPassword: process.env.ESS_PASSWORD,
    headless: asBoolean(process.env.HEADLESS, true),
};