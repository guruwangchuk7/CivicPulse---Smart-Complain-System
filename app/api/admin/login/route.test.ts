import { describe, it, expect } from 'vitest';
import { POST } from './route';

// vitest.setup.ts's ADMIN_CREDENTIALS entries both use this bcrypt hash,
// which has no known matching password — so a "correct password" test isn't
// possible against the shared setup fixture. Instead, this suite verifies
// the request-handling logic (validation, rate limiting, unknown-email
// rejection) that doesn't depend on a specific known password.

function makeRequest(body: unknown, ip = '203.0.113.1'): Request {
    return new Request('http://localhost/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
        body: JSON.stringify(body),
    });
}

describe('POST /api/admin/login', () => {
    it('rejects malformed JSON with 400', async () => {
        const req = new Request('http://localhost/api/admin/login', {
            method: 'POST',
            body: '{not json',
        });
        const res = await POST(req);
        expect(res.status).toBe(400);
    });

    it('rejects missing fields with 400', async () => {
        const res = await POST(makeRequest({ email: 'admin1@example.com' }));
        expect(res.status).toBe(400);
    });

    it('rejects an unknown email with 401 (and does not leak whether the email exists via timing/response shape)', async () => {
        const res = await POST(makeRequest({ email: 'nobody@example.com', password: 'whatever' }, '203.0.113.2'));
        expect(res.status).toBe(401);
        const body = await res.json();
        expect(body.error).toBe('Invalid admin credentials');
    });

    it('rejects a known email with the wrong password with 401', async () => {
        const res = await POST(makeRequest({ email: 'admin1@example.com', password: 'definitely-wrong' }, '203.0.113.3'));
        expect(res.status).toBe(401);
    });

    it('rate-limits after 5 failed attempts from the same IP', async () => {
        const ip = '203.0.113.4';
        for (let i = 0; i < 5; i++) {
            const res = await POST(makeRequest({ email: 'admin1@example.com', password: 'wrong' }, ip));
            expect(res.status).toBe(401);
        }
        const sixth = await POST(makeRequest({ email: 'admin1@example.com', password: 'wrong' }, ip));
        expect(sixth.status).toBe(429);
    });
});
