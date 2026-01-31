'use client';

import { useEffect, useState } from 'react';
import { Trophy, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardEntry {
    userId: string;
    score: number;
    reports: number;
}

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLeaders(data);
                } else {
                    console.error('Leaderboard API returned invalid data:', data);
                    setLeaders([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    Leaderboard
                </h1>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 max-w-md mx-auto w-full">
                <div className="bg-gradient-to-br from-black to-gray-800 rounded-2xl p-6 text-white mb-6 shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">Top Civic Heroes</h2>
                    <p className="text-gray-300">Earn points by reporting issues and keeping your neighborhood clean.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-white animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        {leaders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No heroes yet. Be the first!
                            </div>
                        ) : (
                            leaders.map((leader, index) => (
                                <div
                                    key={leader.userId}
                                    className={`flex items-center p-4 gap-4 border-b last:border-0 ${index < 3 ? 'bg-yellow-50/50' : ''}`}
                                >
                                    <div className="w-8 font-bold text-gray-400 text-center text-lg">
                                        #{index + 1}
                                    </div>

                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-500" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold truncate">
                                            User {leader.userId.slice(0, 6)}...
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {leader.reports} Reports
                                        </div>
                                    </div>

                                    <div className="font-bold text-lg text-black">
                                        {leader.score} pts
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
