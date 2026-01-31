import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Report } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { category, description, lat, lng, photoUrl, userId } = body;

        if (!category || !lat || !lng || !userId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const id = uuidv4();
        const query = `
            INSERT INTO reports (id, user_id, category, description, lat, lng, photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.execute(query, [id, userId, category, description, lat, lng, photoUrl]);

        // Fetch back the created report
        const [rows] = await db.execute('SELECT * FROM reports WHERE id = ?', [id]);
        return NextResponse.json((rows as any)[0]);

    } catch (error: any) {
        console.error('MySQL Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const [rows] = await db.execute('SELECT * FROM reports ORDER BY created_at DESC LIMIT 100');
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('MySQL Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
