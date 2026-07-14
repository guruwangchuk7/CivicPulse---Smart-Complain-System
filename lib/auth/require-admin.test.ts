import { describe, it, expect } from 'vitest';
import { verifyAdminToken } from './require-admin';
import { signAdminSession } from './jwt';

// NOTE: requireAdmin() and requireAdminForPage() themselves call next/headers
// cookies(), which requires a live Next.js request scope and throws
// ("called outside a request scope") when invoked directly in Vitest — a
// real framework constraint, not an oversight (see the Test Plan artifact's
// manual-check section for how those two thin wrappers are verified).
// verifyAdminToken() holds all the actual security logic and has no such
// dependency, so it's what's unit-tested here.

describe('verifyAdminToken', () => {
    it('accepts a valid session for a whitelisted admin (happy path)', async () => {
        const token = await signAdminSession('admin1@example.com');
        const result = await verifyAdminToken(token);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.email).toBe('admin1@example.com');
    });

    it('rejects when no cookie is present (401)', async () => {
        const result = await verifyAdminToken(undefined);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.response.status).toBe(401);
    });

    it('rejects a valid signature for a non-whitelisted email (403)', async () => {
        const token = await signAdminSession('not-an-admin@example.com');
        const result = await verifyAdminToken(token);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.response.status).toBe(403);
    });

    // CRITICAL REGRESSION: the actual vulnerability this whole plan fixes —
    // a plain, unsigned value trusted as a session (what the old
    // utils/supabase/{client,server}.ts shim did with its `admin_email`
    // cookie) must now be rejected outright.
    it('CRITICAL REGRESSION: rejects a forged plain-text value mimicking the old unsigned admin_email cookie', async () => {
        const forgedLegacyStyleValue = 'admin1@example.com';
        const result = await verifyAdminToken(forgedLegacyStyleValue);
        expect(result.ok).toBe(false);
        if (!result.ok) expect(result.response.status).toBe(401);
    });
});
