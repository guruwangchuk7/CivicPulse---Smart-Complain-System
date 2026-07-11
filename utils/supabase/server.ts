import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies();
    return {
        auth: {
            async getUser() {
                const cookie = cookieStore.get('admin_email');
                const email = cookie?.value;
                if (email) {
                    return { data: { user: { email: decodeURIComponent(email) } }, error: null };
                }
                return { data: { user: null }, error: new Error('No session') };
            },
            async signInWithPassword({ email, password }: any) {
                if (email === 'guru@gmail.com' && password === '12345678') {
                    cookieStore.set('admin_email', encodeURIComponent(email), { path: '/', maxAge: 7 * 24 * 60 * 60 });
                    return { data: { user: { email } }, error: null };
                }
                return { data: null, error: { message: 'Invalid admin credentials' } };
            },
            async signOut() {
                cookieStore.delete('admin_email');
                return { error: null };
            }
        }
    } as any;
}

