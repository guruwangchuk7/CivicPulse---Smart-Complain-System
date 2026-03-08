import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
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
            const { data } = await supabase
                .from('reports')
                .select('category, description')
                .limit(1);

            if (data && data.length > 0) {
                responseText = `The most trending issue nearby is a ${data[0].category.toLowerCase()}: "${data[0].description}". People are really concerned about it!`;
            } else {
                responseText = "Nothing is trending right now. It's quiet... too quiet.";
            }
        } else if (lowerMsg.includes('pothole')) {
            const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('category', 'POTHOLE');
            responseText = `There are currently ${count || 0} potholes reported in this area. drive carefully!`;
        } else if (lowerMsg.includes('trash')) {
            const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('category', 'TRASH');
            responseText = `We have ${count || 0} reports of trash piling up. Let's get it cleaned!`;
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            responseText = "Hello citizen! I'm your Civic Assistant. visible. Ask me about issues nearby.";
        }

        return NextResponse.json({ reply: responseText });

    } catch (error) {
        console.error('Error in chat:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
