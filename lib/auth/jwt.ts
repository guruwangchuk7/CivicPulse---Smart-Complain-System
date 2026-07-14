import { SignJWT, jwtVerify, errors as joseErrors } from 'jose';

const JWT_ALG = 'HS256';
export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret(): Uint8Array {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error(
            'ADMIN_JWT_SECRET env var is missing or too short (need >= 32 chars). Refusing to start. ' +
            'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }
    return new TextEncoder().encode(secret);
}

// Fail fast: validate immediately at module load, not on the first request.
const JWT_SECRET = getJwtSecret();

export async function signAdminSession(email: string): Promise<string> {
    return new SignJWT({ email })
        .setProtectedHeader({ alg: JWT_ALG })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
        .sign(JWT_SECRET);
}

export type VerifyResult =
    | { valid: true; email: string }
    | { valid: false; reason: 'expired' | 'invalid' | 'missing' };

export async function verifyAdminSession(token: string | undefined): Promise<VerifyResult> {
    if (!token) return { valid: false, reason: 'missing' };

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: [JWT_ALG] });
        if (typeof payload.email !== 'string') {
            return { valid: false, reason: 'invalid' };
        }
        return { valid: true, email: payload.email };
    } catch (error) {
        if (error instanceof joseErrors.JWTExpired) {
            return { valid: false, reason: 'expired' };
        }
        // Covers signature mismatch, tampering, malformed token, wrong algorithm, etc.
        return { valid: false, reason: 'invalid' };
    }
}
