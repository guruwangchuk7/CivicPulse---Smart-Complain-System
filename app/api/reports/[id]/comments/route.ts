import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: reportId } = await params;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM comments WHERE report_id = ? ORDER BY created_at ASC',
            [reportId]
        );
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: reportId } = await params;

    try {
        const { userId, text } = await request.json();

        if (!userId || !text || !text.trim()) {
            return NextResponse.json({ error: 'userId and text are required' }, { status: 400 });
        }

        if (text.length > 500) {
            return NextResponse.json({ error: 'Comment too long (max 500 chars)' }, { status: 400 });
        }

        const id = uuidv4();
        await db.execute(
            'INSERT INTO comments (id, report_id, user_id, text) VALUES (?, ?, ?, ?)',
            [id, reportId, userId, text.trim()]
        );

        const [rows] = await db.execute('SELECT * FROM comments WHERE id = ?', [id]);
        return NextResponse.json((rows as any)[0]);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
