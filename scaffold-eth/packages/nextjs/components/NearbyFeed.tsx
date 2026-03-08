'use client';

import { useState } from 'react';
import { Report } from '@/types';
import { ChevronUp, MapPin, Flame, X, ChevronDown } from 'lucide-react';

interface NearbyFeedProps {
    reports: Report[];
    userLocation: { lat: number; lng: number } | null;
    onSelectReport: (report: Report) => void;
    currentUserId: string;
    onClose?: () => void;
}

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'POTHOLE': return 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20';
        case 'TRASH': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
        case 'HAZARD': return 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20';
        default: return 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    }
};

const CAT_EMOJI: Record<string, string> = {
    POTHOLE: '🕳️',
    TRASH: '🗑️',
    HAZARD: '⚠️',
    OTHER: '📍',
};

export default function NearbyFeed({ reports, onSelectReport, onClose }: NearbyFeedProps) {
    const [visibleCount, setVisibleCount] = useState(20);
    const [activeTab, setActiveTab] = useState<string>('ALL');

    const filtered = activeTab === 'ALL' ? reports : reports.filter(r => r.category === activeTab);

    // Sort by priority_score (already computed by API) descending
    const sorted = [...filtered].sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
    const visibleReports = sorted.slice(0, visibleCount);
    const hasMore = visibleCount < sorted.length;

    return (
        <div className="bg-white/95 dark:bg-[#0B0C10]/95 backdrop-blur-3xl rounded-t-[36px] shadow-[0_-12px_40px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col h-[70vh] sm:h-auto sm:max-h-[85vh] border-t border-white/40 dark:border-white/5 ring-1 ring-black/5 dark:ring-white/5">
            {/* Header Area (Sticky) */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#0B0C10]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 flex flex-col">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-14 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full" />
                </div>

                {/* Title */}
                <div className="px-6 pt-2 pb-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2 tracking-tight">
                            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Nearby Issues
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">Community-driven reports</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-95"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Segregation Tabs */}
                <div className="px-6 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {['ALL', 'POTHOLE', 'TRASH', 'HAZARD', 'OTHER'].map(tab => {
                        const count = tab === 'ALL' ? reports.length : reports.filter(r => r.category === tab).length;
                        if (tab !== 'ALL' && count === 0) return null; // Hide empty categories to keep UI clean

                        return (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setVisibleCount(20); }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${activeTab === tab
                                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                                        : 'bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {tab === 'ALL' ? 'All' : tab}
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab
                                        ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black'
                                        : 'bg-white dark:bg-white/10 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 pb-8 space-y-4 custom-scrollbar">
                {visibleReports.map((report) => (
                    <FeedItem key={report.id} report={report} onClick={() => onSelectReport(report)} />
                ))}

                {sorted.length === 0 && (
                    <div className="text-center text-gray-400 py-16 flex flex-col items-center gap-3">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/5">
                            <MapPin className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">No reports found. Be the first!</p>
                    </div>
                )}

                {hasMore && (
                    <div className="pt-4 pb-6 flex justify-center">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 20)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-full transition-all active:scale-95 border border-gray-200/50 dark:border-white/5 shadow-sm"
                        >
                            Load More Issues
                            <ChevronDown className="w-4 h-4 opacity-70" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function FeedItem({ report, onClick }: { report: Report; onClick: () => void }) {
    // vote_count is now inline from the API — no individual fetching!
    const votes = report.vote_count ?? 0;
    const isHighPriority = (report.priority_score ?? 0) > 20;

    return (
        <div
            onClick={onClick}
            className={`group rounded-[24px] p-4 flex gap-4 cursor-pointer transition-all duration-400 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 relative overflow-hidden border 
            ${isHighPriority
                    ? 'border-red-200/50 dark:border-red-500/20 bg-gradient-to-br from-red-50/50 to-white dark:from-red-900/10 dark:to-[#0B0C10]'
                    : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/10 dark:hover:bg-white/[0.04]'}`}
        >
            {/* Thumbnail */}
            <div className="w-[88px] h-[88px] bg-gray-50 dark:bg-white/[0.02] rounded-[18px] flex-shrink-0 overflow-hidden relative shadow-inner ring-1 ring-black/5 dark:ring-white/5">
                {report.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <div className="relative w-full h-full">
                        <img src={report.photo_url} alt="Report" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/[0.02] dark:to-white/[0.05]">
                        {CAT_EMOJI[report.category] || '📍'}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${getCategoryColor(report.category)}`}>
                        {report.category}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500/80">
                        {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>

                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2 mb-3 leading-snug">
                    {report.description || <span className="italic text-gray-400 dark:text-gray-600">No description provided</span>}
                </p>

                <div className="flex items-center gap-3 mt-auto">
                    <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-500/20 shadow-sm">
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{votes}</span>
                    </div>
                    {isHighPriority && (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-lg border border-red-100 dark:border-red-500/20 shadow-sm">
                            <Flame className="w-3.5 h-3.5 animate-pulse" />
                            Hot
                        </div>
                    )}
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold ml-auto px-2.5 py-1 rounded-full shadow-sm border ${report.status === 'RESOLVED' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400' : report.status === 'IN_PROGRESS' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'}`}>
                        {report.status === 'IN_PROGRESS' ? 'PENDING' : report.status}
                    </span>
                </div>
            </div>
        </div>
    );
}
