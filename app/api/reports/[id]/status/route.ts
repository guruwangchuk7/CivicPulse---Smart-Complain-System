import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: reportId } = await params;
        const body = await request.json();
        const { status } = body;

        if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        // Track lifecycle timestamps
        let query = 'UPDATE reports SET status = ?';
        const queryParams: any[] = [status];

        if (status === 'IN_PROGRESS') {
            query += ', assigned_at = COALESCE(assigned_at, NOW())';
        } else if (status === 'RESOLVED') {
            query += ', resolved_at = NOW()';
        } else if (status === 'OPEN') {
            // Reopening: clear both timestamps
            query += ', assigned_at = NULL, resolved_at = NULL';
        }

        query += ' WHERE id = ?';
        queryParams.push(reportId);

        await db.execute(query, queryParams);

        return NextResponse.json({ message: 'Status updated', status });
    } catch (error: any) {
        console.error('Error updating status:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
