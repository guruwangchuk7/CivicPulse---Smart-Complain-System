'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Report } from '@/types';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const isAdmin = sessionStorage.getItem('isAdmin');
        if (!isAdmin) {
            toast.error('Unauthorized access');
            router.push('/');
        }
    }, [router]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/reports');
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error('Failed to fetch reports', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const updateStatus = async (reportId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') => {
        try {
            const res = await fetch(`/api/reports/${reportId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update');

            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-800';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

    const filteredReports = reports.filter(r => filter === 'ALL' || r.status === filter);

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/map" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['ALL', 'OPEN', 'PENDING', 'RESOLVED'].map((statusLabel) => {
                        const statusKey = statusLabel === 'PENDING' ? 'IN_PROGRESS' : statusLabel;
                        const isActive = filter === statusKey;
                        return (
                            <button
                                key={statusLabel}
                                onClick={() => setFilter(statusKey as any)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive
                                    ? 'bg-black text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {statusLabel}
                            </button>
                        );
                    })}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-700">Manage Reports</h2>
                        <span className="text-sm text-gray-500">{filteredReports.length} Reports</span>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading reports...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Date</th>
                                        <th className="p-4 font-medium">Category</th>
                                        <th className="p-4 font-medium">Description</th>
                                        <th className="p-4 font-medium">Location</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {report.category}
                                                </span>
                                            </td>
                                            <td className="p-4 max-w-xs truncate text-gray-700" title={report.description}>
                                                {report.description}
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                    {report.status === 'IN_PROGRESS' ? 'PENDING' : report.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => updateStatus(report.id, 'OPEN')}
                                                        className="p-1.5 rounded hover:bg-red-100 text-red-600"
                                                        title="Mark as Open"
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(report.id, 'IN_PROGRESS')}
                                                        className="p-1.5 rounded hover:bg-yellow-100 text-yellow-600"
                                                        title="Mark as Pending"
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus(report.id, 'RESOLVED')}
                                                        className="p-1.5 rounded hover:bg-green-100 text-green-600"
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
                            {reports.length === 0 && (
                                <div className="p-12 text-center text-gray-400 bg-gray-50">
                                    No reports found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
