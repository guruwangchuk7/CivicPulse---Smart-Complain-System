'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Plus, MapPin, List, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Chatbot from './Chatbot';
import CreateReportModal from './CreateReportModal';
import NearbyFeed from './NearbyFeed';
import { getOrCreateUserId } from '@/lib/user';
import { Report } from '@/types';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
});

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'POTHOLE': return 'bg-red-500';
        case 'TRASH': return 'bg-yellow-500';
        case 'HAZARD': return 'bg-orange-500';
        case 'OTHER': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
};

export default function MapHome() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isReporting, setIsReporting] = useState(false);
    const [showFeed, setShowFeed] = useState(false);
    const [newReportLocation, setNewReportLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [currentUserId, setCurrentUserId] = useState<string>('');

    useEffect(() => {
        // Initialize user ID on client side
        setCurrentUserId(getOrCreateUserId());
    }, []);

    // Default to Bhutan Thimphu
    const defaultCenter: [number, number] = [27.4728, 89.6393];

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/reports');
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Failed to fetch reports', error);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleLocationSelect = (lat: number, lng: number) => {
        if (isReporting) {
            setNewReportLocation({ lat, lng });
        }
    };

    const handleStartReporting = () => {
        setIsReporting(true);
        const toastId = toast.loading('Locating you...');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    toast.dismiss(toastId);
                    toast.success('Location found!');
                    setNewReportLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    toast.dismiss(toastId);
                    console.error("Error getting location:", error);
                    // Don't show an "error" toast, show a helpful instruction instead
                    toast('📍 Tap anywhere on the map to place the pin', {
                        icon: '👇',
                        duration: 5000
                    });
                },
                { timeout: 7000, enableHighAccuracy: true }
            );
        } else {
            toast.dismiss(toastId);
            toast('Tap on the map to report', { icon: '📍' });
        }
    };

    const handleReportSuccess = () => {
        setNewReportLocation(null);
        setIsReporting(false);
        fetchReports();
    };

    const handleSelectReportFromFeed = (report: Report) => {
        // In future: Pan map to location
        console.log('Selected report:', report);
        setShowFeed(false);
    };

    const markers = reports.map((report) => ({
        id: report.id,
        position: [report.lat, report.lng] as [number, number],
        tooltip: report.category, // Show category on hover/permanent
        content: (
            <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getCategoryColor(report.category)}`} />
                    <span className="font-bold text-sm tracking-wide">{report.category}</span>
                    <span className="text-xs text-gray-400 ml-auto">{new Date(report.created_at).toLocaleDateString()}</span>
                </div>

                {report.photo_url && (
                    <div className="w-full h-24 mb-2 rounded bg-gray-100 overflow-hidden relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={report.photo_url} alt={report.category} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                )}

                <p className="text-sm text-gray-700 line-clamp-3">{report.description}</p>
                <div className="mt-3 flex items-center justify-between">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${contextStatusColor(report.status)}`}>
                        {report.status === 'IN_PROGRESS' ? 'PENDING' : report.status}
                    </span>
                </div>
            </div>
        )
    }));

    function contextStatusColor(status: string) {
        switch (status) {
            case 'RESOLVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-red-50 text-red-600 border-red-100';
        }
    }


    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <Map
                    center={defaultCenter}
                    zoom={13}
                    onLocationSelect={handleLocationSelect}
                    markers={markers}
                />
            </div>

            {/* Floating Action Button */}
            {/* Premium Floating Action Bar */}
            {(!isReporting || !newReportLocation) && (
                <div className="absolute bottom-8 left-6 right-6 z-10 flex items-end justify-between pointer-events-none">
                    {/* Left Actions */}
                    <div className="flex flex-col gap-3 pointer-events-auto">
                        <Link
                            href="/leaderboard"
                            className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-105 border border-white/20"
                        >
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </Link>
                        <button
                            onClick={() => setShowFeed(!showFeed)}
                            className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg hover:bg-white transition-all hover:scale-105 border border-white/20"
                        >
                            <List className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>

                    {/* Center Report Button - Premium Card Style */}
                    <button
                        onClick={handleStartReporting}
                        className="pointer-events-auto group relative flex items-center justify-center bg-black text-white px-8 py-4 rounded-2xl shadow-2xl hover:bg-gray-900 transition-all hover:scale-105 hover:-translate-y-1 active:scale-95"
                    >
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold leading-none">Report Issue</span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-wide">EARN POINTS</span>
                            </div>
                        </div>
                    </button>

                    {/* Right spacer for balance or future button */}
                    <div className="w-12" />
                </div>
            )}

            {/* Nearby Feed Bottom Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-20 transition-transform duration-300 ease-in-out transform ${showFeed ? 'translate-y-0' : 'translate-y-full'}`}
            >
                {showFeed && (
                    <NearbyFeed
                        reports={reports}
                        userLocation={{ lat: defaultCenter[0], lng: defaultCenter[1] }}
                        onSelectReport={handleSelectReportFromFeed}
                        currentUserId={currentUserId}
                    />
                )}
            </div>

            {/* Instruction Overlay when reporting */}
            {isReporting && !newReportLocation && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-black/90 text-white px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col items-center gap-2 border border-white/20">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-blue-400 animate-bounce" />
                            <span className="font-bold text-lg">Tap location on map</span>
                        </div>
                        <p className="text-xs text-gray-400">Pinpoint the issue to continue</p>
                        <button
                            onClick={() => setIsReporting(false)}
                            className="mt-2 w-full py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <CreateReportModal
                isOpen={!!newReportLocation}
                onClose={() => setNewReportLocation(null)}
                location={newReportLocation}
                onSuccess={handleReportSuccess}
                userId={currentUserId}
            />

            <Chatbot />
        </div>
    );
}
