import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { id: reportId } = params;

    // Minimal "auth" - using a generated user ID from client would be better,
    // but for hackathon we can trust the client passes a consistent 'userId' in the body
    // or just use IP/Cookie if we wanted to be stricter without login.
    // For this implementation: We expect { userId: string } in body.

    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Try to insert a vote
        const { error } = await supabase
            .from('votes')
            .insert([{ report_id: reportId, user_id: userId }]);

        if (error) {
            // Unique violation means already voted
            if (error.code === '23505') {
                // Optional: Toggle vote (remove it) - "Toggle Upvote" behavior
                const { error: deleteError } = await supabase
                    .from('votes')
                    .delete()
                    .match({ report_id: reportId, user_id: userId });

                if (deleteError) throw deleteError;

                return NextResponse.json({ message: 'Vote removed' });
            }
            throw error;
        }

        return NextResponse.json({ message: 'Vote added' });
    } catch (error) {
        console.error('Error voting:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id: reportId } = params;

    // Get vote count
    const { count, error } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', reportId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ count });
}
