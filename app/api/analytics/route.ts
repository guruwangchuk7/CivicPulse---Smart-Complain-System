import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !isAdmin(user.email)) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
        }

        // Overall summary counts
        const [summaryRows] = await db.execute(`
            SELECT
                COUNT(*) AS total,
                SUM(status = 'OPEN') AS open_count,
                SUM(status = 'IN_PROGRESS') AS in_progress,
                SUM(status = 'RESOLVED') AS resolved,
                AVG(
                    CASE 
                        WHEN resolved_at IS NOT NULL AND assigned_at IS NOT NULL
                        THEN TIMESTAMPDIFF(HOUR, assigned_at, resolved_at)
                        ELSE NULL
                    END
                ) AS avg_resolution_hours
            FROM reports
        `);

        // By category
        const [categoryRows] = await db.execute(`
            SELECT category, COUNT(*) AS count
            FROM reports
            GROUP BY category
            ORDER BY count DESC
        `);

        // Reports per day for last 7 days
        const [trendsRows] = await db.execute(`
            SELECT 
                DATE(created_at) AS date,
                COUNT(*) AS count
            FROM reports
            WHERE created_at >= NOW() - INTERVAL 7 DAY
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Department breakdown
        const [deptRows] = await db.execute(`
            SELECT 
                department,
                COUNT(*) AS total,
                SUM(status = 'OPEN') AS open_count,
                SUM(status = 'RESOLVED') AS resolved
            FROM reports
            GROUP BY department
        `);

        const summary = (summaryRows as any)[0];

        return NextResponse.json({
            total: Number(summary.total),
            open: Number(summary.open_count),
            in_progress: Number(summary.in_progress),
            resolved: Number(summary.resolved),
            avg_resolution_hours: summary.avg_resolution_hours
                ? parseFloat(summary.avg_resolution_hours).toFixed(1)
                : null,
            by_category: categoryRows,
            trends: trendsRows,
            by_department: deptRows,
        });
    } catch (error: any) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
