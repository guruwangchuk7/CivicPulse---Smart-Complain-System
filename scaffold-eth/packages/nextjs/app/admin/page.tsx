

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, CheckCircle, Clock, AlertCircle, RefreshCw,
    BarChart3, Users, Zap, TrendingUp, Building2,
    LayoutDashboard, FileText, BarChart, MessageSquare, Settings,
    Search, Bell, LogOut, ChevronRight
} from 'lucide-react';
import { Report } from '@/types';
import toast from 'react-hot-toast';
import ReportDetailDrawer from '@/components/ReportDetailDrawer';
import { getOrCreateUserId } from '@/lib/user';
import useSWR from 'swr';
import { createClient } from '@/utils/supabase/client';
import { isAdmin } from '@/lib/admin';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Analytics {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    avg_resolution_hours: string | null;
    by_category: { category: string; count: number }[];
    by_department: { department: string; total: number; open_count: number; resolved: number }[];
    trends: { date: string; count: number }[];
}

const DEPT_COLORS: Record<string, string> = {
    ROADS: 'bg-red-100 text-red-700',
    SANITATION: 'bg-yellow-100 text-yellow-700',
    EMERGENCY: 'bg-orange-100 text-orange-700',
    GENERAL: 'bg-blue-100 text-blue-700',
};

const CAT_EMOJI: Record<string, string> = {
    POTHOLE: '🕳️',
    TRASH: '🗑️',
    HAZARD: '⚠️',
    OTHER: '📍',
};

