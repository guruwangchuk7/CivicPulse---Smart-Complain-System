'use client';

import { useEffect, useState } from 'react';
import { Trophy, ArrowLeft, Star, TrendingUp, ThumbsUp, FileText } from 'lucide-react';
import Link from 'next/link';
import { getOrCreateUserId } from '@/lib/user';

interface LeaderboardEntry {
    userId: string;
    score: number;
    reports: number;
    votes_received: number;
    rank: number;
    badge: string;
}

const RANK_BG: Record<number, string> = {
    1: 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white shadow-lg shadow-yellow-200',
    2: 'bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-md',
    3: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md',
};

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [myUserId, setMyUserId] = useState('');

    useEffect(() => {
        setMyUserId(getOrCreateUserId());
        fetch('/api/leaderboard')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLeaders(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const myRank = leaders.findIndex(l => l.userId === myUserId);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-4 py-4 sticky top-0 z-10 flex items-center gap-3">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-400" />
                    Leaderboard
                </h1>
            </div>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
                {/* Hero Banner */}
                <div className="rounded-2xl p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-yellow-400/10 blur-2xl pointer-events-none" />
                    <h2 className="text-2xl font-extrabold mb-1">🏆 Civic Heroes</h2>
                    <p className="text-gray-400 text-sm">
                        Trust Score = Reports × 10 + Votes Received × 3
                    </p>

                    {myRank >= 0 && (
                        <div className="mt-4 bg-white/10 rounded-xl px-4 py-2 text-sm font-medium inline-flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            You are ranked #{myRank + 1}
                        </div>
                    )}
                </div>

                {/* Top 3 Podium cards */}
                {!loading && leaders.length >= 3 && (
                    <div className="grid grid-cols-3 gap-3">
                        {[leaders[1], leaders[0], leaders[2]].map((leader, i) => {
                            const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                            const height = rank === 1 ? 'h-28' : 'h-20';
                            return (
                                <div key={leader.userId} className="flex flex-col items-center gap-2">
                                    <div className={`text-2xl ${rank === 1 ? 'text-3xl' : ''}`}>{leader.badge}</div>
                                    <div className={`w-full ${height} ${RANK_BG[rank] || 'bg-white border'} rounded-2xl flex items-center justify-center font-extrabold text-2xl`}>
                                        #{rank}
                                    </div>
                                    <div className="text-xs font-bold text-gray-700 text-center truncate w-full">
                                        User {leader.userId.slice(0, 6)}
                                    </div>
                                    <div className="text-xs text-gray-500">{leader.score} pts</div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Full List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-white animate-pulse rounded-2xl border" />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                        {leaders.length === 0 ? (
                            <div className="p-10 text-center text-gray-400">
                                No heroes yet. Be the first to report! 🦸
                            </div>
                        ) : (
                            leaders.map((leader, index) => {
                                const isMe = leader.userId === myUserId;
                                return (
                                    <div
                                        key={leader.userId}
                                        className={`flex items-center p-4 gap-4 border-b last:border-0 transition-colors ${isMe ? 'bg-blue-50 border-blue-100' : index < 3 ? 'bg-amber-50/40' : 'hover:bg-gray-50'}`}
                                    >
                                        {/* Rank */}
                                        <div className="w-8 text-center font-extrabold text-lg text-gray-400">
                                            {leader.badge}
                                        </div>

                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {leader.userId.slice(0, 2).toUpperCase()}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-900 text-sm truncate flex items-center gap-2">
                                                User {leader.userId.slice(0, 8)}…
                                                {isMe && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold">YOU</span>}
                                            </div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <FileText className="w-3 h-3" />{leader.reports} reports
                                                </span>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" />{leader.votes_received} votes
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <div className="font-extrabold text-gray-900">{leader.score}</div>
                                            <div className="text-xs text-gray-400">points</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* How to earn section */}
                <div className="bg-white border rounded-2xl p-5">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-500" /> How to Earn Points
                    </h3>
                    <div className="space-y-2">
                        {[
                            { action: 'Submit a report', pts: '+10 pts', icon: '📝' },
                            { action: 'Receive an upvote', pts: '+3 pts', icon: '👍' },
                            { action: 'Report gets resolved', pts: 'Bonus!', icon: '✅' },
                        ].map(item => (
                            <div key={item.action} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50">
                                <span className="text-gray-700">{item.icon} {item.action}</span>
                                <span className="font-bold text-blue-600">{item.pts}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
