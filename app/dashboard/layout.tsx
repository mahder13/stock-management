import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar user={session.user} />
            <div className="flex-1 overflow-auto">
                <header className="h-16 border-b bg-white flex items-center px-8 sticky top-0 z-30 shadow-sm">
                    <div className="flex-1">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Stock Management System</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">Next.js 15 + Prisma 7 + PostgreSQL</p>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
