import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit } from './rate-limit';

describe('checkRateLimit', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('allows requests under the threshold', () => {
        const key = 'ip-under-threshold';
        for (let i = 0; i < 5; i++) {
            expect(checkRateLimit(key).allowed).toBe(true);
        }
    });

    it('blocks the 6th attempt within the window', () => {
        const key = 'ip-at-threshold';
        for (let i = 0; i < 5; i++) {
            checkRateLimit(key);
        }
        const result = checkRateLimit(key);
        expect(result.allowed).toBe(false);
        expect(result.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('allows requests again after the window resets', () => {
        const key = 'ip-window-reset';
        for (let i = 0; i < 5; i++) {
            checkRateLimit(key);
        }
        expect(checkRateLimit(key).allowed).toBe(false);

        vi.advanceTimersByTime(15 * 60 * 1000 + 1000);

        expect(checkRateLimit(key).allowed).toBe(true);
    });

    it('tracks separate keys independently', () => {
        const keyA = 'ip-a';
        const keyB = 'ip-b';
        for (let i = 0; i < 5; i++) checkRateLimit(keyA);
        expect(checkRateLimit(keyA).allowed).toBe(false);
        expect(checkRateLimit(keyB).allowed).toBe(true);
    });
});
