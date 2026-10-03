import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const baseUrl = (__ENV.BASE_URL || 'https://opensource-demo.orangehrmlive.com').replace(/\/$/, '');
const loginDuration = new Trend('login_api_duration', true);
const createDuration = new Trend('employee_create_api_duration', true);
const failedChecks = new Counter('qa_failed_checks');

export const options = {
    vus: Number(__ENV.K6_VUS || 1),
    duration: __ENV.K6_DURATION || '30s',
    thresholds: {
        http_req_failed: ['rate<0.02'],
        login_api_duration: ['p(95)<1500'],
        employee_create_api_duration: ['p(95)<2000'],
        qa_failed_checks: ['count==0'],
    },
};

function recordCheck(response, results) {
    const passed = check(response, results);
    if (!passed) failedChecks.add(1);
    return passed;
}

export default function () {
    const jar = http.cookieJar();
    const loginPage = http.get(`${baseUrl}/web/index.php/auth/login`, { tags: { operation: 'login_page' } });
    const tokenMatch = loginPage.body.match(/name="_token"[^>]*value="([^"]+)"/)
        || loginPage.body.match(/value="([^"]+)"[^>]*name="_token"/);

    if (!recordCheck(loginPage, { 'login page responds': (r) => r.status === 200, 'login token is present': () => Boolean(tokenMatch) })) {
        sleep(1);
        return;
    }

    const loginStart = Date.now();
    const loginResponse = http.post(
        `${baseUrl}/web/index.php/auth/validate`,
        {
            _token: tokenMatch[1],
            username: __ENV.HRM_USERNAME || 'Admin',
            password: __ENV.HRM_PASSWORD || 'admin123',
        },
        { redirects: 0, tags: { operation: 'login_api' } },
    );
    loginDuration.add(Date.now() - loginStart);
    if (!recordCheck(loginResponse, {
        'login redirects to dashboard': (r) => r.status === 302 && /dashboard\/index/.test(r.headers.Location || ''),
        'authenticated session cookie exists': () => Object.keys(jar.cookiesForURL(baseUrl)).length > 0,
    })) {
        sleep(1);
        return;
    }

    const id = `K6${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const createStart = Date.now();
    const createResponse = http.post(
        `${baseUrl}/web/index.php/api/v2/pim/employees`,
        JSON.stringify({ firstName: 'K6', lastName: 'Performance', employeeId: id }),
        { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, tags: { operation: 'employee_create_api' } },
    );
    createDuration.add(Date.now() - createStart);
    const created = recordCheck(createResponse, {
        'employee create succeeds': (r) => [200, 201].includes(r.status),
        'employee create returns JSON': (r) => Boolean(r.json('data.empNumber')),
    });

    if (created) {
        const empNumber = Number(createResponse.json('data.empNumber'));
        http.del(
            `${baseUrl}/web/index.php/api/v2/pim/employees`,
            JSON.stringify({ ids: [empNumber] }),
            { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, tags: { operation: 'employee_cleanup_api' } },
        );
    }
    sleep(1);
}

export function handleSummary(data) {
    const summary = JSON.stringify(data, null, 2);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>k6 API Performance Summary</title></head><body><h1>OrangeHRM API Performance Summary</h1><pre>${summary.replace(/</g, '&lt;')}</pre></body></html>`;
    return {
        'performance/summary.json': summary,
        'performance/summary.html': html,
    };
}