import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { initDB } from '@/lib/init-db';

let dbInitialized = false;

async function ensureDB() {
    if (!dbInitialized) {
        await initDB();
        dbInitialized = true;
    }
}

export async function POST(request: Request) {
    await ensureDB();
    try {
        const { message, lat, lng } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        const lowerMsg = message.toLowerCase();

        // Very simple "AI" logic for Hackathon MVP
        // In a real app, this would call OpenAI or Anthropic API

        let responseText = "I'm not sure about that. Try asking 'What's trending nearby?' or 'Show me potholes'.";

        if (lowerMsg.includes('trending') || lowerMsg.includes('popular')) {
            // Fetch top voted report nearby
            const [rows]: any = await db.query(
                'SELECT category, description FROM reports ORDER BY priority_score DESC, created_at DESC LIMIT 1'
            );

            if (rows && rows.length > 0) {
                responseText = `The most trending issue nearby is a ${rows[0].category.toLowerCase()}: "${rows[0].description}". People are really concerned about it!`;
            } else {
                responseText = "Nothing is trending right now. It's quiet... too quiet.";
            }
        } else if (lowerMsg.includes('pothole')) {
            const [rows]: any = await db.query(
                'SELECT COUNT(*) as count FROM reports WHERE category = ?',
                ['POTHOLE']
            );
            const count = rows[0]?.count || 0;
            responseText = `There are currently ${count} potholes reported in this area. drive carefully!`;
        } else if (lowerMsg.includes('trash')) {
            const [rows]: any = await db.query(
                'SELECT COUNT(*) as count FROM reports WHERE category = ?',
                ['TRASH']
            );
            const count = rows[0]?.count || 0;
            responseText = `We have ${count} reports of trash piling up. Let's get it cleaned!`;
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            responseText = "Hello citizen! I'm your Civic Assistant. Ask me about issues nearby.";
        }

        return NextResponse.json({ reply: responseText });

    } catch (error) {
        console.error('Error in chat:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

