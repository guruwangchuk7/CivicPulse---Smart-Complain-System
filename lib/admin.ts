import { isAdminEmail } from './auth/credentials';

export function isAdmin(email?: string | null): boolean {
    return isAdminEmail(email);
}
