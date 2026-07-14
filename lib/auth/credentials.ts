interface AdminCredential {
    email: string;
    passwordHash: string;
}

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$/;

function parseAdminCredentials(): AdminCredential[] {
    const raw = process.env.ADMIN_CREDENTIALS;
    if (!raw || raw.trim().length === 0) {
        throw new Error(
            'ADMIN_CREDENTIALS env var is not set. Format: "email1:bcryptHash1,email2:bcryptHash2". Refusing to start.'
        );
    }

    const pairs = raw.split(',').map((entry) => entry.trim()).filter(Boolean);
    const credentials: AdminCredential[] = [];

    for (const pair of pairs) {
        const separatorIndex = pair.indexOf(':');
        if (separatorIndex === -1) {
            throw new Error(`Malformed ADMIN_CREDENTIALS entry (expected "email:hash"): "${pair}"`);
        }

        const email = pair.slice(0, separatorIndex).trim().toLowerCase();
        const passwordHash = pair.slice(separatorIndex + 1).trim();

        if (!email || !email.includes('@')) {
            throw new Error(`Malformed ADMIN_CREDENTIALS entry, invalid email: "${pair}"`);
        }
        if (!BCRYPT_HASH_PATTERN.test(passwordHash)) {
            throw new Error(
                `ADMIN_CREDENTIALS entry for "${email}" is not a valid bcrypt hash. ` +
                'Generate one with: node -e "console.log(require(\'bcryptjs\').hashSync(\'yourpassword\', 10))"'
            );
        }

        credentials.push({ email, passwordHash });
    }

    if (credentials.length === 0) {
        throw new Error('ADMIN_CREDENTIALS parsed to zero valid entries. Refusing to start.');
    }

    return credentials;
}

// Fail fast: parse and validate at module load, not on the first login attempt.
export const ADMIN_CREDENTIALS: AdminCredential[] = parseAdminCredentials();

export function findAdminCredential(email: string): AdminCredential | undefined {
    const normalized = email.trim().toLowerCase();
    return ADMIN_CREDENTIALS.find((cred) => cred.email === normalized);
}

export function isAdminEmail(email?: string | null): boolean {
    if (!email) return false;
    return ADMIN_CREDENTIALS.some((cred) => cred.email === email.trim().toLowerCase());
}
