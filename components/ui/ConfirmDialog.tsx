"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning";
    loading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you absolutely sure?",
    description = "This action cannot be undone. This will permanently delete this item and remove the data from our servers.",
    confirmLabel = "Continue",
    cancelLabel = "Cancel",
    variant = "danger",
    loading = false,
}: ConfirmDialogProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Focus cancel button when dialog opens
    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => cancelRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-6 space-y-4">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-4">
                        <div
                            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                variant === "danger"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-amber-100 text-amber-600"
                            }`}
                        >
                            <AlertTriangle size={20} />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">
                                {title}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-100">
                    <button
                        ref={cancelRef}
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all focus:outline-none focus:ring-2 disabled:opacity-50 flex items-center gap-2 ${
                            variant === "danger"
                                ? "bg-red-600 hover:bg-red-700 focus:ring-red-300"
                                : "bg-amber-600 hover:bg-amber-700 focus:ring-amber-300"
                        }`}
                    >
                        {loading && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
