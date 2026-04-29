"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, Package, Edit2, Trash2, X, AlertTriangle, Filter, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface Supplier {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string | null;
    sku: string;
    price: number;
    quantity: number;
    minStockLevel: number;
    supplierId: string | null;
    supplier: { name: string } | null;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterLowStock, setFilterLowStock] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        sku: "",
        price: "",
        quantity: "0",
        minStockLevel: "5",
        supplierId: "",
    });

    const fetchData = async () => {
        try {
            const [prodRes, suppRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/suppliers"),
            ]);
            const [prodData, suppData] = await Promise.all([prodRes.json(), suppRes.json()]);
            setProducts(prodData);
            setSuppliers(suppData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        fetchData();
        if (searchParams.get('new')) {
            setIsModalOpen(true);
            router.replace('/dashboard/products');
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingProduct ? "PATCH" : "POST";
        const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingProduct(null);
                setFormData({ name: "", description: "", sku: "", price: "", quantity: "0", minStockLevel: "5", supplierId: "" });
                fetchData();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save product");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/products/${deleteTarget}`, { method: "DELETE" });
            if (res.ok) fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());
        const isLowStock = p.quantity <= p.minStockLevel;
        return matchesSearch && (!filterLowStock || isLowStock);
    });

    const lowStockCount = products.filter(p => p.quantity <= p.minStockLevel).length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Products</h1>
                    <p className="text-slate-500 font-medium">Manage your inventory and stock levels</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({ name: "", description: "", sku: "", price: "", quantity: "0", minStockLevel: "5", supplierId: "" });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    ADD PRODUCT
                </button>
            </div>

            {/* Stats Quick View */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
                        <p className="text-2xl font-black text-slate-900">{products.length}</p>
                    </div>
                </div>

                <div className={cn(
                    "p-6 rounded-3xl shadow-sm border flex items-center gap-4 transition-colors",
                    lowStockCount > 0 ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-white border-slate-100"
                )}>
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        lowStockCount > 0 ? "bg-amber-200 text-amber-900" : "bg-slate-50 text-slate-400"
                    )}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-60">Low Stock Alerts</p>
                        <p className="text-2xl font-black">{lowStockCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm text-slate-900"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setFilterLowStock(!filterLowStock)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                            filterLowStock
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
                        )}
                    >
                        <Filter size={16} />
                        {filterLowStock ? "Showing Low Stock" : "Filter Low Stock"}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Product Info</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">SKU</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Level</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price / Supplier</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">Loading products...</td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic">No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900">{product.name}</div>
                                            <div className="text-xs text-slate-400 font-medium line-clamp-1 max-w-[200px]">{product.description || "No description"}</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg tracking-wider">
                                                {product.sku}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 w-24 bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className={cn(
                                                            "h-2 rounded-full transition-all",
                                                            product.quantity <= product.minStockLevel ? "bg-amber-500" : "bg-emerald-500"
                                                        )}
                                                        style={{ width: `${Math.min((product.quantity / (product.minStockLevel * 4)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-black",
                                                    product.quantity <= product.minStockLevel ? "text-amber-600" : "text-emerald-700"
                                                )}>
                                                    {product.quantity}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Min: {product.minStockLevel}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900">${product.price.toFixed(2)}</div>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                                                <Truck size={12} />
                                                {product.supplier?.name || "No supplier"}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(product);
                                                        setFormData({
                                                            name: product.name,
                                                            description: product.description || "",
                                                            sku: product.sku,
                                                            price: product.price.toString(),
                                                            quantity: product.quantity.toString(),
                                                            minStockLevel: product.minStockLevel.toString(),
                                                            supplierId: product.supplierId || "",
                                                        });
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(product.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">Manage product details and stock</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Product Name</label>
                                        <input
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-900"
                                            placeholder="e.g. Mechanical Keyboard"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">SKU (Unique Code)</label>
                                        <input
                                            required
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium uppercase tracking-widest text-slate-900"
                                            placeholder="e.g. KB-2023-001"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Supplier</label>
                                        <select
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium appearance-none text-slate-900"
                                            value={formData.supplierId}
                                            onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                        >
                                            <option value="">Select a supplier</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Price ($)</label>
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-900"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Current Stock</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-900"
                                                placeholder="0"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Min Stock Level (Alert)</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-900"
                                            placeholder="5"
                                            value={formData.minStockLevel}
                                            onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                        <textarea
                                            rows={3}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium resize-none text-slate-900"
                                            placeholder="Product details..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95"
                                >
                                    {editingProduct ? "UPDATE PRODUCT" : "CREATE PRODUCT"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete this product?"
                description="This action cannot be undone. This will permanently delete the product and all associated stock movement records from the database."
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
    );
}
