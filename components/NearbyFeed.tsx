'use client';

import { Report } from '@/types';
import { ChevronUp, MapPin, Flame } from 'lucide-react';

interface NearbyFeedProps {
    reports: Report[];
    userLocation: { lat: number; lng: number } | null;
    onSelectReport: (report: Report) => void;
    currentUserId: string;
}

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'POTHOLE': return 'bg-red-100 text-red-700 border-red-200';
        case 'TRASH': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        case 'HAZARD': return 'bg-orange-100 text-orange-700 border-orange-200';
        default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
};

const CAT_EMOJI: Record<string, string> = {
    POTHOLE: '🕳️',
    TRASH: '🗑️',
    HAZARD: '⚠️',
    OTHER: '📍',
};

export default function NearbyFeed({ reports, onSelectReport }: NearbyFeedProps) {
    // Sort by priority_score (already computed by API) descending
    const sorted = [...reports].sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));

    return (
        <div className="bg-white dark:bg-gray-900 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col h-[60vh] sm:h-auto sm:max-h-[80vh] border-t border-gray-200 dark:border-gray-800">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Title */}
            <div className="px-4 pb-3 border-b dark:border-gray-800 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        Nearby Issues
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">Sorted by priority score</p>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full font-medium">
                    {reports.length} reports
                </span>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-3 space-y-2.5">
                {sorted.map((report) => (
                    <FeedItem key={report.id} report={report} onClick={() => onSelectReport(report)} />
                ))}
                {sorted.length === 0 && (
                    <div className="text-center text-gray-400 py-12 flex flex-col items-center gap-2">
                        <MapPin className="w-8 h-8 opacity-30" />
                        <p className="text-sm">No reports found. Be the first!</p>
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
            className={`border dark:border-gray-800 rounded-2xl p-3.5 flex gap-3.5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${isHighPriority ? 'border-red-200 bg-red-50/30' : 'bg-white dark:bg-gray-900 hover:border-gray-300'}`}
        >
            {/* Thumbnail */}
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden">
                {report.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={report.photo_url} alt="Report" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                        {CAT_EMOJI[report.category] || '📍'}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(report.category)}`}>
                        {report.category}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 mb-2 leading-snug">
                    {report.description || <span className="italic text-gray-400">No description provided</span>}
                </p>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <ChevronUp className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-bold">{votes}</span>
                    </div>
                    {isHighPriority && (
                        <div className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                            <Flame className="w-3.5 h-3.5" />
                            High Priority
                        </div>
                    )}
                    <span className={`text-xs font-semibold ml-auto px-2 py-0.5 rounded-full ${report.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : report.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {report.status === 'IN_PROGRESS' ? 'PENDING' : report.status}
                    </span>
                </div>
            </div>
        </div>
    );
}
