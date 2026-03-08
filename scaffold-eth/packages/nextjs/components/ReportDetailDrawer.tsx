'use client';

import { useEffect, useState, useRef } from 'react';
import { X, MapPin, Calendar, ThumbsUp, Share2, MessageSquare, Send, Building2 } from 'lucide-react';
import { Report, Comment } from '@/types';
import toast from 'react-hot-toast';
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface ReportDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    report: Report | null;
    currentUserId: string;
}

const DEPT_LABELS: Record<string, { label: string; color: string }> = {
    ROADS: { label: 'Roads Dept.', color: 'bg-red-100 text-red-700' },
    SANITATION: { label: 'Sanitation', color: 'bg-yellow-100 text-yellow-700' },
    EMERGENCY: { label: 'Emergency', color: 'bg-orange-100 text-orange-700' },
    GENERAL: { label: 'General', color: 'bg-gray-100 text-gray-600' },
};

export default function ReportDetailDrawer({ isOpen, onClose, report, currentUserId }: ReportDetailDrawerProps) {
    const [votes, setVotes] = useState(0);
    const [isVoting, setIsVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
    const [isOnChain, setIsOnChain] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [isResolvedOnChain, setIsResolvedOnChain] = useState<boolean>(false);
    const [resolutionHash, setResolutionHash] = useState<string | null>(null);
    const commentEndRef = useRef<HTMLDivElement>(null);

    // [WEB2.5] Check Blockchain Status using Scaffold-Eth Hook
    const { data: onChainData } = useScaffoldReadContract({
        contractName: "CivicPulse",
        functionName: "reports",
        args: [report?.id],
    });

    useEffect(() => {
        if (onChainData && onChainData[3] > BigInt(0)) {
            setIsOnChain(true);
            setTxHash(onChainData[2]); 
            setIsResolvedOnChain(onChainData[4] === true);
            setResolutionHash(onChainData[5]);
        } else {
            setIsOnChain(false);
            setTxHash(null);
            setIsResolvedOnChain(false);
            setResolutionHash(null);
        }
    }, [onChainData]);

    useEffect(() => {
        if (!report) return;

        // Use vote_count from report if available (from the enriched API response)
        setVotes(report.vote_count ?? 0);
        setHasVoted(false);
        setComments([]);
        setCommentText('');
        setActiveTab('details');

        // If vote_count not in report, fetch it
        if (report.vote_count === undefined) {
            fetch(`/api/reports/${report.id}/upvote`)
                .then(res => res.json())
                .then(data => setVotes(data.count || 0))
                .catch(console.error);
        }

        // Fetch comments
        fetch(`/api/reports/${report.id}/comments`)
            .then(res => res.json())
            .then(data => Array.isArray(data) && setComments(data))
            .catch(console.error);
    }, [report]);

    useEffect(() => {
        if (activeTab === 'comments') {
            commentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments, activeTab]);

    const handleVote = async () => {
        if (!report || isVoting) return;
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
                setHasVoted(data.voted);
                toast.success(data.voted ? '👍 Upvoted!' : 'Vote removed');
            } else {
                toast.error('Failed to vote');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsVoting(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!report || !commentText.trim() || isSubmittingComment) return;
        setIsSubmittingComment(true);
        try {
            const res = await fetch(`/api/reports/${report.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId, text: commentText.trim() }),
            });
            if (res.ok) {
                const comment = await res.json();
                setComments(prev => [...prev, comment]);
                setCommentText('');
                toast.success('Comment added!');
            } else {
                toast.error('Failed to add comment');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleShare = async () => {
        const url = `${window.location.origin}/map?report=${report?.id}`;
        try {
            await navigator.share?.({ title: 'CivicPulse Report', url });
        } catch {
            await navigator.clipboard?.writeText(url);
            toast.success('Link copied!');
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

    const dept = DEPT_LABELS[report.department || 'GENERAL'] || DEPT_LABELS.GENERAL;

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
            <div className={`fixed inset-y-0 right-0 w-full sm:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex-shrink-0 flex items-start justify-between p-5 border-b">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getCategoryColor(report.category)} uppercase tracking-wide`}>
                                {report.category}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dept.color} flex items-center gap-1`}>
                                <Building2 className="w-3 h-3" />{dept.label}
                            </span>
                            {(report.priority_score ?? 0) > 20 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                                    🔥 High Priority
                                </span>
                            )}
                            {isOnChain && (
                                <a 
                                    href={`https://sepolia.basescan.org/tx/${txHash}`} // Target network scanner explorer
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 hover:bg-purple-200 transition-colors"
                                    title="This report is cryptographically anchored to the blockchain."
                                >
                                    🔗 On-Chain Verified
                                </a>
                            )}
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-900">
                            {report.category === 'POTHOLE' ? 'Pothole Reported' :
                                report.category === 'TRASH' ? 'Trash Accumulation' :
                                    report.category === 'HAZARD' ? 'Safety Hazard' : 'Community Issue'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Bar */}
                <div className="flex-shrink-0 flex border-b">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'details' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${activeTab === 'comments' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Comments
                        {comments.length > 0 && (
                            <span className="bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                {comments.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'details' && (
                        <>
                            {/* Photo */}
                            {report.photo_url ? (
                                <div className="w-full h-56 bg-gray-100 relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={report.photo_url} alt={report.category} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                            ) : (
                                <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-gray-300">
                                    <MapPin className="w-8 h-8" />
                                </div>
                            )}

                            {/* Decentralized Proof Banner */}
                            {isResolvedOnChain && (
                                <div className="mx-5 mt-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-green-800 font-bold text-sm">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        Repair Verified on Blockchain
                                    </div>
                                    <p className="text-xs text-green-700/80 leading-relaxed">
                                        The municipality has cryptographically signed the completion of this repair. 
                                    </p>
                                    <div className="text-[10px] font-mono text-green-800/60 break-all bg-green-100/50 p-2 rounded-lg mt-1 border border-green-200/50">
                                        Proof Hash: {resolutionHash}
                                    </div>
                                </div>
                            )}

                            <div className="p-5 space-y-6">
                                {/* Description */}
                                {report.description && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                                        <p className="text-gray-800 leading-relaxed">{report.description}</p>
                                    </div>
                                )}

                                {/* Status + Date + Priority grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${report.status === 'RESOLVED' ? 'bg-green-500' : report.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                            <span className="text-xs font-semibold text-gray-900">
                                                {report.status === 'IN_PROGRESS' ? 'In Review' : report.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Reported</div>
                                        <div className="flex items-center gap-1 text-gray-900">
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs font-semibold">
                                                {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Priority</div>
                                        <div className="text-xs font-bold text-gray-900">
                                            {(report.priority_score ?? 0) > 20 ? '🔥 High' : (report.priority_score ?? 0) > 10 ? '⚡ Med' : '🟢 Low'}
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Coordinates</p>
                                        <p className="font-mono text-sm text-gray-800">{report.lat.toFixed(6)}, {report.lng.toFixed(6)}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'comments' && (
                        <div className="p-5 space-y-3">
                            {comments.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No comments yet. Be the first!</p>
                                </div>
                            ) : (
                                comments.map(c => (
                                    <div key={c.id} className={`flex gap-3 ${c.user_id === currentUserId ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${c.user_id === currentUserId ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                                            {c.user_id.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${c.user_id === currentUserId ? 'bg-black text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                                            <p className="text-sm leading-relaxed">{c.text}</p>
                                            <p className={`text-[10px] mt-1 ${c.user_id === currentUserId ? 'text-gray-400' : 'text-gray-400'}`}>
                                                {new Date(c.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={commentEndRef} />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {activeTab === 'details' && (
                    <div className="flex-shrink-0 border-t bg-white p-4 flex items-center gap-3">
                        <button
                            onClick={handleVote}
                            disabled={isVoting}
                            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold transition-all active:scale-95 ${hasVoted
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-black text-white hover:bg-gray-800 shadow-lg'
                                }`}
                        >
                            <ThumbsUp className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} />
                            {hasVoted ? 'Voted' : 'Upvote'}
                            <span className={`text-sm px-2 py-0.5 rounded-lg ${hasVoted ? 'bg-green-100' : 'bg-white/20'}`}>
                                {votes}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            className="p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div className="flex-shrink-0 border-t bg-white p-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                                placeholder="Add a comment..."
                                maxLength={500}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400"
                            />
                            <button
                                onClick={handleSubmitComment}
                                disabled={!commentText.trim() || isSubmittingComment}
                                className="p-2.5 rounded-xl bg-black text-white disabled:opacity-30 transition-all hover:bg-gray-800 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
