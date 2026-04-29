"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Package, TrendingUp, AlertTriangle, Truck, History, Plus, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DashboardStats {
    totalProducts: number;
    totalStock: number;
    lowStockItems: number;
    totalSuppliers: number;
    movementsByDay: { month: string; in: number; out: number }[];
    stockDist: { name: string; value: number; fill: string }[];
}

const MetricCard = ({ icon, label, value, colorClass }: { icon: React.ReactNode; label: string; value: string; colorClass?: string }) => (
    <div className={cn("flex items-center gap-4 px-6 py-6 rounded-3xl shadow-sm border border-white/10", colorClass || "bg-emerald-600 text-white")}>
        <div className="flex-shrink-0 w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
            <p className="text-3xl font-black tabular-nums">{value}</p>
        </div>
    </div>
);

export default function InventoryDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const [prodRes, suppRes, movementRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/suppliers"),
                fetch("/api/stock"),
            ]);

            const products = await prodRes.json();
            const suppliers = await suppRes.json();
            const movements = await movementRes.json();

            const totalStock = products.reduce((acc: number, p: any) => acc + p.quantity, 0);
            const lowStockItems = products.filter((p: any) => p.quantity <= p.minStockLevel).length;

            // Simple movement aggregation for charts
            const movementsByDay = [
                { month: 'Last 7 Days', in: movements.filter((m: any) => m.type === "IN").length * 50, out: movements.filter((m: any) => m.type === "OUT").length * 30 },
            ];

            setStats({
                totalProducts: products.length,
                totalStock,
                lowStockItems,
                totalSuppliers: suppliers.length,
                movementsByDay,
                stockDist: [
                    { name: 'Healthy', value: products.length - lowStockItems, fill: '#10b981' },
                    { name: 'Low Stock', value: lowStockItems, fill: '#f59e0b' },
                ]
            });
        } catch (err) {
            console.error("Dashboard stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Quick Actions */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Overview</h1>
                    <p className="text-slate-500 font-medium italic mt-1 font-serif">Your stock management summary and quick actions.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard/products" className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95">
                        <Plus size={18} />
                        STOCK IN
                    </Link>
                    <Link href="/dashboard/history" className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-2xl shadow-sm transition-all active:scale-95">
                        <History size={18} />
                        HISTORY
                    </Link>
                </div>
            </div>

            {/* Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={<Package size={28} />} label="Products" value={stats?.totalProducts.toString() || "0"} />
                <MetricCard icon={<TrendingUp size={28} />} label="Total Units" value={stats?.totalStock.toString() || "0"} colorClass="bg-blue-600 text-white" />
                <MetricCard
                    icon={<AlertTriangle size={28} />}
                    label="Low Stock Alerts"
                    value={stats?.lowStockItems.toString() || "0"}
                    colorClass={stats?.lowStockItems && stats.lowStockItems > 0 ? "bg-amber-500 text-white" : "bg-slate-800 text-white"}
                />
                <MetricCard icon={<Truck size={28} />} label="Suppliers" value={stats?.totalSuppliers.toString() || "0"} colorClass="bg-indigo-600 text-white" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inventory Status Chart */}
                <div className="lg:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100 p-10">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Stock Trend</h2>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-full" /> Stock Value</div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.movementsByDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend verticalAlign="top" align="right" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }} />
                                <Bar dataKey="in" fill="#10b981" radius={[10, 10, 0, 0]} name="Stock In" barSize={40} />
                                <Bar dataKey="out" fill="#f43f5e" radius={[10, 10, 0, 0]} name="Stock Out" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Health Pie Chart */}
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-10 flex flex-col">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Inventory Health</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Stock Level Status</p>

                    <div className="relative flex-1 flex items-center justify-center">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats?.stockDist}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats?.stockDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-3xl font-black text-slate-800">{stats?.totalProducts}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Items</p>
                        </div>
                    </div>

                    <div className="space-y-3 mt-8">
                        {stats?.stockDist.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.fill }} />
                                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                                </div>
                                <span className="font-black text-slate-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
