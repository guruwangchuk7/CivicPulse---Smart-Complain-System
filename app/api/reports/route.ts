import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Report } from '@/types';

// Simple in-memory rate limiter (not sufficient for prod scaling, fine for hackathon)
const simpleRateLimiter = new Map<string, number>();

export async function POST(request: Request) {
    try {
        // Basic Rate Limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();
        const lastRequest = simpleRateLimiter.get(ip) || 0;

        // 5 seconds cooldown
        if (now - lastRequest < 5000) {
            return NextResponse.json({ error: 'Rate limit exceeded. Slow down.' }, { status: 429 });
        }
        simpleRateLimiter.set(ip, now);

        const body = await request.json();
        const { category, description, lat, lng, photoUrl } = body;

        // Validate inputs
        if (!category || !lat || !lng) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate coordinates
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('reports')
            .insert([
                {
                    category,
                    description,
                    lat,
                    lng,
                    photo_url: photoUrl,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // Optionally add query params for viewport bounds later
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
