import { describe, it, expect } from 'vitest';
import { findAdminCredential, isAdminEmail, ADMIN_CREDENTIALS } from './credentials';

describe('credentials', () => {
    it('parses both entries from the ADMIN_CREDENTIALS env var set in vitest.setup.ts', () => {
        expect(ADMIN_CREDENTIALS).toHaveLength(2);
    });

    it('finds a known admin by email, case-insensitively', () => {
        expect(findAdminCredential('Admin1@Example.com')?.email).toBe('admin1@example.com');
    });

    it('returns undefined for an unknown email', () => {
        expect(findAdminCredential('nobody@example.com')).toBeUndefined();
    });

    it('isAdminEmail is true for whitelisted emails, false otherwise', () => {
        expect(isAdminEmail('admin2@example.com')).toBe(true);
        expect(isAdminEmail('random@example.com')).toBe(false);
        expect(isAdminEmail(null)).toBe(false);
        expect(isAdminEmail(undefined)).toBe(false);
    });
});
