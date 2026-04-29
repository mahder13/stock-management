"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    Truck,
    History,
    Settings,
    ChevronRight,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogoutButton from "@/components/auth/LogoutButton";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Products", href: "/dashboard/products" },
    { icon: Truck, label: "Suppliers", href: "/dashboard/suppliers" },
    { icon: History, label: "Stock History", href: "/dashboard/history" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();

    return (
        <div className="w-64 bg-emerald-900 h-screen sticky top-0 flex flex-col text-emerald-50 shadow-2xl overflow-hidden">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3 bg-emerald-950/50">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight uppercase tracking-widest">Stock</h1>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Management System</p>
                </div>
            </div>

            {/* User Info */}
            <div className="px-6 py-6 border-b border-emerald-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-emerald-100 border-2 border-emerald-600/50 shadow-inner">
                        {user?.name?.[0] || user?.email?.[0] || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{user?.name || "User"}</p>
                        <p className="text-[10px] text-emerald-400 font-medium uppercase">{user?.role || "Staff"}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/40"
                                    : "hover:bg-emerald-800/40 text-emerald-300 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={cn(isActive ? "text-white" : "text-emerald-500 group-hover:text-emerald-400")} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </div>
                            {isActive && <ChevronRight size={14} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 bg-emerald-950/30">
                <LogoutButton className="w-full justify-start gap-3 px-4 py-3 bg-transparent hover:bg-emerald-800/50 text-emerald-300 hover:text-white rounded-xl transition-all border border-emerald-800/30" />
            </div>
        </div>
    );
}
