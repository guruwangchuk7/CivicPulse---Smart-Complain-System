import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { findAdminCredential } from '@/lib/auth/credentials';
import { signAdminSession, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from '@/lib/auth/jwt';
import { checkRateLimit } from '@/lib/auth/rate-limit';

// A fixed, valid-format bcrypt hash with no known matching password. Compared
// against on an unknown email so the response time doesn't leak whether the
// email exists (bcrypt.compare always runs its full work either way).
const DECOY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8iZ2vv6L3XKQiSTMLmSNKZekg7NGDG';

function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) return forwardedFor.split(',')[0].trim();
    return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const rateLimitKey = getClientIp(request);
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: `Too many attempts. Try again in ${Math.ceil((rateLimit.retryAfterSeconds ?? 0) / 60)} minute(s).` },
            { status: 429 }
        );
    }

    const credential = findAdminCredential(email);
    const passwordMatches = await bcrypt.compare(password, credential?.passwordHash ?? DECOY_HASH);

    if (!credential || !passwordMatches) {
        console.warn(`[auth] failed admin login attempt for "${email}" from ${rateLimitKey} at ${new Date().toISOString()}`);
        return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const token = await signAdminSession(credential.email);
    const response = NextResponse.json({ email: credential.email });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_DURATION_SECONDS,
    });
    return response;
}
