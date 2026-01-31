import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Hackathon logic: Since we don't have a rigid 'users' table in this simple setup
        // (users might be just UUIDs in reports/votes), we'll aggregate from 'reports' logic.
        // If you have a 'users' table, join it.

        // 1. Top Reporters (Count of reports per user_id)
        // 1. Top Reporters (Count of reports per user_id)
        // Group by user_id and count reports. Each report = 10 points.
        const query = `
            SELECT user_id, COUNT(*) as report_count 
            FROM reports 
            GROUP BY user_id 
            ORDER BY report_count DESC 
            LIMIT 10
        `;

        const [rows] = await db.execute(query);
        const reportCounts = rows as any[];

        const leaderboard = reportCounts.map((row: any) => ({
            userId: row.user_id,
            reports: row.report_count,
            votes: 0, // Placeholder
            score: row.report_count * 10
        }));

        return NextResponse.json(leaderboard);

    } catch (error: any) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message || error,
            stack: error.stack
        }, { status: 500 });
    }
}
