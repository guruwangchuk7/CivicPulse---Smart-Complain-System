'use client';

import { useEffect, useState } from 'react';
import { Trophy, ArrowLeft, Star, TrendingUp, ThumbsUp, FileText, Shield, ChevronRight, Medal, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { getOrCreateUserId } from '~~/lib/user';
import AdminLoginModal from '@/components/AdminLoginModal';

interface LeaderboardEntry {
    userId: string;
    score: number;
    reports: number;
    votes_received: number;
    rank: number;
    badge: string;
}

export default function LeaderboardPage() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [myUserId, setMyUserId] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

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
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
            {/* Navigation (Consistent with Landing Page) */}
            <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="mx-auto max-w-7xl px-6 lg:px-12">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">C</div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">CivicPulse</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/#about" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">About</Link>
                            <Link href="/map" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">Live Map</Link>
                            <Link href="/leaderboard" className="text-sm font-bold text-blue-600">Leaderboard</Link>
                            <div className="h-6 w-px bg-gray-200 mx-2" />
                            <button onClick={() => setIsAdminModalOpen(true)} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Admin</button>
                            <Link href="/map" className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">Launch App</Link>
                        </div>

                        <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-20 px-6 md:hidden">
                    <div className="flex flex-col gap-6">
                        <Link href="/#about" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold">About</Link>
                        <Link href="/map" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold">Live Map</Link>
                        <Link href="/leaderboard" onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-blue-600">Leaderboard</Link>
                        <button onClick={() => { setIsAdminModalOpen(true); setIsMenuOpen(false); }} className="text-left text-lg font-semibold">Admin</button>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: List */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-baseline justify-between">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Rankings</h1>
                                <p className="mt-2 text-gray-500 font-medium">Top contributors in your community</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden ring-1 ring-gray-200/50">
                            <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Contributor</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trust Score</span>
                            </div>

                            {loading ? (
                                <div className="divide-y divide-gray-50">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                                            <div className="w-10 h-10 rounded-full bg-gray-100" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-1/3" />
                                            </div>
                                            <div className="w-12 h-6 bg-gray-100 rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {leaders.map((leader, index) => {
                                        const isMe = leader.userId === myUserId;
                                        return (
                                            <div key={leader.userId} className={`flex items-center p-6 gap-6 transition-all hover:bg-blue-50/20 ${isMe ? 'bg-blue-50/40' : ''}`}>
                                                <div className="w-8 flex-shrink-0 text-center text-sm font-bold text-gray-300">
                                                    {index < 3 ? (
                                                        <Medal className={`w-5 h-5 mx-auto ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>

                                                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-gray-500 ${isMe ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100'}`}>
                                                    {leader.userId.slice(0, 2).toUpperCase()}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-gray-900 truncate flex items-center gap-2">
                                                        User {leader.userId.slice(0, 8)}…
                                                        {isMe && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">YOU</span>}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-xs text-gray-500 flex items-center gap-1"><FileText className="w-3 h-3" />{leader.reports}</span>
                                                        <span className="text-xs text-gray-500 flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{leader.votes_received}</span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-lg font-extrabold text-gray-900 leading-none">{leader.score}</div>
                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-1">Trust pts</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Hero & Rules */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Status Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-700" />
                            <div className="relative z-10">
                                <div className="text-xs font-bold uppercase tracking-widest text-blue-100 mb-2">My Standing</div>
                                <div className="text-5xl font-extrabold tracking-tighter mb-4">
                                    {myRank >= 0 ? `#${myRank + 1}` : '—'}
                                </div>
                                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mb-6">
                                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: myRank >= 0 ? '65%' : '0%' }} />
                                </div>
                                <p className="text-sm text-blue-50 leading-relaxed font-medium">
                                    Keep reporting local issues to increase your trust score and community influence.
                                </p>
                            </div>
                        </div>

                        {/* Rules Card */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm ring-1 ring-gray-200/50">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Growth Track
                            </h3>
                            <div className="space-y-6">
                                {[
                                    { label: 'Submit Report', sub: 'Verified incidents', pts: '+10', icon: <FileText className="w-4 h-4" /> },
                                    { label: 'Community Vouch', sub: 'Upvotes received', pts: '+03', icon: <ThumbsUp className="w-4 h-4" /> },
                                    { label: 'Issue Resolution', sub: 'Status updated', pts: 'Bonus', icon: <Star className="w-4 h-4" /> },
                                ].map(rule => (
                                    <div key={rule.label} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            {rule.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-gray-900">{rule.label}</div>
                                            <div className="text-[10px] text-gray-500 font-medium">{rule.sub}</div>
                                        </div>
                                        <div className="text-sm font-black text-blue-600">{rule.pts}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex justify-center gap-4">
                            <button className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Twitter</button>
                            <span className="text-gray-200">/</span>
                            <button className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Discord</button>
                            <span className="text-gray-200">/</span>
                            <button className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Share</button>
                        </div>
                    </div>

                </div>
            </main>

            <AdminLoginModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />
        </div>
    );
}
