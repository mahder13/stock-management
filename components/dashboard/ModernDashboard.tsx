"use client";

import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import Link from "next/link";
import { Package, Truck, ArrowRight, Share2, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import StockMovementModal from "./StockMovementModal";

interface DashboardData {
    totalInventories: number;
    received: number;
    onHand: number;
    shipped: number;
    monthlyStats: any[];
    shipmentStats: any[];
}

const BlueMetricCard = ({
    icon: Icon,
    value,
    label,
    href,
    isLast = false
}: {
    icon: any,
    value: string | number,
    label: string,
    href: string,
    isLast?: boolean
}) => (
    <Link href={href} className="flex-1 min-w-[180px] group cursor-pointer transition-opacity hover:opacity-90">
        <div className="flex flex-col items-center text-center">
            <div className="mb-2 p-3 rounded-full bg-yellow-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="font-extrabold text-3xl text-white leading-tight">{value}</div>
            <div className="text-blue-100 text-sm mt-1 group-hover:text-white transition-colors underline-offset-4 group-hover:underline">{label}</div>
        </div>
        {!isLast && (
            <div className="hidden lg:block absolute right-0 top-1/2 translate-y-[-50%] text-white pointer-events-none">
                <ArrowRight className="w-5 h-5" />
            </div>
        )}
    </Link>
);

export default function ModernDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
    const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prodRes, moveRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/stock")
                ]);

                const products = await prodRes.json();
                const movements = await moveRes.json();

                // 1. Calculate Aggregates
                const currentStock = products.reduce((acc: number, p: any) => acc + p.quantity, 0);

                // Calculate Totals from Movements
                const receivedTotal = movements
                    .filter((m: any) => m.type === 'IN')
                    .reduce((acc: number, m: any) => acc + m.quantity, 0);

                const shippedTotal = movements
                    .filter((m: any) => m.type === 'OUT')
                    .reduce((acc: number, m: any) => acc + m.quantity, 0);

                // Total Inventories (Sum of everything that ever came in? Or just current + shipped? 
                // The design says "Total Inventories" -> "Received" -> "On Hand" -> "Shipped" flow.
                // Let's assume Total Inventories = Received (Total Input).
                const totalInventories = receivedTotal; // Or currentStock + shippedTotal potentially

                // 2. Prepare Monthly Chart Data
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthlyData = months.map(month => ({
                    name: month,
                    received: 0,
                    onHand: 0, // We need to calculate this properly or approximate
                    shipped: 0,
                }));

                // Simple bucket by month string (assuming date format)
                movements.forEach((m: any) => {
                    const date = new Date(m.createdAt);
                    const monthIdx = date.getMonth(); // 0-11
                    const qty = m.quantity;

                    if (m.type === 'IN') {
                        monthlyData[monthIdx].received += qty;
                    } else if (m.type === 'OUT') {
                        monthlyData[monthIdx].shipped += qty;
                    }
                });

                // Calculate cumulative "On Hand" for each month
                // Starting with base 0? Or do we have an initial stock?
                // Let's assume onHand = cumulative received - cumulative shipped
                let runningBalance = 0;
                monthlyData.forEach(item => {
                    runningBalance += (item.received - item.shipped);
                    // Ensure it doesn't go below 0 (data anomaly protection)
                    item.onHand = Math.max(0, runningBalance);
                });

                // 3. Prepare Shipment Data (Stock Out Reasons)
                const shipmentStatsMap = new Map<string, number>();
                movements
                    .filter((m: any) => m.type === 'OUT')
                    .forEach((m: any) => {
                        const reason = m.reason || "Unspecified";
                        shipmentStatsMap.set(reason, (shipmentStatsMap.get(reason) || 0) + m.quantity);
                    });

                let shipmentStats = Array.from(shipmentStatsMap.entries()).map(([name, value], index) => {
                    // Generate colors dynamically or use a preset palette
                    const colors = ['#fbbf24', '#3b82f6', '#1e40af', '#ef4444', '#10b981', '#8b5cf6'];
                    return {
                        name,
                        value,
                        color: colors[index % colors.length]
                    };
                });

                // If no data, show a placeholder to avoid empty chart
                if (shipmentStats.length === 0) {
                    shipmentStats = [{ name: 'No Data', value: 1, color: '#e2e8f0' }];
                }

                setData({
                    totalInventories: totalInventories,
                    received: receivedTotal,
                    onHand: currentStock,
                    shipped: shippedTotal,
                    monthlyStats: monthlyData.slice(0, 7), // Just showing Jan-Jul like design or dynamic
                    shipmentStats: shipmentStats
                });

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-2 md:p-6 space-y-6 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">Inventory Dashboard</h1>
                    <p className="text-slate-500 text-sm max-w-2xl">
                        Inventory management dashboard overview.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setMovementType("IN");
                            setIsMovementModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
                    >
                        <ArrowUpCircle size={20} />
                        QUICK IN
                    </button>
                    <button
                        onClick={() => {
                            setMovementType("OUT");
                            setIsMovementModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg shadow-rose-200 transition-all active:scale-95"
                    >
                        <ArrowDownCircle size={20} />
                        QUICK OUT
                    </button>
                    <Link
                        href="/dashboard/products?new=true"
                        className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        NEW PRODUCT
                    </Link>
                </div>
            </div>

            <StockMovementModal
                isOpen={isMovementModalOpen}
                onClose={() => setIsMovementModalOpen(false)}
                defaultType={movementType}
                onSuccess={() => {
                    setLoading(true);
                    window.location.reload();
                }}
            />

            {/* Blue Metrics Row */}
            <div className="bg-blue-900 rounded-none md:rounded-lg py-8 px-6 shadow-lg text-white">
                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-blue-800/50">
                    <div className="flex items-center justify-between w-full gap-6">
                        <BlueMetricCard
                            icon={Package}
                            value={data?.totalInventories.toLocaleString() || "0"}
                            label="Total Inventories"
                            href="/dashboard/products"
                        />
                        <div className="hidden lg:block w-px h-16 bg-blue-800/30" />
                        <BlueMetricCard
                            icon={Share2}
                            value={data?.received.toLocaleString() || "0"}
                            label="Received"
                            href="/dashboard/history"
                        />
                        <div className="hidden lg:block w-px h-16 bg-blue-800/30" />
                        <BlueMetricCard
                            icon={Package}
                            value={data?.onHand.toLocaleString() || "0"}
                            label="On Hand"
                            href="/dashboard/products"
                        />
                        <div className="hidden lg:block w-px h-16 bg-blue-800/30" />
                        <BlueMetricCard
                            icon={Truck}
                            value={data?.shipped.toLocaleString() || "0"}
                            label="Shipped"
                            href="/dashboard/history"
                            isLast
                        />
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                {/* Inventory Status Bar Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                    <div className="text-center mb-6">
                        <div className="inline-block px-6 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                            <h3 className="text-blue-900 font-bold">Inventory Status</h3>
                        </div>
                    </div>

                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.monthlyStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="square" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="received" name="Received" fill="#fbbf24" radius={[2, 2, 0, 0]} barSize={12} />
                                <Bar dataKey="onHand" name="Inventory on Hand" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={12} />
                                <Bar dataKey="shipped" name="Shipped" fill="#1e3a8a" radius={[2, 2, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Shipment Status Donut Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-100">
                    <div className="text-center mb-6">
                        <div className="inline-block px-6 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
                            <h3 className="text-blue-900 font-bold">Stock Out Reasons</h3>
                        </div>
                    </div>

                    <div className="relative h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.shipmentStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={0}
                                    dataKey="value"
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    {data?.shipmentStats.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Content for Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center mb-2">
                                <Truck className="w-8 h-8 text-slate-800" />
                            </div>
                        </div>
                        {/* Numeric labels similar to design */}
                        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 flex flex-col items-start gap-4 pointer-events-none">
                            {data?.shipmentStats.map((item: any, i: number) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                                    <div className="text-sm font-bold text-slate-700">{item.value.toLocaleString()}</div>
                                    <div className="text-xs text-slate-400">{item.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <div className="text-center pt-8 text-slate-400 text-xs">
                This slide is 100% editable. Adapt it to your needs and capture your audience&apos;s attention.
            </div>
        </div>
    );
}
