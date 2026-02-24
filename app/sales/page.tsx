'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard, Briefcase, Users, Network, BarChart2, Blocks,
    Settings, HelpCircle, Search, Download, Plus, LayoutGrid, List,
    Filter, MoreVertical, ChevronLeft, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownRight, Menu, X
} from 'lucide-react';

// --- Mock Data ---

const KPI_DATA = [
    { title: 'Total Active Accounts', value: '142', trend: '+12.5%', isPositive: true },
    { title: 'Pipeline Value', value: '$845,000', trend: '+8.2%', isPositive: true },
    { title: 'New Leads (This Week)', value: '38', trend: '-2.4%', isPositive: false },
    { title: 'Conversion Rate', value: '18.4%', trend: '+4.1%', isPositive: true },
];

const ACCOUNT_DATA = [
    { id: '1', name: 'Acme Corp', logo: 'A', bgColor: 'bg-blue-100 text-blue-600', contactName: 'Sarah Jenkins', contactEmail: 'sarah.j@acme.com', stage: 'Negotiation', mrr: '$4,500', status: 'Active', lastActivity: 'Oct 24, 2024' },
    { id: '2', name: 'Globex Inc', logo: 'G', bgColor: 'bg-indigo-100 text-indigo-600', contactName: 'Michael Chen', contactEmail: 'm.chen@globex.io', stage: 'Discovery', mrr: '$1,200', status: 'In Progress', lastActivity: 'Oct 23, 2024' },
    { id: '3', name: 'Soylent Co', logo: 'S', bgColor: 'bg-green-100 text-green-600', contactName: 'Emily Watson', contactEmail: 'emily@soylent.co', stage: 'Won', mrr: '$8,900', status: 'Active', lastActivity: 'Oct 22, 2024' },
    { id: '4', name: 'Initech', logo: 'I', bgColor: 'bg-purple-100 text-purple-600', contactName: 'Bill Lumbergh', contactEmail: 'bill@initech.com', stage: 'Proposal', mrr: '$3,400', status: 'In Progress', lastActivity: 'Oct 21, 2024' },
    { id: '5', name: 'Massive Dynamic', logo: 'M', bgColor: 'bg-red-100 text-red-600', contactName: 'Nina Sharp', contactEmail: 'n.sharp@massive.com', stage: 'Lost', mrr: '$0', status: 'Churned', lastActivity: 'Oct 18, 2024' },
    { id: '6', name: 'Hooli', logo: 'H', bgColor: 'bg-yellow-100 text-yellow-600', contactName: 'Gavin Belson', contactEmail: 'gavin@hooli.com', stage: 'Discovery', mrr: '$12,000', status: 'In Progress', lastActivity: 'Oct 15, 2024' },
];

const SIDEBAR_LINKS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '#' },
    { icon: Briefcase, label: 'Sales Center', href: '#', active: true },
    { icon: Users, label: 'Leads', href: '#' },
    { icon: Network, label: 'Pipelines', href: '#' },
    { icon: BarChart2, label: 'Reports', href: '#' },
    { icon: Blocks, label: 'Integrations', href: '#' },
];

