const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

interface Bucket {
    count: number;
    windowStart: number;
}

// In-memory only: resets on server restart and does not share state across
// serverless instances. Acceptable while nothing is deployed yet — see
// TODOS.md for the persistent-store follow-up required before any
// serverless deploy.
const attempts = new Map<string, Bucket>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
    const now = Date.now();
    const bucket = attempts.get(key);

    if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
        attempts.set(key, { count: 1, windowStart: now });
        return { allowed: true };
    }

    if (bucket.count >= MAX_ATTEMPTS) {
        const retryAfterSeconds = Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000);
        return { allowed: false, retryAfterSeconds };
    }

    bucket.count += 1;
    return { allowed: true };
}
