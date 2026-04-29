"use client";

import React, { useState, useEffect } from "react";
import { History, Search, ArrowUpCircle, ArrowDownCircle, Package, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface StockMovement {
    id: string;
    productId: string;
    type: "IN" | "OUT";
    quantity: number;
    reason: string | null;
    createdAt: string;
    product: {
        name: string;
        sku: string;
    };
}

export default function StockHistoryPage() {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchMovements = async () => {
        try {
            const res = await fetch("/api/stock");
            const data = await res.json();
            setMovements(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements();
    }, []);

    const filteredMovements = movements.filter((m) =>
        m.product.name.toLowerCase().includes(search.toLowerCase()) ||
        m.product.sku.toLowerCase().includes(search.toLowerCase()) ||
        m.reason?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Stock History</h1>
                    <p className="text-slate-500 font-medium">Detailed log of all inventory movements</p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by product, SKU or reason..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Movement</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">Loading history...</td>
                                </tr>
                            ) : filteredMovements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">No movements recorded.</td>
                                </tr>
                            ) : (
                                filteredMovements.map((m) => (
                                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-sm text-slate-900 font-bold">
                                                <Calendar size={14} className="text-slate-300" />
                                                {format(new Date(m.createdAt), "MMM d, yyyy")}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase ml-5">
                                                {format(new Date(m.createdAt), "HH:mm a")}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                <Package size={14} className="text-emerald-500" />
                                                {m.product.name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 inline-block px-1.5 py-0.5 rounded ml-5 mt-1">
                                                {m.product.sku}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                                                m.type === "IN"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                                    : "bg-rose-50 text-rose-700 border border-rose-100"
                                            )}>
                                                {m.type === "IN" ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                                                STOCK {m.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={cn(
                                                "text-lg font-black",
                                                m.type === "IN" ? "text-emerald-600" : "text-rose-600"
                                            )}>
                                                {m.type === "IN" ? "+" : "-"}{m.quantity}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {m.reason ? (
                                                <div className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                    <Tag size={14} className="text-slate-300 mt-0.5 shrink-0" />
                                                    {m.reason}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 italic text-sm">No reason provided</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
