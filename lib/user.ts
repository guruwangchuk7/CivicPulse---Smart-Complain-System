export function getOrCreateUserId(): string {
    if (typeof window === 'undefined') return 'server-side-mock-id';

    let userId = localStorage.getItem('civic_user_id');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('civic_user_id', userId);
    }
    return userId;
}
