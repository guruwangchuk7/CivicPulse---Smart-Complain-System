'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Plus, MapPin, List, Trophy, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Chatbot from './Chatbot';
import CreateReportModal from './CreateReportModal';
import NearbyFeed from './NearbyFeed';
import ReportDetailDrawer from './ReportDetailDrawer';
import { ThemeToggle } from './ThemeToggle';
import { getOrCreateUserId } from '@/lib/user';
import { Report } from '@/types';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
});



export default function MapHome() {
    const { data: reports = [], mutate: fetchReports } = useSWR<Report[]>('/api/reports', fetcher, { revalidateOnFocus: true });

    const [isReporting, setIsReporting] = useState(false);
    const [showFeed, setShowFeed] = useState(false);
    const [newReportLocation, setNewReportLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [currentMapCenter, setCurrentMapCenter] = useState<{ lat: number, lng: number }>({ lat: 27.4728, lng: 89.6393 });

    const [currentUserId, setCurrentUserId] = useState<string>('');

    useEffect(() => {
        // Initialize user ID on client side
        setCurrentUserId(getOrCreateUserId());
    }, []);

    // Default to Bhutan Thimphu
    const defaultCenter: [number, number] = [27.4728, 89.6393];



    const handleLocationSelect = (lat: number, lng: number) => {
        if (isReporting) {
            setNewReportLocation({ lat, lng });
        }
    };

    const handleStartReporting = () => {
        setIsReporting(true);
        toast('Pan the map to pinpoint the exact location', { icon: '📍', duration: 4000 });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setCurrentMapCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
                },
                (error) => {
                    console.error("Error getting location:", error);
                },
                { timeout: 7000, enableHighAccuracy: true }
            );
        }
    };

    const handleConfirmLocation = () => {
        setNewReportLocation(currentMapCenter);
    };

    const handleReportSuccess = () => {
        setNewReportLocation(null);
        setIsReporting(false);
        fetchReports();
    };

    const handleSelectReportFromFeed = (report: Report) => {
        // Pan map to location
        setMapCenter([report.lat, report.lng]);
        setSelectedReport(report);
        setShowFeed(false);
    };

    const handleMarkerClick = (reportId: string) => {
        const report = reports.find(r => r.id === reportId);
        if (report) {
            setSelectedReport(report);
        }
    };

    const filteredReports = filterCategory === 'ALL'
        ? reports
        : reports.filter(report => report.category === filterCategory);

    const markers = filteredReports.map((report) => ({
        id: report.id,
        position: [report.lat, report.lng] as [number, number],
        tooltip: report.category, // Show category on hover/permanent
        category: report.category, // Pass category for custom marker icon
    }));

    const categories = [
        { id: 'ALL', label: 'All Reports' },
        { id: 'POTHOLE', label: 'Potholes' },
        { id: 'TRASH', label: 'Trash' },
        { id: 'HAZARD', label: 'Hazards' }
    ];




    return (
        <div className="relative h-[100dvh] w-full overflow-hidden bg-gray-50 flex flex-col">
            {/* Map Background */}
            <div className="absolute inset-0 z-0 h-full w-full">
                <Map
                    center={defaultCenter}
                    zoom={13}
                    flyToLocation={mapCenter}
                    // onLocationSelect removed since we use center pin
                    markers={markers}
                    onMarkerClick={handleMarkerClick}
                    onMoveEnd={(lat, lng) => setCurrentMapCenter({ lat, lng })}
                />
            </div>

            {/* Center Reticle for Reporting */}
            {isReporting && !newReportLocation && (
                <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
                    <div className="relative -mt-10 flex flex-col items-center animate-bounce-short">
                        <div className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full mb-2 shadow-lg z-10">
                            Place Pin Here
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 drop-shadow-xl z-10 transition-transform duration-200">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" fill="white" />
                        </svg>
                        <div className="absolute bottom-[-4px] w-4 h-2 bg-black/20 rounded-[100%] blur-[2px]"></div>
                    </div>
                </div>
            )}

            {/* Combined Header Card */}
            <div className={`absolute top-0 left-0 right-0 z-30 pt-4 px-4 sm:pt-6 sm:px-6 pointer-events-none transition-transform duration-300 ${isReporting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                <div className="max-w-xl mx-auto flex flex-col gap-3 pointer-events-auto">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl p-3 border border-white/50 dark:border-gray-700/50">
                        {/* Search Row */}
                        <div className="flex items-center gap-3 px-2 mb-3">
                            <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <div className="flex-1 text-sm font-medium text-gray-400 cursor-pointer" onClick={() => setShowFeed(true)}>
                                Explore nearby issues...
                            </div>
                            <ThemeToggle />
                        </div>

                        {/* Filter Chips */}
                        <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar px-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.id)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${filterCategory === cat.id
                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md'
                                        : 'bg-gray-100/50 text-gray-600 border-transparent hover:bg-gray-200 dark:bg-gray-800/50 dark:text-gray-300 hover:shadow-sm'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Side Action Buttons (Right Aligned Stack) */}
            <div className={`absolute right-4 sm:right-6 bottom-24 sm:bottom-32 z-30 flex flex-col gap-3 pointer-events-none items-end pb-safe transition-transform duration-300 ${isReporting ? 'translate-x-24 opacity-0' : 'translate-x-0 opacity-100'}`}>
                {/* Leaderboard */}
                <Link
                    href="/leaderboard"
                    className="pointer-events-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-[1.05] focus:outline-none flex items-center justify-center w-12 h-12"
                    aria-label="Leaderboard"
                >
                    <Trophy className="w-5 h-5 text-yellow-500" />
                </Link>

                {/* Nearby Feed */}
                <button
                    onClick={() => setShowFeed(!showFeed)}
                    className="pointer-events-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-[1.05] focus:outline-none flex items-center justify-center w-12 h-12"
                    aria-label="Nearby Feed"
                >
                    <List className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>

                {/* Locate Me Button */}
                <button
                    onClick={() => {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                                },
                            );
                        }
                    }}
                    className="mt-2 pointer-events-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-[1.05] focus:outline-none flex items-center justify-center w-12 h-12"
                    aria-label="My Location"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                </button>
            </div>

            {/* Bottom Primary Action */}
            <div className="absolute inset-x-0 bottom-6 sm:bottom-8 z-30 flex justify-center pointer-events-none pb-safe px-4">
                {!isReporting ? (
                    <button
                        onClick={handleStartReporting}
                        className="pointer-events-auto w-full max-w-sm flex items-center justify-center bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                        <div className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            <span className="text-base font-bold">Report Issue</span>
                        </div>
                    </button>
                ) : (
                    <div className="pointer-events-auto w-full max-w-sm flex gap-2">
                        <button
                            onClick={() => setIsReporting(false)}
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all w-16 flex items-center justify-center border border-gray-200 dark:border-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleConfirmLocation}
                            className="flex-1 flex items-center justify-center bg-blue-600 text-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.4)] hover:bg-blue-700 active:scale-95 transition-all duration-300"
                        >
                            <span className="text-base font-bold">Confirm Location</span>
                        </button>
                    </div>
                )}
            </div>



            {/* Nearby Feed Bottom Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-40 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) transform ${showFeed ? 'translate-y-0' : 'translate-y-full'}`}
            >
                {showFeed && (
                    <div className="w-full max-w-3xl mx-auto shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl overflow-hidden relative">
                        <NearbyFeed
                            reports={reports}
                            userLocation={{ lat: defaultCenter[0], lng: defaultCenter[1] }}
                            onSelectReport={handleSelectReportFromFeed}
                            currentUserId={currentUserId}
                            onClose={() => setShowFeed(false)}
                        />
                    </div>
                )}
            </div>

            <CreateReportModal
                isOpen={!!newReportLocation}
                onClose={() => {
                    setNewReportLocation(null);
                    setIsReporting(false);
                }}
                location={newReportLocation}
                onSuccess={handleReportSuccess}
                userId={currentUserId}
            />

            <ReportDetailDrawer
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                report={selectedReport}
                currentUserId={currentUserId}
            />

            <Chatbot />
        </div>
    );
}
