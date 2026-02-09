'use client';

import { useEffect, useState } from 'react';
import { X, MapPin, Calendar, ThumbsUp, MessageSquare, Share2, ChevronUp } from 'lucide-react';
import { Report } from '@/types';
import toast from 'react-hot-toast';

interface ReportDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    report: Report | null;
    currentUserId: string;
}

export default function ReportDetailDrawer({ isOpen, onClose, report, currentUserId }: ReportDetailDrawerProps) {
    const [votes, setVotes] = useState(0);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (report) {
            // Fetch vote count
            fetch(`/api/reports/${report.id}/upvote`)
                .then(res => res.json())
                .then(data => {
                    setVotes(data.count || 0);
                    // Ideally we should check if the user has already voted
                    // But for this MVP, we might rely on local storage or just let them try to vote again
                })
                .catch(err => console.error('Failed to fetch votes', err));

            // For MVP, reset hasVoted state on report change unless we persist it
            setHasVoted(false);
        }
    }, [report]);

    const handleVote = async () => {
        if (!report || isVoting || hasVoted) return;

        setIsVoting(true);
        try {
            const res = await fetch(`/api/reports/${report.id}/upvote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId }),
            });

            if (res.ok) {
                const data = await res.json();
                setVotes(data.count);
                setHasVoted(true);
                toast.success('Vote recorded!');
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to vote');
            }
        } catch (error) {
            console.error('Vote error:', error);
            toast.error('Something went wrong');
        } finally {
            setIsVoting(false);
        }
    };

    if (!report) return null;

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'POTHOLE': return 'bg-red-100 text-red-700 border-red-200';
            case 'TRASH': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'HAZARD': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer Panel */}
            <div
                className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryColor(report.category)} uppercase tracking-wide`}>
                            {report.category}
                        </span>
                        <h2 className="mt-2 text-2xl font-extrabold text-gray-900 leading-tight">
                            {report.category === 'POTHOLE' ? 'Pothole Reported' :
                                report.category === 'TRASH' ? 'Trash Accumulation' :
                                    report.category === 'HAZARD' ? 'Safety Hazard' : 'Community Issue'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Scrollable Area */}
                <div className="h-full overflow-y-auto pb-32">
                    {/* Image */}
                    {report.photo_url ? (
                        <div className="w-full h-64 sm:h-80 bg-gray-100 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={report.photo_url}
                                alt={report.category}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <MapPin className="w-5 h-5" /> No photo available
                            </span>
                        </div>
                    )}

                    {/* Details */}
                    <div className="p-6 space-y-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Description</h3>
                            <p className="text-gray-800 text-lg leading-relaxed">
                                {report.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</h3>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${report.status === 'RESOLVED' ? 'bg-green-500' : report.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                    <span className="font-semibold text-gray-900">
                                        {report.status === 'IN_PROGRESS' ? 'In Review' : report.status}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reported On</h3>
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {new Date(report.created_at).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Location Mini Map Placeholder (Could be real later) */}
                        <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-4 flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Location Coordinates</p>
                                <p className="font-mono text-sm text-gray-800">{report.lat.toFixed(6)}, {report.lng.toFixed(6)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 p-6 flex items-center justify-between gap-4 z-50">
                    <button
                        onClick={handleVote}
                        disabled={hasVoted || isVoting}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${hasVoted
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-black text-white hover:bg-gray-800 shadow-xl shadow-gray-200'
                            }`}
                    >
                        {hasVoted ? (
                            <>
                                <ThumbsUp className="w-5 h-5 fill-current" /> Voted
                            </>
                        ) : (
                            <>
                                <ThumbsUp className="w-5 h-5" /> Upvote Issue
                            </>
                        )}
                        <span className="ml-1 bg-white/20 px-2 py-0.5 rounded text-sm text-white/90">
                            {votes}
                        </span>
                    </button>

                    <button className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </>
    );
}
