export function createClient() {
    return {
        auth: {
            async getUser() {
                if (typeof window === 'undefined') return { data: { user: null }, error: new Error('No session') };
                const email = document.cookie
                    .split('; ')
                    .find(row => row.startsWith('admin_email='))
                    ?.split('=')[1];
                
                if (email) {
                    return { data: { user: { email: decodeURIComponent(email) } }, error: null };
                }
                return { data: { user: null }, error: new Error('No session') };
            },
            async signInWithPassword({ email, password }: any) {
                if (email === 'guru@gmail.com' && password === '12345678') {
                    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
                    document.cookie = `admin_email=${encodeURIComponent(email)}; path=/; expires=${expires}`;
                    return { data: { user: { email } }, error: null };
                }
                return { data: null, error: { message: 'Invalid admin credentials' } };
            },
            async signOut() {
                document.cookie = 'admin_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
                return { error: null };
            }
        }
    } as any;
}

