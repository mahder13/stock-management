"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
    className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
                "flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm",
                className
            )}
        >
            <LogOut size={18} />
            <span>Logout</span>
        </button>
    );
}
