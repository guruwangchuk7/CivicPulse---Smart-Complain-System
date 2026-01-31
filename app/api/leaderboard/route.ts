import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Hackathon logic: Since we don't have a rigid 'users' table in this simple setup
        // (users might be just UUIDs in reports/votes), we'll aggregate from 'reports' logic.
        // If you have a 'users' table, join it.

        // 1. Top Reporters (Count of reports per user_id)
        const { data: reportCounts, error: reportError } = await supabase
            .from('reports')
            .select('user_id');

        if (reportError) {
            console.error('Supabase Error:', reportError);
            throw reportError;
        }

        console.log('Report Counts:', reportCounts);

        // Aggregate in JS (for speed/simplicity vs complex SQL RPC for now)
        const userScores: Record<string, { userId: string, score: number, reports: number, votes: number }> = {};

        reportCounts?.forEach(r => {
            if (!r.user_id) return;
            if (!userScores[r.user_id]) {
                userScores[r.user_id] = { userId: r.user_id, score: 0, reports: 0, votes: 0 };
            }
            userScores[r.user_id].reports += 1;
            userScores[r.user_id].score += 10; // 10 points per report
        });

        // 2. Votes Received (Optional complexity: count votes on user's reports)
        // Skipped for MVP unless we do a deep join. 
        // Let's just stick to "Most Active Reporters" for the leaderboard.

        const leaderboard = Object.values(userScores)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Top 10

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