export default function SalesManagementApp() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    return (
        <div className="flex h-screen bg-[#F9FAFB] text-[#111827] font-sans overflow-hidden">
            {/* --- Mobile Sidebar Overlay --- */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- Sidebar Navigation --- */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
                flex flex-col transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Brand Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#111827]">Keitoto<span className="text-[#2563EB]">.</span></span>
                    </div>
                    {/* Mobile Close Button */}
                    <button className="ml-auto md:hidden text-gray-400 hover:text-gray-900" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Primary Links */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Menu</div>
                    {SIDEBAR_LINKS.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${link.active
                                ? 'bg-[#2563EB]/10 text-[#2563EB]'
                                : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#111827]'
                                }`}
                        >
                            <link.icon className={`w-5 h-5 ${link.active ? 'text-[#2563EB]' : 'text-gray-400'}`} />
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Secondary Links & Profile */}
                <div className="p-4 border-t border-gray-100 space-y-1.5">
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] transition-colors">
                        <Settings className="w-5 h-5 text-gray-400" /> Settings
                    </a>
                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] transition-colors">
                        <HelpCircle className="w-5 h-5 text-gray-400" /> Help Center
                    </a>

                    <div className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            AW
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#111827] truncate">Alex Wong</p>
                            <p className="text-xs text-[#6B7280] truncate">Sales Director</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- Main Content Area --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 relative z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <button className="md:hidden text-gray-500 hover:text-gray-900" onClick={() => setIsSidebarOpen(true)}>
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden sm:flex text-sm">
                            <span className="text-[#6B7280]">Sales Center</span>
                            <span className="mx-2 text-gray-300">/</span>
                            <span className="font-semibold text-[#111827]">Accounts</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
                        {/* Global Search */}
                        <div className="relative hidden md:block max-w-sm w-full">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search accounts, contacts, or IDs..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                            />
                        </div>

                        {/* Action Buttons */}
                        <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-sm font-semibold text-[#374151] rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-[#2563EB]/20">
                            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Account</span>
                        </button>
                    </div>
                </header>

                {/* Main Scrollable Workspace */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

                        <div className="flex items-center justify-between gap-4">
                            <h1 className="text-2xl font-bold text-[#111827]">Accounts Overview</h1>
                        </div>

                        {/* --- Section A: KPI Summary Cards --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {KPI_DATA.map((kpi, index) => (
                                <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <h3 className="text-sm font-semibold text-[#6B7280]">{kpi.title}</h3>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">{kpi.value}</span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-1.5 text-sm">
                                        <div className={`flex items-center gap-0.5 font-medium ${kpi.isPositive ? 'text-[#03543F] bg-[#DEF7EC]' : 'text-[#9B1C1C] bg-[#FDE8E8]'} px-1.5 py-0.5 rounded-md`}>
                                            {kpi.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                            {kpi.trend}
                                        </div>
                                        <span className="text-xs text-[#6B7280]">vs last month</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* --- Section B: Account List Data Table --- */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">

                            {/* Toolbar */}
                            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Search (Mobile visible) */}
                                <div className="relative w-full sm:hidden">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search accounts..."
                                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                                    <button className="flex items-center justify-center gap-2 px-3 py-1.5 border border-gray-200 text-sm font-medium text-[#374151] rounded-md hover:bg-gray-50 whitespace-nowrap">
                                        <Filter className="w-4 h-4" /> Status: All
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-3 py-1.5 border border-gray-200 text-sm font-medium text-[#374151] rounded-md hover:bg-gray-50 whitespace-nowrap">
                                        Owner: Me
                                    </button>
                                </div>

                                {/* View Toggles */}
                                <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-lg shrink-0">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#F9FAFB] border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider w-1/4">Account Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Primary Contact</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Pipeline Stage</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">MRR Value</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Last Activity</th>
                                            <th className="px-6 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {ACCOUNT_DATA.map((account) => (
                                            <tr key={account.id} className="hover:bg-[#F3F4F6] transition-colors group">
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${account.bgColor}`}>
                                                            {account.logo}
                                                        </div>
                                                        <span className="font-semibold text-[#111827] group-hover:text-[#2563EB] transition-colors">{account.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-[#374151]">{account.contactName}</span>
                                                        <span className="text-[#6B7280] text-xs">{account.contactEmail}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="font-medium text-[#4B5563]">{account.stage}</span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="font-semibold text-[#111827]">{account.mrr}</span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    {account.status === 'Active' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DEF7EC] text-[#03543F]">
                                                            Active
                                                        </span>
                                                    )}
                                                    {account.status === 'In Progress' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#92400E]">
                                                            In Progress
                                                        </span>
                                                    )}
                                                    {account.status === 'Churned' && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FDE8E8] text-[#9B1C1C]">
                                                            Churned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 text-[#6B7280]">
                                                    {account.lastActivity}
                                                </td>
                                                <td className="px-6 py-3.5 text-right">
                                                    <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100">
                                                        <MoreVertical className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {ACCOUNT_DATA.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                            <Search className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">No accounts found</h3>
                                                        <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search query.</p>
                                                        <button className="text-[#2563EB] font-medium text-sm hover:underline">Clear Filters</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                                    <span>Showing 1 to 6 of 142 results</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-[#6B7280]">Rows per page:</span>
                                        <select className="border border-gray-200 rounded-md py-1 px-2 text-[#374151] font-medium focus:ring-[#2563EB]">
                                            <option>10</option>
                                            <option>20</option>
                                            <option>50</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1 border border-gray-200 rounded-md text-gray-400 hover:bg-gray-50 disabled:opacity-50">
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button className="p-1 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
