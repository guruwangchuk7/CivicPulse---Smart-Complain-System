import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: reportId } = await params;

    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Check if vote already exists
        const [existing] = await db.execute(
            'SELECT id FROM votes WHERE report_id = ? AND user_id = ?',
            [reportId, userId]
        );

        if ((existing as any[]).length > 0) {
            // Toggle: remove existing vote
            await db.execute(
                'DELETE FROM votes WHERE report_id = ? AND user_id = ?',
                [reportId, userId]
            );
            const [countRows] = await db.execute(
                'SELECT COUNT(*) as count FROM votes WHERE report_id = ?',
                [reportId]
            );
            const count = (countRows as any)[0].count;
            return NextResponse.json({ message: 'Vote removed', count, voted: false });
        }

        // Insert new vote
        const id = uuidv4();
        await db.execute(
            'INSERT INTO votes (id, report_id, user_id) VALUES (?, ?, ?)',
            [id, reportId, userId]
        );

        const [countRows] = await db.execute(
            'SELECT COUNT(*) as count FROM votes WHERE report_id = ?',
            [reportId]
        );
        const count = (countRows as any)[0].count;
        return NextResponse.json({ message: 'Vote added', count, voted: true });

    } catch (error: any) {
        console.error('Error voting:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: reportId } = await params;

    try {
        const [countRows] = await db.execute(
            'SELECT COUNT(*) as count FROM votes WHERE report_id = ?',
            [reportId]
        );
        const count = (countRows as any)[0].count;
        return NextResponse.json({ count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
