import { describe, it, expect, vi } from 'vitest';
import { signAdminSession, verifyAdminSession, SESSION_DURATION_SECONDS } from './jwt';

describe('signAdminSession / verifyAdminSession', () => {
    it('signs a token that verifies back to the same email (happy path)', async () => {
        const token = await signAdminSession('admin1@example.com');
        const result = await verifyAdminSession(token);
        expect(result).toEqual({ valid: true, email: 'admin1@example.com' });
    });

    it('rejects a missing token', async () => {
        const result = await verifyAdminSession(undefined);
        expect(result).toEqual({ valid: false, reason: 'missing' });
    });

    it('rejects a malformed token string', async () => {
        const result = await verifyAdminSession('not-a-real-jwt');
        expect(result.valid).toBe(false);
        if (!result.valid) expect(result.reason).toBe('invalid');
    });

    it('rejects a tampered signature (forged token)', async () => {
        const token = await signAdminSession('admin1@example.com');
        // Flip a character in the middle of the signature segment — the
        // last base64url char of a 256-bit HMAC signature has unused padding
        // bits, so tampering there can be a no-op; the middle is unambiguous.
        const parts = token.split('.');
        const mid = Math.floor(parts[2].length / 2);
        const midChar = parts[2][mid];
        const replacement = midChar === 'a' ? 'b' : 'a';
        parts[2] = parts[2].slice(0, mid) + replacement + parts[2].slice(mid + 1);
        const tampered = parts.join('.');

        const result = await verifyAdminSession(tampered);
        expect(result.valid).toBe(false);
        if (!result.valid) expect(result.reason).toBe('invalid');
    });

    it('rejects an expired token', async () => {
        vi.useFakeTimers();
        const token = await signAdminSession('admin1@example.com');
        vi.advanceTimersByTime((SESSION_DURATION_SECONDS + 60) * 1000);

        const result = await verifyAdminSession(token);
        vi.useRealTimers();

        expect(result.valid).toBe(false);
        if (!result.valid) expect(result.reason).toBe('expired');
    });

    // The regression test: proves the OLD vulnerability (a plain, unsigned
    // cookie value trusted as-is) is now rejected. This is the single most
    // important test in this suite.
    it('CRITICAL REGRESSION: rejects a forged plain-text cookie value mimicking the old unsigned scheme', async () => {
        const forgedLegacyStyleValue = 'admin1@example.com';
        const result = await verifyAdminSession(forgedLegacyStyleValue);
        expect(result.valid).toBe(false);
    });
});
