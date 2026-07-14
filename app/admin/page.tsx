import { requireAdminForPage } from '@/lib/auth/require-admin';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
    await requireAdminForPage();
    return <AdminDashboardClient />;
}
