import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Trust Score = reports_submitted × 10 + votes_received × 3
        // Joins reports and votes to give a rich leaderboard
        const query = `
            SELECT 
                r.user_id,
                COUNT(DISTINCT r.id) AS report_count,
                COALESCE(SUM(v.vote_count), 0) AS votes_received,
                (COUNT(DISTINCT r.id) * 10 + COALESCE(SUM(v.vote_count), 0) * 3) AS score
            FROM reports r
            LEFT JOIN (
                SELECT report_id, COUNT(*) AS vote_count
                FROM votes
                GROUP BY report_id
            ) v ON r.id = v.report_id
            GROUP BY r.user_id
            ORDER BY score DESC
            LIMIT 20
        `;

        const [rows] = await db.execute(query);
        const leaderboard = (rows as any[]).map((row: any, index: number) => ({
            userId: row.user_id,
            reports: Number(row.report_count),
            votes_received: Number(row.votes_received),
            score: Number(row.score),
            rank: index + 1,
            badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index < 10 ? '⭐' : '🌱',
        }));

        return NextResponse.json(leaderboard);

    } catch (error: any) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
