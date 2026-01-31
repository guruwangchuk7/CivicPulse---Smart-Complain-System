'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Plus, MapPin, List, Trophy } from 'lucide-react';
import Link from 'next/link';
import Chatbot from './Chatbot';
import CreateReportModal from './CreateReportModal';
import NearbyFeed from './NearbyFeed';
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

    // Mock User ID for MVP
    const currentUserId = 'mock-user-id';

    // Default to London for now, can use geolocation later
    const defaultCenter: [number, number] = [51.505, -0.09];

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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setNewReportLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback to manual selection if geolocation fails
                }
            );
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
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full font-medium">{report.status}</span>
                </div>
            </div>
        )
    }));


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
            {(!isReporting || !newReportLocation) && (
                <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-4">
                    <Link
                        href="/leaderboard"
                        className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                        aria-label="Leaderboard"
                    >
                        <Trophy className="w-6 h-6 text-yellow-500" />
                    </Link>

                    <button
                        onClick={() => setShowFeed(!showFeed)}
                        className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                        aria-label="Toggle Feed"
                    >
                        <List className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleStartReporting}
                        className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center animate-bounce-subtle"
                        aria-label="Report Issue"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="ml-2 font-medium">Report</span>
                    </button>
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
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-black/80 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium text-sm">Tap location on map</span>
                        <button onClick={() => setIsReporting(false)} className="ml-4 text-xs bg-white/20 px-2 py-1 rounded hover:bg-white/30">Cancel</button>
                    </div>
                </div>
            )}

            <CreateReportModal
                isOpen={!!newReportLocation}
                onClose={() => setNewReportLocation(null)}
                location={newReportLocation}
                onSuccess={handleReportSuccess}
            />

            <Chatbot />
        </div>
    );
}
