'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, CheckCircle, Clock, AlertCircle, RefreshCw,
    BarChart3, Users, Zap, TrendingUp, Building2
} from 'lucide-react';
import { Report } from '@/types';
import toast from 'react-hot-toast';

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
    icon, label, value, sub, color
}: {
    icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string;
}) {
    return (
        <div className={`rounded-2xl p-5 border ${color} flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-semibold opacity-70">{label}</span>
                <span className="opacity-60">{icon}</span>
            </div>
            <div className="text-3xl font-extrabold">{value}</div>
            {sub && <div className="text-xs opacity-60">{sub}</div>}
        </div>
    );
}

export default function AdminDashboard() {
    const [reports, setReports] = useState<Report[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
    const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');
    const router = useRouter();

    useEffect(() => {
        const isAdmin = sessionStorage.getItem('isAdmin');
        if (!isAdmin) {
            toast.error('Unauthorized access');
            router.push('/');
        }
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [reportsRes, analyticsRes] = await Promise.all([
                fetch('/api/reports'),
                fetch('/api/analytics'),
            ]);

            if (reportsRes.ok) setReports(await reportsRes.json());
            if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const updateStatus = async (reportId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
        try {
            const res = await fetch(`/api/reports/${reportId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update');

            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));

            // Refresh analytics after status change
            fetch('/api/analytics').then(r => r.json()).then(setAnalytics);

            toast.success(`✅ Status updated to ${newStatus}`);
        } catch {
            toast.error('Failed to update status');
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

    const filteredReports = reports.filter(r => filter === 'ALL' || r.status === filter);

    const resolveRate = analytics
        ? Math.round((analytics.resolved / Math.max(analytics.total, 1)) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/map" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-xs text-gray-500">CivicPulse Command Center</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Tab Toggle */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                    {(['reports', 'analytics'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'analytics' ? '📊 Analytics' : '📋 Reports'}
                        </button>
                    ))}
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
                                sub="All time"
                                color="bg-blue-50 border-blue-100 text-blue-900"
                            />
                            <StatCard
                                icon={<AlertCircle className="w-5 h-5" />}
                                label="Open Issues"
                                value={analytics?.open ?? '—'}
                                sub="Needs attention"
                                color="bg-red-50 border-red-100 text-red-900"
                            />
                            <StatCard
                                icon={<Clock className="w-5 h-5" />}
                                label="In Progress"
                                value={analytics?.in_progress ?? '—'}
                                sub="Being handled"
                                color="bg-amber-50 border-amber-100 text-amber-900"
                            />
                            <StatCard
                                icon={<CheckCircle className="w-5 h-5" />}
                                label="Resolved"
                                value={analytics?.resolved ?? '—'}
                                sub={`${resolveRate}% resolve rate`}
                                color="bg-green-50 border-green-100 text-green-900"
                            />
                        </div>

                        {/* Second Row KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard
                                icon={<Zap className="w-5 h-5" />}
                                label="Avg Resolution Time"
                                value={analytics?.avg_resolution_hours ? `${analytics.avg_resolution_hours}h` : 'N/A'}
                                sub="Hours from assign → resolve"
                                color="bg-purple-50 border-purple-100 text-purple-900"
                            />
                            <StatCard
                                icon={<TrendingUp className="w-5 h-5" />}
                                label="Resolution Rate"
                                value={`${resolveRate}%`}
                                sub="Resolved vs total"
                                color="bg-indigo-50 border-indigo-100 text-indigo-900"
                            />
                            <StatCard
                                icon={<Users className="w-5 h-5" />}
                                label="Backlog"
                                value={(analytics?.open ?? 0) + (analytics?.in_progress ?? 0)}
                                sub="Open + In Progress"
                                color="bg-gray-50 border-gray-200 text-gray-900"
                            />
                        </div>

                        {/* Category & Department Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* By Category */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">📦 By Category</h3>
                                <div className="space-y-3">
                                    {analytics?.by_category.map(item => {
                                        const pct = Math.round((item.count / Math.max(analytics.total, 1)) * 100);
                                        return (
                                            <div key={item.category}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="font-medium">
                                                        {CAT_EMOJI[item.category] || '📍'} {item.category}
                                                    </span>
                                                    <span className="text-gray-500">{item.count} ({pct}%)</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
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
                                    {analytics?.by_department.map(dept => (
                                        <div key={dept.department} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                            <div>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DEPT_COLORS[dept.department] || 'bg-gray-100 text-gray-700'}`}>
                                                    {dept.department}
                                                </span>
                                                <div className="text-xs text-gray-500 mt-1">{dept.total} total</div>
                                            </div>
                                            <div className="text-right text-xs space-y-0.5">
                                                <div className="text-red-600 font-semibold">{dept.open_count} open</div>
                                                <div className="text-green-600 font-semibold">{dept.resolved} resolved</div>
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
                                        return analytics.trends.map(t => (
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
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${filter === s
                                            ? 'bg-black text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        {label}
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-base font-semibold text-gray-700">Manage Reports</h2>
                                <span className="text-sm text-gray-400">{filteredReports.length} shown</span>
                            </div>

                            {loading ? (
                                <div className="p-12 text-center text-gray-400">
                                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    Loading reports...
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 font-medium">Date</th>
                                                <th className="p-4 font-medium">Category</th>
                                                <th className="p-4 font-medium">Department</th>
                                                <th className="p-4 font-medium">Description</th>
                                                <th className="p-4 font-medium">Priority</th>
                                                <th className="p-4 font-medium">Votes</th>
                                                <th className="p-4 font-medium">Status</th>
                                                <th className="p-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredReports.map((report) => (
                                                <tr key={report.id} className="hover:bg-gray-50/70 transition-colors">
                                                    <td className="p-4 text-gray-500 whitespace-nowrap">
                                                        {new Date(report.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {CAT_EMOJI[report.category]} {report.category}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DEPT_COLORS[report.department || 'GENERAL']}`}>
                                                            {report.department || 'GENERAL'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 max-w-xs truncate text-gray-700" title={report.description}>
                                                        {report.description || <span className="italic text-gray-400">No description</span>}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1">
                                                            <div
                                                                className={`w-2 h-2 rounded-full ${(report.priority_score || 0) > 20 ? 'bg-red-500' : (report.priority_score || 0) > 10 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                            />
                                                            <span className="text-xs font-mono text-gray-600">{report.priority_score ?? 0}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 font-semibold text-gray-700">
                                                        👍 {report.vote_count ?? 0}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                            {report.status === 'IN_PROGRESS' ? 'PENDING' : report.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                onClick={() => updateStatus(report.id, 'OPEN')}
                                                                className={`p-1.5 rounded-lg transition-colors ${report.status === 'OPEN' ? 'bg-red-100 text-red-600' : 'hover:bg-red-50 text-red-400'}`}
                                                                title="Mark as Open"
                                                            >
                                                                <AlertCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(report.id, 'IN_PROGRESS')}
                                                                className={`p-1.5 rounded-lg transition-colors ${report.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-600' : 'hover:bg-amber-50 text-amber-400'}`}
                                                                title="Mark as In Progress"
                                                            >
                                                                <Clock className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(report.id, 'RESOLVED')}
                                                                className={`p-1.5 rounded-lg transition-colors ${report.status === 'RESOLVED' ? 'bg-green-100 text-green-600' : 'hover:bg-green-50 text-green-400'}`}
                                                                title="Mark Resolved"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredReports.length === 0 && (
                                        <div className="p-12 text-center text-gray-400">
                                            No reports found for this filter.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
