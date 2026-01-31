import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    // In Next.js 15, params is a Promise. We should await it or treat it carefully. 
    // Wait, in App Router standard, it's often not a promise in older versions, but let's be safe or just standard destructuring. 
    // The previous code used { params }: { params: { id: string } }. 
    // Let's add logs to see what's happening.

    try {
        const { id: reportId } = await params;
        const body = await request.json();
        const { status } = body;

        console.log(`Updating report ${reportId} to status ${status}`);

        // Validate status
        if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const query = 'UPDATE reports SET status = ? WHERE id = ?';
        const [result] = await db.execute(query, [status, reportId]);

        console.log('Update result:', result);

        return NextResponse.json({ message: 'Status updated' });
    } catch (error: any) {
        console.error('Error updating status:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
