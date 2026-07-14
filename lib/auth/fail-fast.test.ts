import { describe, it, expect, afterEach, vi } from 'vitest';

// These tests exercise the module-level fail-fast checks by resetting the
// module registry and re-importing with deliberately broken env vars.
// vitest.setup.ts sets valid values for every other test file; this file
// restores the original values afterward so it doesn't leak state.

describe('fail-fast boot validation', () => {
    const originalSecret = process.env.ADMIN_JWT_SECRET;
    const originalCredentials = process.env.ADMIN_CREDENTIALS;

    afterEach(() => {
        process.env.ADMIN_JWT_SECRET = originalSecret;
        process.env.ADMIN_CREDENTIALS = originalCredentials;
        vi.resetModules();
    });

    it('throws if ADMIN_JWT_SECRET is missing', async () => {
        vi.resetModules();
        delete process.env.ADMIN_JWT_SECRET;
        await expect(import('./jwt')).rejects.toThrow(/ADMIN_JWT_SECRET/);
    });

    it('throws if ADMIN_JWT_SECRET is too short', async () => {
        vi.resetModules();
        process.env.ADMIN_JWT_SECRET = 'too-short';
        await expect(import('./jwt')).rejects.toThrow(/ADMIN_JWT_SECRET/);
    });

    it('throws if ADMIN_CREDENTIALS is missing', async () => {
        vi.resetModules();
        delete process.env.ADMIN_CREDENTIALS;
        await expect(import('./credentials')).rejects.toThrow(/ADMIN_CREDENTIALS/);
    });

    it('throws if an ADMIN_CREDENTIALS entry is not a valid bcrypt hash', async () => {
        vi.resetModules();
        process.env.ADMIN_CREDENTIALS = 'admin@example.com:not-a-bcrypt-hash';
        await expect(import('./credentials')).rejects.toThrow(/not a valid bcrypt hash/);
    });

    it('throws if an ADMIN_CREDENTIALS entry is malformed (no colon)', async () => {
        vi.resetModules();
        process.env.ADMIN_CREDENTIALS = 'admin@example.com-no-separator';
        await expect(import('./credentials')).rejects.toThrow(/Malformed/);
    });
});