function StatCard({
    icon, label, value, sub, color, onClick
}: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string; onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`rounded-3xl p-6 bg-white border border-gray-100 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col gap-4 ${onClick ? 'cursor-pointer hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:border-gray-200 hover:-translate-y-1.5' : ''}`}
        >
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">{label}</span>
                <span className={`p-2.5 rounded-2xl ${color}`}>{icon}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <div className="text-4xl font-semibold tracking-tight text-gray-900 leading-none">{value}</div>
                {sub && <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{sub}</div>}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { data: reports = [], mutate: mutateReports, isLoading: loadingReports } = useSWR<Report[]>('/api/reports', fetcher, { revalidateOnFocus: true });
    const { data: analytics, mutate: mutateAnalytics, isLoading: loadingAnalytics } = useSWR<Analytics>('/api/analytics', fetcher, { revalidateOnFocus: true });
    const loading = loadingReports || loadingAnalytics;

    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
    const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
    const [drawerReport, setDrawerReport] = useState<Report | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        setCurrentUserId(getOrCreateUserId());
    }, []);

    useEffect(() => {
        const verifyAdmin = async () => {
            const supabase = createClient();
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user || !isAdmin(user.email)) {
                toast.error('Unauthorized: Admin access required.');
                router.push('/');
            }
        };

        verifyAdmin();
    }, [router]);

    const fetchData = async () => {
        mutateReports();
        mutateAnalytics();
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success('Logged out securely');
        router.push('/');
    };

    const updateStatus = async (reportId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
        try {
            const res = await fetch(`/api/reports/${reportId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update');

            // Optimistic fast update
            mutateReports((prev: Report[] | undefined) => prev ? prev.map((r: Report) => r.id === reportId ? { ...r, status: newStatus } : r) : [], false);

            // Refresh analytics after status change
            mutateAnalytics();

            toast.success(`✅ Status updated to ${newStatus}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleBulkStatusUpdate = async (newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
        if (selectedRows.size === 0) return;

        try {
            const toastId = toast.loading('Updating reports...');
            const updatePromises = Array.from(selectedRows).map(id =>
                fetch(`/api/reports/${id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                })
            );

            await Promise.all(updatePromises);

            mutateReports((prev: Report[] | undefined) => prev ? prev.map((r: Report) => selectedRows.has(r.id) ? { ...r, status: newStatus } : r) : [], false);
            setSelectedRows(new Set());

            mutateAnalytics();

            toast.dismiss(toastId);
            toast.success(`✅ ${selectedRows.size} reports marked as ${newStatus}`);
        } catch {
            toast.error('Failed to update reports');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-800';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredReports = reports.filter((r: Report) => filter === 'ALL' || r.status === filter);

    const resolveRate = analytics
        ? Math.round((analytics.resolved / Math.max(analytics.total, 1)) * 100)
        : 0;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart className="w-4 h-4" /> },
        { id: 'feedback', label: 'Community Feedback', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ];

    const handleTabChange = (tab: string) => {
        if (tab === 'dashboard' || tab === 'analytics') setActiveTab('analytics');
        if (tab === 'reports') setActiveTab('reports');
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] text-gray-900 font-sans selection:bg-blue-100 flex">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen z-40">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-lg transition-transform group-hover:rotate-12">C</div>
                        <span className="text-lg font-bold tracking-tight">CivicPulse</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group ${(activeTab === 'analytics' && (item.id === 'dashboard' || item.id === 'analytics')) || (activeTab === 'reports' && item.id === 'reports')
                                ? 'bg-black text-white shadow-2xl shadow-black/20 scale-[1.02]'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="tracking-tight">{item.label}</span>
                            </div>
                            {item.id === 'dashboard' && <ChevronRight className="w-4 h-4 opacity-30 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Global Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-6 flex-1 max-w-xl">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reports, users, or locations..."
                                className="w-full bg-[#F7F7F7] border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-black/5 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-2xl bg-[#F7F7F7] text-gray-500 hover:bg-gray-200 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-10 w-[1px] bg-gray-100 mx-2"></div>

                        <div className="flex items-center gap-4 pl-2 group cursor-pointer border-l border-gray-100 ml-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold leading-none mb-1 group-hover:text-black">Guru Wangchuk</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white font-black text-xs shadow-xl shadow-black/10 transition-transform group-hover:scale-110">
                                GW
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-[1400px] mx-auto space-y-10">
                        {/* Tab Switcher (Floating Style) */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-gray-900 capitalize">
                                    {activeTab === 'analytics' ? 'Dashboard Overview' : 'Report Management'}
                                </h2>
                                <p className="text-gray-400 font-medium mt-1">
                                    {activeTab === 'analytics' ? 'Real-time monitoring of civic activity' : 'Manage and resolve community issues'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                                {(['reports', 'analytics'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                                            ? 'bg-black text-white shadow-lg shadow-black/10'
                                            : 'text-gray-400 hover:text-gray-900'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Analytics Tab */}
                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard
                                        icon={<BarChart3 className="w-5 h-5" />}
                                        label="Total Reports"
                                        value={analytics?.total ?? '—'}
                                        sub="Growth +12%"
                                        color="bg-blue-100/50 text-blue-600 shadow-blue-500/10"
                                        onClick={() => { setFilter('ALL'); setActiveTab('reports'); }}
                                    />
                                    <StatCard
                                        icon={<AlertCircle className="w-5 h-5 animate-pulse" />}
                                        label="Active"
                                        value={analytics?.open ?? '—'}
                                        sub="High urgency"
                                        color="bg-red-100/50 text-red-600 shadow-red-500/10"
                                        onClick={() => { setFilter('OPEN'); setActiveTab('reports'); }}
                                    />
                                    <StatCard
                                        icon={<Clock className="w-5 h-5" />}
                                        label="Processing"
                                        value={analytics?.in_progress ?? '—'}
                                        sub="On schedule"
                                        color="bg-amber-100/50 text-amber-600 shadow-amber-500/10"
                                        onClick={() => { setFilter('IN_PROGRESS'); setActiveTab('reports'); }}
                                    />
                                    <StatCard
                                        icon={<CheckCircle className="w-5 h-5" />}
                                        label="Success"
                                        value={analytics?.resolved ?? '—'}
                                        sub={`${resolveRate}% Rate`}
                                        color="bg-green-100/50 text-green-600 shadow-green-500/10"
                                        onClick={() => { setFilter('RESOLVED'); setActiveTab('reports'); }}
                                    />
                                </div>

                                {/* Second Row KPIs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <StatCard
                                        icon={<Zap className="w-5 h-5" />}
                                        label="Avg Resolution Time"
                                        value={analytics?.avg_resolution_hours ? `${analytics.avg_resolution_hours}h` : 'N/A'}
                                        sub="Assign → Resolve speed"
                                        color="text-purple-600"
                                    />
                                    <StatCard
                                        icon={<TrendingUp className="w-5 h-5" />}
                                        label="Resolution Rate"
                                        value={`${resolveRate}%`}
                                        sub="Efficiency score"
                                        color="text-indigo-600"
                                    />
                                    <StatCard
                                        icon={<Users className="w-5 h-5" />}
                                        label="Backlog"
                                        value={(analytics?.open ?? 0) + (analytics?.in_progress ?? 0)}
                                        sub="Active queue"
                                        color="text-gray-900"
                                    />
                                </div>

                                {/* Category & Department Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* By Category */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">📦 By Category</h3>
                                        <div className="space-y-3">
                                            {analytics?.by_category?.map((item: { category: string; count: number }) => {
                                                const pct = Math.round((item.count / Math.max(analytics.total, 1)) * 100);
                                                return (
                                                    <div key={item.category} className="group/item">
                                                        <div className="flex justify-between items-center text-xs mb-2">
                                                            <span className="font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                                                                <span className="text-base group-hover/item:scale-125 transition-transform duration-300">{CAT_EMOJI[item.category] || '📍'}</span>
                                                                {item.category}
                                                            </span>
                                                            <span className="font-bold text-gray-900">{item.count}</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden mb-4">
                                                            <div
                                                                className="h-full bg-black rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* By Department */}
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">
                                            <Building2 className="w-4 h-4 inline mr-1" /> By Department
                                        </h3>
                                        <div className="space-y-3">
                                            {analytics?.by_department?.map((dept: { department: string; total: number; open_count: number; resolved: number }) => (
                                                <div key={dept.department} className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F7F7] border border-gray-50 hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-300">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${dept.department === 'EMERGENCY' ? 'bg-red-500' : dept.department === 'ROADS' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                                            {dept.department}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-gray-900 leading-none">{dept.total}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">reports</p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 7-Day Trend */}
                                {analytics?.trends && analytics.trends.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">📈 Reports — Last 7 Days</h3>
                                        <div className="flex items-end gap-2 h-20">
                                            {(() => {
                                                const max = Math.max(...analytics.trends.map(t => t.count), 1);
                                                return analytics.trends.map((t: { date: string; count: number }) => (
                                                    <div key={t.date} className="flex-1 flex flex-col items-center gap-1">
                                                        <div
                                                            className="w-full bg-blue-500 rounded-t-sm transition-all"
                                                            style={{ height: `${(t.count / max) * 100}%`, minHeight: '4px' }}
                                                        />
                                                        <span className="text-[9px] text-gray-400 rotate-45 origin-left">
                                                            {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reports Tab */}
                        {activeTab === 'reports' && (
                            <div className="space-y-4">
                                {/* Filter Tabs */}
                                <div className="flex gap-2 flex-wrap">
                                    {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map(s => {
                                        const label = s === 'IN_PROGRESS' ? 'PENDING' : s;
                                        const count = s === 'ALL' ? reports.length : reports.filter(r => r.status === s).length;
                                        return (
                                            <button
                                                key={s}
                                                onClick={() => setFilter(s)}
                                                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === s
                                                    ? 'bg-black text-white shadow-xl scale-105'
                                                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                                                    }`}
                                            >
                                                {label}
                                                <span className={`px-1.5 py-0.5 rounded-md ${filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-[#FDFDFD]">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Manage Reports</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Direct intervention queue</p>
                                        </div>

                                        {selectedRows.size > 0 ? (
                                            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-right-4">
                                                <span className="text-sm font-semibold text-blue-900">{selectedRows.size} selected</span>
                                                <div className="h-4 w-px bg-blue-200" />
                                                <select
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleBulkStatusUpdate(e.target.value as any);
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                    className="text-sm bg-white border border-blue-200 text-blue-800 rounded-lg px-2 py-1 outline-none cursor-pointer hover:bg-blue-50 font-medium"
                                                >
                                                    <option value="">Actions...</option>
                                                    <option value="OPEN">Mark Open</option>
                                                    <option value="IN_PROGRESS">Mark In Progress</option>
                                                    <option value="RESOLVED">Mark Resolved</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">{filteredReports.length} shown</span>
                                        )}
                                    </div>

                                    {loading ? (
                                        <div className="p-12 text-center text-gray-400">
                                            <div className="animate-pulse space-y-4">
                                                <div className="h-10 bg-gray-100 rounded w-full"></div>
                                                <div className="h-10 bg-gray-100 rounded w-full"></div>
                                                <div className="h-10 bg-gray-100 rounded w-full"></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-[#F7F7F7] text-gray-400 text-[10px] font-semibold uppercase tracking-wider border-b border-gray-100">
                                                    <tr>
                                                        <th className="p-6 w-10">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black"
                                                                checked={filteredReports.length > 0 && selectedRows.size === filteredReports.length}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedRows(new Set(filteredReports.map((r: Report) => r.id)));
                                                                    } else {
                                                                        setSelectedRows(new Set());
                                                                    }
                                                                }}
                                                            />
                                                        </th>
                                                        <th className="p-6">Date</th>
                                                        <th className="p-6">Category</th>
                                                        <th className="p-6">Department</th>
                                                        <th className="p-6">Description</th>
                                                        <th className="p-6">Priority</th>
                                                        <th className="p-6">Status</th>
                                                        <th className="p-6 text-right">Update Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {filteredReports.map((report) => {
                                                        const priorityBg = (report.priority_score || 0) > 20 ? 'bg-red-50/30' : '';

                                                        return (
                                                            <tr key={report.id} className={`hover:bg-gray-50 transition-colors group cursor-pointer ${priorityBg}`}>
                                                                <td className="p-6" onClick={(e) => e.stopPropagation()}>
                                                                    <input
                                                                        type="checkbox"
                                                                        className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                                                        checked={selectedRows.has(report.id)}
                                                                        onChange={(e) => {
                                                                            const newSet = new Set(selectedRows);
                                                                            if (e.target.checked) newSet.add(report.id);
                                                                            else newSet.delete(report.id);
                                                                            setSelectedRows(newSet);
                                                                        }}
                                                                    />
                                                                </td>
                                                                <td className="p-6 text-gray-400 font-medium" onClick={() => setDrawerReport(report)}>
                                                                    {new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </td>
                                                                <td className="p-6" onClick={() => setDrawerReport(report)}>
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-100">
                                                                        <span>{CAT_EMOJI[report.category] || '📍'}</span>
                                                                        {report.category}
                                                                    </span>
                                                                </td>
                                                                <td className="p-6" onClick={() => setDrawerReport(report)}>
                                                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-md border ${DEPT_COLORS[report.department || 'GENERAL']}`}>
                                                                        {report.department || 'GENERAL'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-6 max-w-xs text-gray-500 font-medium" onClick={() => setDrawerReport(report)}>
                                                                    <div className="truncate group-hover:text-black transition-colors">
                                                                        {report.description || <span className="italic text-gray-300">No description provided</span>}
                                                                    </div>
                                                                </td>
                                                                <td className="p-6" onClick={() => setDrawerReport(report)}>
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className={`w-1.5 h-1.5 rounded-full ${(report.priority_score || 0) > 20 ? 'bg-red-500 animate-pulse' : (report.priority_score || 0) > 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                                        />
                                                                        <span className="text-sm font-semibold text-gray-700">{Math.round(report.priority_score || 0)}</span>
                                                                        <span className="text-[10px] text-gray-400 font-bold">👍 {report.vote_count ?? 0}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-6" onClick={() => setDrawerReport(report)}>
                                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${report.status === 'OPEN' ? 'bg-red-50 text-red-600 border-red-100' : report.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                                        <span className={`w-1 h-1 rounded-full ${report.status === 'OPEN' ? 'bg-red-500' : report.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-green-500'}`} />
                                                                        {report.status === 'IN_PROGRESS' ? 'PENDING' : report.status}
                                                                    </div>
                                                                </td>
                                                                <td className="p-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                                    <select
                                                                        value={report.status}
                                                                        onChange={(e) => updateStatus(report.id, e.target.value as any)}
                                                                        className="text-[10px] font-bold uppercase tracking-wide bg-gray-50 border border-gray-100 text-gray-500 rounded-md px-3 py-2 outline-none cursor-pointer hover:bg-white transition-all"
                                                                    >
                                                                        <option value="OPEN">Open</option>
                                                                        <option value="IN_PROGRESS">Pending</option>
                                                                        <option value="RESOLVED">Resolved</option>
                                                                    </select>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                            {filteredReports.length === 0 && (
                                                <div className="p-16 text-center text-gray-400 flex flex-col items-center">
                                                    <div className="bg-gray-50 p-6 rounded-full inline-block mb-4">
                                                        <CheckCircle className="w-12 h-12 text-gray-300" />
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">No reports found</h3>
                                                    <p className="text-sm">Try changing your filters or check back later.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                <ReportDetailDrawer
                    isOpen={!!drawerReport}
                    onClose={() => setDrawerReport(null)}
                    report={drawerReport}
                    currentUserId={currentUserId}
                />
            </main>
        </div>
    );
}
