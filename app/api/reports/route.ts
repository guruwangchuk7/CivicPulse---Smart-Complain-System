import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initDB } from '@/lib/init-db';
import { v4 as uuidv4 } from 'uuid';

let dbInitialized = false;

async function ensureDB() {
    if (!dbInitialized) {
        await initDB();
        dbInitialized = true;
    }
}

// Department auto-assignment based on category
function getDepartment(category: string): string {
    switch (category) {
        case 'POTHOLE': return 'ROADS';
        case 'TRASH': return 'SANITATION';
        case 'HAZARD': return 'EMERGENCY';
        default: return 'GENERAL';
    }
}

// Compute weighted priority score
// priority = (votes * 3) + (age_hours_capped_at_72 / 72 * 30)
// Older unresolved issues naturally get higher scores
function computePriority(voteCount: number, createdAt: string): number {
    const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const ageFactor = Math.min(ageHours / 72, 1) * 30;
    return Math.round(voteCount * 3 + ageFactor);
}

export async function POST(request: Request) {
    await ensureDB();
    try {
        const body = await request.json();
        const { category, description, lat, lng, photoUrl, userId } = body;

        if (!category || !lat || !lng || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate coordinates
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
        }

        const id = uuidv4();
        const department = getDepartment(category);

        const query = `
            INSERT INTO reports (id, user_id, category, description, lat, lng, photo_url, department)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [id, userId, category, description || '', lat, lng, photoUrl || null, department]);

        const [rows] = await db.execute('SELECT * FROM reports WHERE id = ?', [id]);
        const report = (rows as any)[0];
        return NextResponse.json({ ...report, vote_count: 0, priority_score: 0 });

    } catch (error: any) {
        console.error('POST /api/reports error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    await ensureDB();
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const limitStr = searchParams.get('limit') || '100';
        const limit = Math.min(Math.max(parseInt(limitStr) || 100, 1), 200);

        // Single query: reports LEFT JOINed with vote counts
        let query = `
            SELECT 
                r.*,
                COALESCE(v.vote_count, 0) AS vote_count,
                (COALESCE(v.vote_count, 0) * 3 + 
                 LEAST(TIMESTAMPDIFF(HOUR, r.created_at, NOW()) / 72.0, 1) * 30
                ) AS priority_score
            FROM reports r
            LEFT JOIN (
                SELECT report_id, COUNT(*) AS vote_count
                FROM votes
                GROUP BY report_id
            ) v ON r.id = v.report_id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status && ['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            query += ' AND r.status = ?';
            params.push(status);
        }
        if (category && ['POTHOLE', 'TRASH', 'HAZARD', 'OTHER'].includes(category)) {
            query += ' AND r.category = ?';
            params.push(category);
        }

        query += ' ORDER BY priority_score DESC, r.created_at DESC LIMIT ?';
        params.push(limit);

        const [rows] = await db.query(query, params);
        return NextResponse.json(rows);

    } catch (error: any) {
        console.error('GET /api/reports error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
