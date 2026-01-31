'use client';

import { useState, useEffect } from 'react';
import { Report } from '@/types';
import { ChevronUp, MapPin } from 'lucide-react';

interface NearbyFeedProps {
    reports: Report[];
    userLocation: { lat: number; lng: number } | null;
    onSelectReport: (report: Report) => void;
    // We'll pass a simple "currentUserId" mock for now
    currentUserId: string;
}

export default function NearbyFeed({ reports, onSelectReport, currentUserId }: NearbyFeedProps) {
    // Mock sorting: simply by vote count (we need to fetch votes or have them in the report object)
    // For MVP speed, let's assume we fetch votes client side or just show them unsorted initially
    // Ideally, 'reports' prop should include 'vote_count'.

    return (
        <div className="bg-white rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col h-[50vh] sm:h-auto sm:max-h-[80vh]">
            <div className="p-4 border-b bg-gray-50 flex justify-center">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Nearby Issues</h2>
                <p className="text-gray-500 text-sm">Sorted by urgency</p>
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-4">
                {reports.map((report) => (
                    <FeedItem key={report.id} report={report} onClick={() => onSelectReport(report)} />
                ))}
                {reports.length === 0 && (
                    <div className="text-center text-gray-400 py-10">
                        No reports found nearby.
                    </div>
                )}
            </div>
        </div>
    );
}

function FeedItem({ report, onClick }: { report: Report; onClick: () => void }) {
    const [votes, setVotes] = useState(0);

    // Fetch initial votes (This is n+1 fetching, bad for scale but fine for Hackathon MVP)
    useEffect(() => {
        fetch(`/api/reports/${report.id}/upvote`)
            .then(res => res.json())
            .then(data => setVotes(data.count || 0));
    }, [report.id]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'POTHOLE': return 'bg-red-100 text-red-700 border-red-200';
            case 'TRASH': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'HAZARD': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    return (
        <div
            onClick={onClick}
            className="border rounded-xl p-4 flex gap-4 hover:border-black cursor-pointer transition-colors bg-white shadow-sm"
        >
            {/* Thumbnail */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {report.photo_url ? (
                    <img src={report.photo_url} alt="Report" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <MapPin className="w-6 h-6" />
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
                        {new Date(report.created_at).toLocaleDateString()}
                    </span>
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                    {report.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <ChevronUp className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-800">{votes}</span>
                    </div>
                    <span className="text-xs">{report.status}</span>
                </div>
            </div>
        </div>
    );
}
