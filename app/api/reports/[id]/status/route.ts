import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const { id: reportId } = params;

    try {
        const { status } = await request.json();

        // Validate status
        if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const query = 'UPDATE reports SET status = ? WHERE id = ?';
        await db.execute(query, [status, reportId]);

        return NextResponse.json({ message: 'Status updated' });
    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
