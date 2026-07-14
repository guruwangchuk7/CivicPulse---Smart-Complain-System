import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAdminSession, SESSION_COOKIE_NAME } from './jwt';
import { isAdminEmail } from './credentials';

export type AdminAuthResult =
    | { ok: true; email: string }
    | { ok: false; response: NextResponse };

/**
 * Pure verification logic, given a token string. No dependency on
 * next/headers, so this is directly unit-testable — unlike requireAdmin()
 * and requireAdminForPage() below, which need a live Next.js request scope
 * to call cookies() and can only be exercised by manual testing or a real
 * running server (see the Test Plan artifact's manual-check section).
 */
export async function verifyAdminToken(token: string | undefined): Promise<AdminAuthResult> {
    const result = await verifyAdminSession(token);

    if (!result.valid) {
        if (result.reason === 'invalid') {
            console.warn(`[auth] rejected invalid/tampered admin session token at ${new Date().toISOString()}`);
        }
        return {
            ok: false,
            response: NextResponse.json(
                { error: result.reason === 'expired' ? 'Session expired' : 'Unauthorized' },
                { status: 401 }
            ),
        };
    }

    if (!isAdminEmail(result.email)) {
        return {
            ok: false,
            response: NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 }),
        };
    }

    return { ok: true, email: result.email };
}

/** For API routes: returns a 401/403 NextResponse instead of throwing. */
export async function requireAdmin(): Promise<AdminAuthResult> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
}

/** For Server Components (e.g. the admin page): redirects instead of returning JSON. */
export async function requireAdminForPage(): Promise<string> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const result = await verifyAdminSession(token);

    if (!result.valid || !isAdminEmail(result.email)) {
        redirect('/');
    }

    return result.email;
}
