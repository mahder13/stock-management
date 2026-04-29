"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    sku: string;
    quantity: number;
}

interface StockMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultType: "IN" | "OUT";
    onSuccess: () => void;
}

export default function StockMovementModal({ isOpen, onClose, defaultType, onSuccess }: StockMovementModalProps) {
    const [type, setType] = useState<"IN" | "OUT">(defaultType);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        productId: "",
        quantity: "",
        reason: "",
    });

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setType(defaultType);
            setFormData({ productId: "", quantity: "", reason: "" });
            fetchProducts();
        }
    }, [isOpen, defaultType]);

    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const res = await fetch("/api/products");
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: formData.productId,
                    type,
                    quantity: parseInt(formData.quantity),
                    reason: formData.reason,
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                let errorMessage = "Failed to update stock";
                try {
                    const error = await res.json();
                    errorMessage = error.error || errorMessage;
                } catch (e) {
                    console.error("Failed to parse error response", e);
                }
                alert(errorMessage);
            }
        } catch (error) {
            console.error("Stock update failed", error);
            alert("An unexpected error occurred. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const selectedProduct = products.find(p => p.id === formData.productId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            Record Stock {type === "IN" ? "In" : "Out"}
                        </h2>
                        <p className="text-slate-400 text-xs font-medium">Adjust inventory levels</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Type Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType("IN")}
                            className={cn(
                                "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                type === "IN" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <ArrowUpCircle size={16} /> Stock In
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("OUT")}
                            className={cn(
                                "flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                                type === "OUT" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <ArrowDownCircle size={16} /> Stock Out
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Select Product</label>
                            {loadingProducts ? (
                                <div className="w-full px-5 py-4 bg-slate-50 rounded-2xl text-slate-400 text-sm flex items-center gap-2">
                                    <Loader2 className="animate-spin" size={14} /> Loading products...
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <select
                                        required
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium appearance-none text-slate-900"
                                        value={formData.productId}
                                        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    >
                                        <option value="">Choose a product...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (Qty: {p.quantity})</option>
                                        ))}
                                    </select>
                                    {selectedProduct && (
                                        <div className="px-2 text-xs text-slate-400 font-medium">
                                            Current Stock: <span className="text-slate-900 font-bold">{selectedProduct.quantity}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Quantity</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                placeholder="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Reason (Optional)</label>
                            <input
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900"
                                placeholder="e.g. New Shipment, Damaged Goods..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={cn(
                            "w-full py-4 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2",
                            type === "IN"
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                                : "bg-rose-600 hover:bg-rose-700 shadow-rose-100",
                            submitting && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {submitting && <Loader2 className="animate-spin" size={18} />}
                        {type === "IN" ? "CONFIRM STOCK IN" : "CONFIRM STOCK OUT"}
                    </button>
                </form>
            </div>
        </div>
    );
}
