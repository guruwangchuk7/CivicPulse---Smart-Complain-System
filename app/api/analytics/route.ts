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
        let summary: any = { total: 0, open_count: 0, in_progress: 0, resolved: 0, avg_resolution_hours: null };
        try {
            const [summaryRows] = await db.execute(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_count,
                    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
                    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved,
                    AVG(
                        CASE 
                            WHEN status = 'RESOLVED' AND resolved_at IS NOT NULL AND assigned_at IS NOT NULL
                            THEN TIMESTAMPDIFF(HOUR, assigned_at, resolved_at)
                            ELSE NULL
                        END
                    ) AS avg_resolution_hours
                FROM reports
            `);
            summary = (summaryRows as any)[0];
        } catch (e) {
            console.error('Analytics: Summary query failed, falling back to basic counts', e);
            const [basicRows] = await db.execute(`
                SELECT
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_count,
                    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
                    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
                FROM reports
            `);
            summary = { ...(basicRows as any)[0], avg_resolution_hours: null };
        }

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
        let deptRows: any[] = [];
        try {
            const [rows] = await db.execute(`
                SELECT 
                    department,
                    COUNT(*) AS total,
                    SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_count,
                    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
                FROM reports
                GROUP BY department
            `);
            deptRows = rows as any[];
        } catch (e) {
            console.error('Analytics: Department query failed (migration may be missing)', e);
            deptRows = [];
        }

        const summaryFinal = summary;

        return NextResponse.json({
            total: Number(summaryFinal.total),
            open: Number(summaryFinal.open_count),
            in_progress: Number(summaryFinal.in_progress),
            resolved: Number(summaryFinal.resolved),
            avg_resolution_hours: summaryFinal.avg_resolution_hours
                ? parseFloat(summaryFinal.avg_resolution_hours).toFixed(1)
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
