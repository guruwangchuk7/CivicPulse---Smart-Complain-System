import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@/utils/supabase/server';
import { isAdmin } from '@/lib/admin';
import { markReportResolvedOnChain } from '@/lib/blockchain';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user || !isAdmin(user.email)) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
        }

        const { id: reportId } = await params;
        const body = await request.json();
        const { status, resolutionHash } = body;

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

        // [WEB2.5] Update Reality on the Blockchain
        // If the municipality marks a pothole as "Resolved", we must prove they actually clicked the button!
        if (status === 'RESOLVED') {
            // In a full production app, this hash would be generated on the frontend from the uploaded repair photo
            const finalHash = resolutionHash || "0x0000000000000000000000000000000000000000000000000000000000000000";
            markReportResolvedOnChain(reportId, finalHash).catch(err => {
                console.error("Failed to mark resolved on blockchain:", err);
            });
        }

        return NextResponse.json({ message: 'Status updated', status });
    } catch (error: any) {
        console.error('Error updating status:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
